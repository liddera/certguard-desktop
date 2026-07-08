import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { logger } from './logger';

const execAsync = promisify(exec);
const POWERSHELL = 'powershell.exe';

/**
 * PowerShell service for managing Windows Certificate Store operations.
 * All operations run from the Electron main process (Node.js).
 */
export const PowerShellService = {
  /**
   * Cleans up orphan certificates on startup (RN: Cleanup at Initialization).
   * Removes certs that have private keys AND were installed in the last 24h
   * but have no associated active session.
   *
   * This is the "last resort" cleanup. Normal cleanup happens via
   * removeCertByThumbprint() when a session ends normally.
   */
  async cleanupOrphanCerts(): Promise<{ removed: string[]; errors: string[] }> {
    const removed: string[] = [];
    const errors: string[] = [];

    const script = `$results = @(); Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.HasPrivateKey } | ForEach-Object { try { $notAfter = $_.NotAfter; $daysToExpire = ($notAfter - (Get-Date)).TotalDays; if ($daysToExpire -gt 365) { Remove-Item -Path $_.PSPath -Force -ErrorAction Stop; $results += "Removed:$($_.Thumbprint)" } else { $results += "Skipped:$($_.Thumbprint):expires in $([int]$daysToExpire) days" } } catch { $results += "Error:$($_.Thumbprint):$($_.Exception.Message)" } }; $results | ForEach-Object { Write-Output $_ }`;

    try {
      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script}"`,
        { timeout: 60000 }
      );

      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Removed:')) {
          removed.push(trimmed.substring(8));
        } else if (trimmed.startsWith('Error:')) {
          errors.push(trimmed);
        }
      }

      logger.info('powershell', 'Cleanup de órfãos concluído', {
        removed: removed.length,
        errors: errors.length,
        removedList: removed,
      });

      return { removed, errors };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.warn('powershell', 'Cleanup de órfãos falhou', { error: errorMsg });
      return { removed, errors: [errorMsg] };
    }
  },

  /**
   * Installs a PFX certificate into the Windows Certificate Store in memory only.
   * Uses temp file to avoid command line length limits.
   * Returns { success, error, realThumbprint } for detailed error reporting.
   */
  async installPfxInMemory(
    pfxBase64: string,
    password: string,
    thumbprint: string
  ): Promise<{ success: boolean; error: string | null; realThumbprint: string | null }> {
    const tmpDir = app.getPath('temp');
    const pfxPath = path.join(tmpDir, `certguard-${thumbprint}.pfx`);
    const escapedPassword = password.replace(/'/g, "''");

    try {
      const pfxBuffer = Buffer.from(pfxBase64, 'base64');
      fs.writeFileSync(pfxPath, pfxBuffer);

      const pfxPathEscaped = pfxPath.replace(/\\/g, '\\\\');
      const script = `try { $pfxBytes = [System.IO.File]::ReadAllBytes('${pfxPathEscaped}'); $pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxBytes, '${escapedPassword}', [System.Security.Cryptography.X509StorageFlags]::PersistKeySet); $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My', 'CurrentUser'); $store.Open('ReadWrite'); $store.Add($pfx); $store.Close(); Write-Output "SUCCESS:$($pfx.Thumbprint)" } catch { Write-Output "ERROR: $($_.Exception.Message)" }`;

      const { stdout, stderr } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script}"`,
        { timeout: 30000 }
      );

      if (stderr) {
        logger.warn('powershell', 'stderr na instalação', { stderr });
      }

      const output = stdout.trim();
      if (output.startsWith('SUCCESS:')) {
        const realThumbprint = output.substring(8);
        logger.info('powershell', 'PFX instalado', {
          realThumbprint,
          pfxPath,
        });
        return { success: true, error: null, realThumbprint };
      } else {
        logger.error('powershell', 'Falha na instalação', {
          output,
          stderr,
        });
        return { success: false, error: output, realThumbprint: null };
      }
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
   * Removes a certificate from the Windows Store by thumbprint.
   * Returns { success, output, error } for detailed diagnostics.
   */
  async removeCertByThumbprint(
    thumbprint: string
  ): Promise<{ success: boolean; output: string; error: string | null }> {
    const escapedThumbprint = thumbprint.replace(/'/g, "''");

    const script = `try { $cert = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Thumbprint -eq '${escapedThumbprint}' }; if ($cert) { Write-Output "FOUND:$($cert.Count):$($cert[0].Subject)"; Remove-Item -Path $cert[0].PSPath -Force -ErrorAction Stop; Write-Output 'REMOVED' } else { Write-Output 'NOT_FOUND' } } catch { Write-Output "ERROR: $($_.Exception.Message)" }`;

    try {
      const { stdout, stderr } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script}"`,
        { timeout: 15000 }
      );

      const output = stdout.trim();
      const success = output.includes('REMOVED');

      logger.info('powershell', 'removeCertByThumbprint resultado', {
        thumbprint,
        output,
        stderr,
        success,
      });

      return { success, output, error: stderr || null };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error('powershell', 'Remove failed', {
        thumbprint,
        error: errorMsg,
      });
      return { success: false, output: '', error: errorMsg };
    }
  },
};
