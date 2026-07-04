import { useEffect, useCallback } from 'react';
import { useSessionStore } from '../session.store';
import { SessionService } from '../session.service';
import { useHeartbeat } from '../../../hooks/useHeartbeat';

/**
 * Componente invisível que gerencia o ciclo de vida da sessão ativa.
 * Deve ser renderizado uma vez no App principal (quando há sessão).
 *
 * Responsabilidades:
 * - Iniciar heartbeat loop ao montar
 * - Chamar deactivate no backend ao desmontar (cleanup)
 * - Cleanup do certificado do Windows Store
 */
export function SessaoManager() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const clearSession = useSessionStore((s) => s.clearSession);

  // Ativa o heartbeat (loop de renovação + countdown)
  useHeartbeat();

  // Cleanup ao desmontar (user fechou o app ou deslogou)
  useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      // (Não chama deactivate aqui pois pode ser navegação legítima)
    };
  }, []);

  const handleDeactivate = useCallback(async () => {
    if (!activeSession) return;

    try {
      // 1. Remove certificado do Windows Store (via IPC)
      await window.ipcRenderer.invoke('cert:remove-by-thumbprint', {
        thumbprint: activeSession.certificado_id.toString(),
      });

      // 2. Revoga sessão no backend
      await SessionService.deactivate(activeSession.session_id);

      // 3. Limpa estado local
      clearSession();
    } catch (e) {
      console.error('[SessaoManager] Erro ao desativar:', e);
    }
  }, [activeSession, clearSession]);

  // Expõe função de desativar globalmente (para uso em outros componentes)
  useEffect(() => {
    window.deactivateSession = handleDeactivate;
    return () => {
      delete window.deactivateSession;
    };
  }, [handleDeactivate]);

  return null; // Componente invisível
}