import { useEffect, useRef } from 'react';
import { useSessionStore } from '../features/sessions/session.store';
import { SessionService } from '../features/sessions/session.service';

const HEARTBEAT_INTERVAL = 30000; // 30 segundos
const WARNING_THRESHOLD = 300; // 5 minutos (em segundos)
const COUNTDOWN_TICK = 1000; // 1 segundo

/**
 * Hook que gerencia o ciclo de vida da sessão de certificado:
 * - Heartbeat periódico (renova expires_at)
 * - Countdown regressivo
 * - Dispara modal de aviso quando faltar 5 minutos
 * - Cleanup ao desmontar
 */
export function useHeartbeat() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const updateCountdown = useSessionStore((s) => s.updateCountdown);
  const setShowExpiryModal = useSessionStore((s) => s.setShowExpiryModal);
  const clearSession = useSessionStore((s) => s.clearSession);

  const heartbeatRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const expiresAtMsRef = useRef<number>(0);
  const modalDismissedRef = useRef<boolean>(false);

  // Sincronizar ref com o store
  useEffect(() => {
    const unsub = useSessionStore.subscribe((state) => {
      modalDismissedRef.current = state.expiryModalDismissed;
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeSession) return;

    // Usar ref para que o valor persista entre re-renders
    expiresAtMsRef.current = new Date(activeSession.expires_at).getTime();
    modalDismissedRef.current = false;

    // 1. Heartbeat a cada 30s
    const sendHeartbeat = async () => {
      try {
        const response = await SessionService.heartbeat(activeSession.session_id);
        if (response.status === 'active' && response.expires_at) {
          // Atualizar ref (não variável local)
          expiresAtMsRef.current = new Date(response.expires_at).getTime();
          // Reset do modal dismissed ao renovar com sucesso
          modalDismissedRef.current = false;
        } else if (response.status === 'revoked' || response.status === 'expired') {
          clearSession();
          window.ipcRenderer.invoke('cert:remove-by-thumbprint', {
            thumbprint: activeSession.certificado_id.toString(),
          });
          return;
        }
      } catch (e) {
        console.error('[Heartbeat] Erro:', e);
      }
    };

    heartbeatRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // 2. Countdown a cada 1s
    const tick = () => {
      const now = Date.now();
      const remainingMs = expiresAtMsRef.current - now;
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

      updateCountdown(remainingSec);

      // Mostrar modal quando faltar 5 min (apenas se não foi dispensado)
      if (remainingSec > 0 && remainingSec <= WARNING_THRESHOLD && !modalDismissedRef.current) {
        setShowExpiryModal(true);
      }

      // Sessão expirou
      if (remainingSec <= 0) {
        clearSession();
        window.ipcRenderer.invoke('cert:remove-by-thumbprint', {
          thumbprint: activeSession.certificado_id.toString(),
        });
      }
    };

    tick(); // Primeira execução imediata
    countdownRef.current = window.setInterval(tick, COUNTDOWN_TICK);

    // 3. Cleanup ao desmontar
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [activeSession?.session_id]);
}