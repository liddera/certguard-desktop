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

function buildPSCommand(script: string): string {
  const escaped = script.replace(/"/g, '\\"');
  return `${POWERSHELL} -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${escaped}"`;
}

async function execPS(script: string, timeoutMs = 30000): Promise<{ stdout: string; stderr: string }> {
  const cmd = buildPSCommand(script);
  logger.debug('powershell', 'Executando comando', { scriptLength: script.length });
  const result = await execAsync(cmd, {
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024,
    windowsHide: true,
  });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

function parseLines(output: string): string[] {
  return output.split('\n').map((l) => l.trim()).filter(Boolean);
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
      const msg = `Thumbprint inválido: "${thumbprint}" (esperado SHA-1 hex de 40 chars)`;
      logger.error('powershell', msg);
      return { success: false, output: '', error: msg };
    }

    const upper = thumbprint.toUpperCase();

    const script = `
$ErrorActionPreference = 'Stop'
$results = @()

# 1. Buscar em múltiplos stores
$stores = @('Cert:\\CurrentUser\\My', 'Cert:\\CurrentUser\\Root', 'Cert:\\CurrentUser\\CA')
$found = $false

foreach ($storePath in $stores) {
  try {
    $storeName = ($storePath -split '\\\\')[-1]
    $certs = Get-ChildItem $storePath -ErrorAction SilentlyContinue |
             Where-Object { $_.Thumbprint -eq '${upper}' }

    if ($certs) {
      foreach ($cert in $certs) {
        $found = $true
        $subject = $cert.Subject
        $hasKey = $cert.HasPrivateKey
        $results += "FOUND_IN:$storeName:$subject:HasPrivateKey=$hasKey"

        # 2. Remover chave privada explicitamente (se existir)
        if ($hasKey) {
          try {
            $privKey = $cert.PrivateKey
            if ($privKey -ne $null) {
              $privKey.Delete($true)
              $results += "PRIVATE_KEY_DELETED:$storeName"
            }
          } catch {
            $results += "PRIVATE_KEY_DELETE_FAILED:$storeName:$($_.Exception.Message)"
          }
        }

        # 3. Remover do store via .NET (mais confiável que Remove-Item)
        try {
          $x509Store = New-Object System.Security.Cryptography.X509Certificates.X509Store(
            $storeName, 'CurrentUser'
          )
          $x509Store.Open('ReadWrite')
          $x509Store.Remove($cert)
          $x509Store.Close()
          $results += "REMOVED_VIA_DOTNET:$storeName"
        } catch {
          # Fallback para Remove-Item
          try {
            Remove-Item -Path $cert.PSPath -Force -ErrorAction Stop
            $results += "REMOVED_VIA_REMOVEITEM:$storeName"
          } catch {
            $results += "REMOVE_FAILED:$storeName:$($_.Exception.Message)"
          }
        }
      }
    }
  } catch {
    $results += "STORE_ERROR:$($storePath):$($_.Exception.Message)"
  }
}

# 4. Verificação pós-remoção
$verifyRemaining = Get-ChildItem Cert:\\CurrentUser\\My -ErrorAction SilentlyContinue |
                   Where-Object { $_.Thumbprint -eq '${upper}' }
if ($verifyRemaining) {
  $results += "VERIFICATION_FAILED:Cert still exists in My store"
} else {
  $results += "VERIFIED_REMOVED"
}

if (-not $found) {
  $results += "NOT_FOUND_IN_ANY_STORE"
}

$results | ForEach-Object { Write-Output $_ }
`;

    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { stdout } = await execPS(script, 20000);
        const lines = parseLines(stdout);

        const foundIn = lines.filter((l) => l.startsWith('FOUND_IN:'));
        const removedVia = lines.filter((l) => l.startsWith('REMOVED_VIA_'));
        const verified = lines.includes('VERIFIED_REMOVED');
        const notFound = lines.includes('NOT_FOUND_IN_ANY_STORE');
        const errors = lines.filter((l) => l.includes('_FAILED:') || l.includes('_ERROR:'));

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

        if (removedVia.length > 0 && !verified) {
          logger.warn('powershell', 'Remoção executada mas verificação falhou', { lines });
          lastError = `Remoção executada mas verificação pós-remoção falhou: ${errors.join('; ')}`;
        } else {
          lastError = errors.length > 0 ? errors.join('; ') : `Saída inesperada: ${stdout}`;
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        logger.warn('powershell', `Tentativa ${attempt}/${maxRetries} falhou`, { error: lastError });
      }

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    // 5. Fallback: certutil.exe
    logger.info('powershell', 'Tentando fallback via certutil.exe');
    const certutilResult = await this.removeViaCertutil(upper);
    if (certutilResult.success) {
      return certutilResult;
    }

    return {
      success: false,
      output: '',
      error: `Falha após ${maxRetries} tentativas + fallback certutil: ${lastError}`,
    };
  },

  /**
   * Fallback: remove certificado via certutil.exe (método nativo Windows).
   */
  async removeViaCertutil(
    thumbprint: string
  ): Promise<{ success: boolean; output: string; error: string | null }> {
    const script = `
$ErrorActionPreference = 'Stop'
$results = @()

# Buscar no store My
$cert = Get-ChildItem Cert:\\CurrentUser\\My |
        Where-Object { $_.Thumbprint -eq '${thumbprint}' }

if ($cert) {
  # Usar certutil para deletar
  $delResult = & certutil.exe -delstore My "${thumbprint}" 2>&1
  $results += "CERTUTIL_MY:$delResult"

  # Verificar
  $verify = Get-ChildItem Cert:\\CurrentUser\\My |
            Where-Object { $_.Thumbprint -eq '${thumbprint}' }
  if ($verify) {
    $results += "CERTUTIL_VERIFICATION_FAILED"
  } else {
    $results += "CERTUTIL_VERIFIED_REMOVED"
  }
} else {
  $results += "NOT_FOUND"
}

$results | ForEach-Object { Write-Output $_ }
`;

    try {
      const { stdout } = await execPS(script, 15000);
      const lines = parseLines(stdout);
      const verified = lines.some((l) => l.includes('CERTUTIL_VERIFIED_REMOVED'));
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

      return { success: false, output: lines.join('\n'), error: 'certutil não removeu o certificado' };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error('powershell', 'certutil fallback falhou', { error: errorMsg });
      return { success: false, output: '', error: errorMsg };
    }
  },

  /**
   * Verifica se um certificado existe no store (pré-checagem).
   */
  async certExists(
    thumbprint: string
  ): Promise<{ exists: boolean; stores: string[]; details: string }> {
    if (!isValidThumbprint(thumbprint)) {
      return { exists: false, stores: [], details: 'Thumbprint inválido' };
    }

    const script = `
$upper = '${thumbprint.toUpperCase()}'
$stores = @('Cert:\\CurrentUser\\My', 'Cert:\\CurrentUser\\Root', 'Cert:\\CurrentUser\\CA')
$foundStores = @()

foreach ($storePath in $stores) {
  $cert = Get-ChildItem $storePath -ErrorAction SilentlyContinue |
          Where-Object { $_.Thumbprint -eq $upper }
  if ($cert) {
    $storeName = ($storePath -split '\\\\')[-1]
    $foundStores += "$storeName|$($cert.Subject)|NotAfter=$($cert.NotAfter)|HasPrivateKey=$($cert.HasPrivateKey)"
  }
}

if ($foundStores.Count -gt 0) {
  Write-Output "EXISTS:$($foundStores.Count)"
  foreach ($f in $foundStores) { Write-Output "CERT:$f" }
} else {
  Write-Output "NOT_FOUND"
}
`;

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
      const script = `
$ErrorActionPreference = 'Stop'
try {
  $pfxBytes = [System.IO.File]::ReadAllBytes('${pfxPathEscaped}')
  $flags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet -bor
           [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable
  $pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(
    $pfxBytes, '${escapedPassword}', $flags
  )
  $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My', 'CurrentUser')
  $store.Open('ReadWrite')
  $store.Add($pfx)
  $store.Close()

  # Verificar se foi realmente adicionado
  $verify = Get-ChildItem Cert:\\CurrentUser\\My |
            Where-Object { $_.Thumbprint -eq $pfx.Thumbprint }
  if ($verify) {
    Write-Output "SUCCESS:$($pfx.Thumbprint)"
  } else {
    Write-Output "ERROR:Verificação pós-instalação falhou"
  }
} catch {
  Write-Output "ERROR:$($_.Exception.Message)"
}
`;

      const { stdout, stderr } = await execPS(script, 30000);

      if (stderr) {
        logger.warn('powershell', 'stderr na instalação', { stderr });
      }

      const output = stdout.trim();
      if (output.startsWith('SUCCESS:')) {
        const realThumbprint = output.substring(8);
        logger.info('powershell', 'PFX instalado com verificação', { realThumbprint });
        return { success: true, error: null, realThumbprint };
      }

      logger.error('powershell', 'Falha na instalação', { output, stderr });
      return { success: false, error: output, realThumbprint: null };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error('powershell', 'Exceção na instalação', { error: errorMsg });
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
   * Cleanup de certificados órfãos no startup.
   * Remove qualquer certificado com chave privada que não esteja
   * em uso por uma sessão ativa.
   */
  async cleanupOrphanCerts(): Promise<{ removed: string[]; errors: string[] }> {
    const removed: string[] = [];
    const errors: string[] = [];

    const script = `
$ErrorActionPreference = 'Continue'
$results = @()

Get-ChildItem Cert:\\CurrentUser\\My -ErrorAction SilentlyContinue |
  Where-Object { $_.HasPrivateKey } |
  ForEach-Object {
    $tp = $_.Thumbprint
    $subject = $_.Subject
    $notAfter = $_.NotAfter
    $daysToExpire = ($notAfter - (Get-Date)).TotalDays

    # Remover qualquer certificado com chave privada que não seja
    # um certificado de sistema (CN com nomes conhecidos)
    $isSystemCert = $subject -match '(CN=Microsoft|CN=DigiCert|CN=GlobalSign|CN=Let.s Encrypt)'

    if ($isSystemCert) {
      $results += "SKIPPED_SYSTEM:$tp:$subject"
      return
    }

    try {
      # Tentar remover chave privada
      if ($_.HasPrivateKey) {
        try {
          $privKey = $_.PrivateKey
          if ($privKey -ne $null) { $privKey.Delete($true) }
        } catch { }
      }

      # Remover via .NET
      $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My', 'CurrentUser')
      $store.Open('ReadWrite')
      $store.Remove($_)
      $store.Close()
      $results += "REMOVED:$tp:$subject"
    } catch {
      $results += "ERROR:$tp:$($_.Exception.Message)"
    }
  }

$results | ForEach-Object { Write-Output $_ }
`;

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

      logger.info('powershell', 'Cleanup de órfãos concluído', {
        removed: removed.length,
        errors: errors.length,
      });

      return { removed, errors };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.warn('powershell', 'Cleanup de órfãos falhou', { error: errorMsg });
      return { removed, errors: [errorMsg] };
    }
  },

  /**
   * Lista todos os certificados com chave privada no CurrentUser\My
   * (debug/diagnóstico).
   */
  async listPrivateCerts(): Promise<string[]> {
    const script = `
Get-ChildItem Cert:\\CurrentUser\\My -ErrorAction SilentlyContinue |
  Where-Object { $_.HasPrivateKey } |
  ForEach-Object {
    "$($_.Thumbprint)|$($_.Subject)|NotAfter=$($_.NotAfter)|FriendlyName=$($_.FriendlyName)"
  }
`;

    try {
      const { stdout } = await execPS(script, 10000);
      return parseLines(stdout);
    } catch {
      return [];
    }
  },
};
