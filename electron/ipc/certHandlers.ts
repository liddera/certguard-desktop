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
      // DEBUG: Log what arrives at main process
      console.log('[cert:decrypt-and-install] Received args:', {
        pfxBase64Type: typeof args.pfxBase64,
        pfxBase64Length: args.pfxBase64?.length,
        pfxBase64Preview: args.pfxBase64?.substring(0, 50),
        passwordType: typeof args.password,
        thumbprint: args.thumbprint,
      });

      logger.info('cert', 'Instalando PFX em memória', { thumbprint: args.thumbprint });

      const result = await PowerShellService.installPfxInMemory(
        args.pfxBase64,
        args.password,
        args.thumbprint
      );

      if (result.success) {
        logger.info('cert', 'PFX instalado com sucesso', { thumbprint: args.thumbprint });
      } else {
        logger.error('cert', 'Falha ao instalar PFX', {
          thumbprint: args.thumbprint,
          error: result.error,
        });
      }

      return result;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error('cert', 'Erro ao instalar PFX', { error: errorMsg });
      return { success: false, error: errorMsg };
    }
  });

  // Remover certificado por thumbprint
  ipcMain.handle('cert:remove-by-thumbprint', async (_event, args: {
    thumbprint: string;
  }) => {
    return PowerShellService.removeCertByThumbprint(args.thumbprint);
  });
}