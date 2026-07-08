import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const execAsync = promisify(exec);
const POWERSHELL = 'powershell.exe';

/**
 * PowerShell service for managing Windows Certificate Store operations.
 * All operations run from the Electron main process (Node.js).
 */
export const PowerShellService = {
  /**
   * Cleans up orphan certificates on startup (RN: Cleanup at Initialization).
   * Removes temporary certs older than 1 hour that may have been left by
   * forced shutdowns.
   */
  async cleanupOrphanCerts(): Promise<void> {
    const script = `Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.NotAfter -lt (Get-Date).AddHours(-1) -and $_.HasPrivateKey } | ForEach-Object { try { Remove-Item -Path $_.PSPath -Force -ErrorAction Stop; Write-Output "Removed: $($_.Thumbprint)" } catch { Write-Warning "Failed to remove: $($_.Thumbprint)" } }`;
    try {
      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script}"`,
        { timeout: 30000 }
      );
      console.log('[PowerShell] Cleanup:', stdout);
    } catch (e) {
      console.warn('[PowerShell] Cleanup failed:', e);
    }
  },

  /**
   * Installs a PFX certificate into the Windows Certificate Store in memory only.
   * Uses temp file to avoid command line length limits.
   * Returns { success, error } for detailed error reporting.
   */
  async installPfxInMemory(
    pfxBase64: string,
    password: string,
    thumbprint: string
  ): Promise<{ success: boolean; error: string | null }> {
    const tmpDir = app.getPath('temp');
    const pfxPath = path.join(tmpDir, `certguard-${thumbprint}.pfx`);
    const escapedPassword = password.replace(/'/g, "''");

    try {
      // Write PFX to temp file (avoids command line length limit)
      const pfxBuffer = Buffer.from(pfxBase64, 'base64');
      fs.writeFileSync(pfxPath, pfxBuffer);

      const pfxPathEscaped = pfxPath.replace(/\\/g, '\\\\');
      const script = `try { $pfxBytes = [System.IO.File]::ReadAllBytes('${pfxPathEscaped}'); $pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxBytes, '${escapedPassword}', [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet); $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My', 'CurrentUser'); $store.Open('ReadWrite'); $store.Add($pfx); $store.Close(); $pfxBytes = $null; $pfx = $null; Write-Output 'SUCCESS' } catch { Write-Output "ERROR: $($_.Exception.Message)" }`;

      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script}"`,
        { timeout: 30000 }
      );

      const output = stdout.trim();
      if (output.includes('SUCCESS')) {
        return { success: true, error: null };
      } else {
        return { success: false, error: output };
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      return { success: false, error: errorMsg };
    } finally {
      // Cleanup temp file
      try {
        if (fs.existsSync(pfxPath)) fs.unlinkSync(pfxPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  },

  /**
   * Removes a certificate from the Windows Store by thumbprint.
   */
  async removeCertByThumbprint(thumbprint: string): Promise<boolean> {
    const escapedThumbprint = thumbprint.replace(/'/g, "''");

    const script = `try { $cert = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Thumbprint -eq '${escapedThumbprint}' }; if ($cert) { Remove-Item -Path $cert.PSPath -Force; Write-Output 'REMOVED' } else { Write-Output 'NOT_FOUND' } } catch { Write-Output "ERROR: $($_.Exception.Message)" }`;

    try {
      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script}"`,
        { timeout: 15000 }
      );
      return stdout.trim() === 'REMOVED';
    } catch (e) {
      console.error('[PowerShell] Remove failed:', e);
      return false;
    }
  },
};