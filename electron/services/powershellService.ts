import { exec } from 'child_process';
import { promisify } from 'util';

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
    const script = `
      Get-ChildItem Cert:\\CurrentUser\\My |
        Where-Object { $_.NotAfter -lt (Get-Date).AddHours(-1) -and $_.HasPrivateKey } |
        ForEach-Object {
          try {
            Remove-Item -Path $_.PSPath -Force -ErrorAction Stop
            Write-Output "Removed: $($_.Thumbprint)"
          } catch {
            Write-Warning "Failed to remove: $($_.Thumbprint)"
          }
        }
    `;
    try {
      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script.replace(/\n/g, ';')}"`,
        { timeout: 30000 }
      );
      console.log('[PowerShell] Cleanup:', stdout);
    } catch (e) {
      console.warn('[PowerShell] Cleanup failed:', e);
    }
  },

  /**
   * Installs a PFX certificate into the Windows Certificate Store in memory only.
   * No file is written to disk. Uses EphemeralKeySet to keep cert in RAM.
   */
  async installPfxInMemory(
    pfxBase64: string,
    password: string,
    thumbprint: string
  ): Promise<boolean> {
    const escapedPassword = password.replace(/'/g, "''");
    const escapedThumbprint = thumbprint.replace(/'/g, "''");

    const script = `
      try {
        $pfxBytes = [Convert]::FromBase64String('${pfxBase64}')
        $pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(
          $pfxBytes,
          '${escapedPassword}',
          [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet
        )
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('My', 'CurrentUser')
        $store.Open('ReadWrite')
        $store.Add($pfx)
        $store.Close()

        # Verificar se instalou
        $installed = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Thumbprint -eq '${escapedThumbprint}' }
        if ($installed) {
          Write-Output "SUCCESS"
        } else {
          Write-Output "FAILED"
        }

        # Limpar variáveis
        $pfxBytes = $null
        $pfx = $null
      } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
      }
    `;

    try {
      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script.replace(/\n/g, ';')}"`,
        { timeout: 30000 }
      );
      return stdout.trim().includes('SUCCESS');
    } catch (e) {
      console.error('[PowerShell] Install failed:', e);
      return false;
    }
  },

  /**
   * Removes a certificate from the Windows Store by thumbprint.
   */
  async removeCertByThumbprint(thumbprint: string): Promise<boolean> {
    const escapedThumbprint = thumbprint.replace(/'/g, "''");

    const script = `
      try {
        $cert = Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Thumbprint -eq '${escapedThumbprint}' }
        if ($cert) {
          Remove-Item -Path $cert.PSPath -Force
          Write-Output "REMOVED"
        } else {
          Write-Output "NOT_FOUND"
        }
      } catch {
        Write-Output "ERROR: $($_.Exception.Message)"
      }
    `;

    try {
      const { stdout } = await execAsync(
        `${POWERSHELL} -NoProfile -Command "${script.replace(/\n/g, ';')}"`,
        { timeout: 15000 }
      );
      return stdout.trim() === 'REMOVED';
    } catch (e) {
      console.error('[PowerShell] Remove failed:', e);
      return false;
    }
  },
};