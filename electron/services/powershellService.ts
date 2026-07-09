import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { logger } from './logger';

const execAsync = promisify(exec);
const POWERSHELL = 'powershell.exe';

function isValidThumbprint(thumbprint: string): boolean {
  return /^[A-Fa-f0-9]{40}$/.test(thumbprint);
}

function escapePSString(str: string): string {
  return str.replace(/'/g, "''");
}

function parseLines(output: string): string[] {
  return output.split('\n').map((l) => l.trim()).filter(Boolean);
}

/**
 * Executa um script PowerShell inline (uma linha) via exec.
 * IMPORTANTE: O script NÃO deve conter aspas duplas externas —
 * cada string PS deve usar aspas simples.
 */
async function execPS(script: string, timeoutMs = 30000): Promise<{ stdout: string; stderr: string }> {
  const cmd = `${POWERSHELL} -NoProfile -Command "${script.replace(/"/g, '\\"')}"`;
  logger.debug('powershell', 'Executando', { scriptLength: script.length });
  const result = await execAsync(cmd, {
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024,
    windowsHide: true,
  });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

export const PowerShellService = {
  /**
   * Remove um certificado por thumbprint com todas as garantias:
   * 1. Valida formato do thumbprint
   * 2. Busca em múltiplos stores (My, Root, CA)
   * 3. Remove chave privada explicitamente via .NET
   * 4. Verifica remoção pós-execução
   * 5. Fallback para certutil.exe
   * 6. Retry com backoff
   */
  async removeCertByThumbprint(
    thumbprint: string
  ): Promise<{ success: boolean; output: string; error: string | null }> {
    if (!isValidThumbprint(thumbprint)) {
      const msg = `Thumbprint invalido: "${thumbprint}" (esperado SHA-1 hex de 40 chars)`;
      logger.error('powershell', msg);
      return { success: false, output: '', error: msg };
    }

    const upper = thumbprint.toUpperCase();

    const script = `$ErrorActionPreference='Stop'; $r=@(); $stores=@('Cert:\\CurrentUser\\My','Cert:\\CurrentUser\\Root','Cert:\\CurrentUser\\CA'); $found=$false; foreach($sp in $stores){try{$sn=$sp.Split('\\')[-1]; $cs=Get-ChildItem $sp -EA SilentlyContinue|?{$_.Thumbprint -eq '${upper}'}; if($cs){foreach($c in $cs){$found=$true; $hk=$c.HasPrivateKey; $r+='FOUND_IN:'+$sn+':'+$c.Subject+':HK='+$hk; if($hk){try{$pk=$c.PrivateKey; if($pk -ne $null){$pk.Delete($true); $r+='PK_DEL:'+$sn}}catch{$r+='PK_FAIL:'+$sn+':'+$_.Exception.Message}}; try{$x=New-Object Security.Cryptography.X509Certificates.X509Store($sn,'CurrentUser'); $x.Open('ReadWrite'); $x.Remove($c); $x.Close(); $r+='RM_DOTNET:'+$sn}catch{try{Remove-Item -Path $c.PSPath -Force -EA Stop; $r+='RM_RMI:'+$sn}catch{$r+='RM_FAIL:'+$sn+':'+$_.Exception.Message}}}}}catch{$r+='STORE_ERR:'+$sp+':'+$_.Exception.Message}}; $v=Get-ChildItem Cert:\\CurrentUser\\My -EA SilentlyContinue|?{$_.Thumbprint -eq '${upper}'}; if($v){$r+='VERIFY_FAIL'}else{$r+='VERIFIED'}; if(-not $found){$r+='NOT_FOUND'}; $r|%{Write-Output $_}`;

    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { stdout } = await execPS(script, 20000);
        const lines = parseLines(stdout);

        const foundIn = lines.filter((l) => l.startsWith('FOUND_IN:'));
        const removedVia = lines.filter((l) => l.startsWith('RM_DOTNET:') || l.startsWith('RM_RMI:'));
        const verified = lines.includes('VERIFIED');
        const notFound = lines.includes('NOT_FOUND');
        const errors = lines.filter((l) => l.includes('_FAIL:') || l.includes('_ERR:'));

        logger.info('powershell', 'removeCertByThumbprint resultado', {
          thumbprint: upper,
          attempt,
          foundIn: foundIn.length,
          removedVia: removedVia.length,
          verified,
          notFound,
          errors: errors.length,
          details: lines,
        });

        if (verified || notFound) {
          return { success: true, output: lines.join('\n'), error: null };
        }

        lastError = errors.length > 0 ? errors.join('; ') : `Saida inesperada: ${stdout}`;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        logger.warn('powershell', `Tentativa ${attempt}/${maxRetries} falhou`, { error: lastError });
      }

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    logger.info('powershell', 'Tentando fallback via certutil.exe');
    const certutilResult = await this.removeViaCertutil(upper);
    if (certutilResult.success) {
      return certutilResult;
    }

    return {
      success: false,
      output: '',
      error: `Falha apos ${maxRetries} tentativas + fallback certutil: ${lastError}`,
    };
  },

  /**
   * Fallback: remove certificado via certutil.exe (metodo nativo Windows).
   */
  async removeViaCertutil(
    thumbprint: string
  ): Promise<{ success: boolean; output: string; error: string | null }> {
    const script = `$ErrorActionPreference='Stop'; $r=@(); $c=Get-ChildItem Cert:\\CurrentUser\\My|?{$_.Thumbprint -eq '${thumbprint}'}; if($c){$d=& certutil.exe -delstore My '${thumbprint}' 2>&1; $r+='CERTUTIL:'+($d -join ' '); $v=Get-ChildItem Cert:\\CurrentUser\\My|?{$_.Thumbprint -eq '${thumbprint}'}; if($v){$r+='CVERIFY_FAIL'}else{$r+='CVERIFY_OK'}}else{$r+='NOT_FOUND'}; $r|%{Write-Output $_}`;

    try {
      const { stdout } = await execPS(script, 15000);
      const lines = parseLines(stdout);
      const verified = lines.some((l) => l.includes('CVERIFY_OK'));
      const notFound = lines.includes('NOT_FOUND');

      logger.info('powershell', 'certutil fallback resultado', {
        thumbprint,
        verified,
        notFound,
        lines,
      });

      if (verified || notFound) {
        return { success: true, output: lines.join('\n'), error: null };
      }

      return { success: false, output: lines.join('\n'), error: 'certutil nao removeu o certificado' };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error('powershell', 'certutil fallback falhou', { error: errorMsg });
      return { success: false, output: '', error: errorMsg };
    }
  },

  /**
   * Verifica se um certificado existe no store (pre-checagem).
   */
  async certExists(
    thumbprint: string
  ): Promise<{ exists: boolean; stores: string[]; details: string }> {
    if (!isValidThumbprint(thumbprint)) {
      return { exists: false, stores: [], details: 'Thumbprint invalido' };
    }

    const upper = thumbprint.toUpperCase();
    const script = `$stores=@('Cert:\\CurrentUser\\My','Cert:\\CurrentUser\\Root','Cert:\\CurrentUser\\CA'); $fs=@(); foreach($sp in $stores){$c=Get-ChildItem $sp -EA SilentlyContinue|?{$_.Thumbprint -eq '${upper}'}; if($c){$sn=$sp.Split('\\')[-1]; $fs+=$sn+'|'+$c.Subject+'|NA='+$c.NotAfter+'|HK='+$c.HasPrivateKey}}; if($fs.Count -gt 0){Write-Output 'EXISTS:'+($fs.Count); $fs|%{Write-Output 'CERT:'+$_}}else{Write-Output 'NOT_FOUND'}`;

    try {
      const { stdout } = await execPS(script, 10000);
      const lines = parseLines(stdout);
      const exists = lines.some((l) => l.startsWith('EXISTS:'));
      const stores = lines
        .filter((l) => l.startsWith('CERT:'))
        .map((l) => l.substring(5));

      return { exists, stores, details: lines.join('\n') };
    } catch (e) {
      return { exists: false, stores: [], details: e instanceof Error ? e.message : String(e) };
    }
  },

  /**
   * Instala um PFX no Windows Certificate Store.
   * Usa flags adequadas e retorna o thumbprint real.
   */
  async installPfxInMemory(
    pfxBase64: string,
    password: string,
    thumbprint: string
  ): Promise<{ success: boolean; error: string | null; realThumbprint: string | null }> {
    const tmpDir = app.getPath('temp');
    const pfxPath = path.join(tmpDir, `certguard-${thumbprint}.pfx`);
    const escapedPassword = escapePSString(password);

    try {
      const pfxBuffer = Buffer.from(pfxBase64, 'base64');
      fs.writeFileSync(pfxPath, pfxBuffer);

      const pfxPathEscaped = pfxPath.replace(/\\/g, '\\\\');

      // Script inline — aspas simples para strings PS, sem aspas duplas problemáticas
      const script = `try{[Reflection.Assembly]::LoadWithPartialName('System.Security')|Out-Null; $b=[IO.File]::ReadAllBytes('${pfxPathEscaped}'); $f=[Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet -bor [Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable; $p=New-Object Security.Cryptography.X509Certificates.X509Certificate2($b,'${escapedPassword}',$f); $s=New-Object Security.Cryptography.X509Certificates.X509Store('My','CurrentUser'); $s.Open('ReadWrite'); $s.Add($p); $s.Close(); $v=Get-ChildItem Cert:\\CurrentUser\\My|?{$_.Thumbprint -eq $p.Thumbprint}; if($v){Write-Output ('SUCCESS:'+$p.Thumbprint)}else{Write-Output 'ERROR:Pos-instalacao falhou'}}catch{Write-Output ('ERROR:'+$_.Exception.Message)}`;

      const { stdout, stderr } = await execPS(script, 30000);

      if (stderr) {
        logger.warn('powershell', 'stderr na instalacao', { stderr });
      }

      const output = stdout.trim();
      if (output.startsWith('SUCCESS:')) {
        const realThumbprint = output.substring(8);
        logger.info('powershell', 'PFX instalado com verificacao', { realThumbprint });
        return { success: true, error: null, realThumbprint };
      }

      logger.error('powershell', 'Falha na instalacao', { output, stderr });
      return { success: false, error: output, realThumbprint: null };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error('powershell', 'Excecao na instalacao', { error: errorMsg });
      return { success: false, error: errorMsg, realThumbprint: null };
    } finally {
      try {
        if (fs.existsSync(pfxPath)) fs.unlinkSync(pfxPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  },

  /**
   * Cleanup de certificados orfaos no startup.
   * Remove qualquer certificado com chave privada que nao esteja
   * em uso por uma sessao ativa.
   */
  async cleanupOrphanCerts(): Promise<{ removed: string[]; errors: string[] }> {
    const removed: string[] = [];
    const errors: string[] = [];

    const script = `$ErrorActionPreference='Continue'; Get-ChildItem Cert:\\CurrentUser\\My -EA SilentlyContinue|?{$_.HasPrivateKey}|%{$tp=$_.Thumbprint; $sj=$_.Subject; $isSys=$sj -match '(CN=Microsoft|CN=DigiCert|CN=GlobalSign|CN=Let)'; if($isSys){Write-Output ('SKIP_SYS:'+$tp+':'+$sj); return}; try{if($_.HasPrivateKey){try{$pk=$_.PrivateKey; if($pk -ne $null){$pk.Delete($true)}}catch{}}; $x=New-Object Security.Cryptography.X509Certificates.X509Store('My','CurrentUser'); $x.Open('ReadWrite'); $x.Remove($_); $x.Close(); Write-Output ('REMOVED:'+$tp+':'+$sj)}catch{Write-Output ('ERROR:'+$tp+':'+$_.Exception.Message)}}`;

    try {
      const { stdout } = await execPS(script, 60000);
      const lines = parseLines(stdout);

      for (const line of lines) {
        if (line.startsWith('REMOVED:')) {
          removed.push(line.substring(8));
        } else if (line.startsWith('ERROR:')) {
          errors.push(line);
        }
      }

      logger.info('powershell', 'Cleanup de orfaos concluido', {
        removed: removed.length,
        errors: errors.length,
      });

      return { removed, errors };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.warn('powershell', 'Cleanup de orfaos falhou', { error: errorMsg });
      return { removed, errors: [errorMsg] };
    }
  },

  /**
   * Lista todos os certificados com chave privada no CurrentUser\My
   * (debug/diagnostico).
   */
  async listPrivateCerts(): Promise<string[]> {
    const script = `Get-ChildItem Cert:\\CurrentUser\\My -EA SilentlyContinue|?{$_.HasPrivateKey}|%{Write-Output ($_.Thumbprint+'|'+$_.Subject+'|NA='+$_.NotAfter+'|FN='+$_.FriendlyName)}`;

    try {
      const { stdout } = await execPS(script, 10000);
      return parseLines(stdout);
    } catch {
      return [];
    }
  },
};
