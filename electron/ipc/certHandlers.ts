import { ipcMain } from 'electron';
import { PowerShellService } from '../services/powershellService';
import { generateOrLoadKeyPair } from '../services/keygenService';
import { logger } from '../services/logger';

export function registerCertHandlers(): void {
  // Cleanup no startup
  ipcMain.handle('cert:cleanup-orphans', async () => {
    return PowerShellService.cleanupOrphanCerts();
  });

  // Gerar ou carregar par de chaves RSA
  ipcMain.handle('cert:generate-keys', async () => {
    return generateOrLoadKeyPair();
  });

  // Instalar PFX em memória (via base64 + senha)
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

  // Descriptografar e instalar PFX (chamado após ativação da sessão)
  ipcMain.handle('cert:decrypt-and-install', async (_event, args: {
    pfxBase64: string;
    password: string;
    thumbprint: string;
  }) => {
    try {
      logger.info('cert', 'Instalando PFX em memória', { thumbprint: args.thumbprint });

      const success = await PowerShellService.installPfxInMemory(
        args.pfxBase64,
        args.password,
        args.thumbprint
      );

      if (success) {
        logger.info('cert', 'PFX instalado com sucesso', { thumbprint: args.thumbprint });
      } else {
        logger.error('cert', 'Falha ao instalar PFX', { thumbprint: args.thumbprint });
      }

      return success;
    } catch (e) {
      logger.error('cert', 'Erro ao instalar PFX', { error: String(e) });
      return false;
    }
  });

  // Remover certificado por thumbprint
  ipcMain.handle('cert:remove-by-thumbprint', async (_event, args: {
    thumbprint: string;
  }) => {
    return PowerShellService.removeCertByThumbprint(args.thumbprint);
  });
}