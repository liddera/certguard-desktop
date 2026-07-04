import { ipcMain } from 'electron';
import { PowerShellService } from '../services/powershellService';
import { generateOrLoadKeyPair } from '../services/keygenService';

export function registerCertHandlers(): void {
  // Cleanup no startup
  ipcMain.handle('cert:cleanup-orphans', async () => {
    return PowerShellService.cleanupOrphanCerts();
  });

  // Gerar ou carregar par de chaves RSA
  ipcMain.handle('cert:generate-keys', async () => {
    return generateOrLoadKeyPair();
  });

  // Instalar PFX em memória
  ipcMain.handle('cert:install-pfx', async (_event, args: {
    pfxBase64: string;
    password: string;
    thumbprint: string;
  }) => {
    return PowerShellService.installPfxInMemory(
      args.pfxBase64,
      args.password,
      args.thumbprint
    );
  });

  // Remover certificado por thumbprint
  ipcMain.handle('cert:remove-by-thumbprint', async (_event, args: {
    thumbprint: string;
  }) => {
    return PowerShellService.removeCertByThumbprint(args.thumbprint);
  });
}