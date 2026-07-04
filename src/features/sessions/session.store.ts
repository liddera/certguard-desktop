import { create } from 'zustand';
import type { Sessao } from '../../types/api';

interface SessionState {
  activeSession: Sessao | null;
  countdown: number;
  showExpiryModal: boolean;
  expiryModalDismissed: boolean;
  certThumbprint: string | null;

  setActiveSession: (session: Sessao | null) => void;
  setCertThumbprint: (thumbprint: string | null) => void;
  updateCountdown: (seconds: number) => void;
  setShowExpiryModal: (show: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  countdown: 0,
  showExpiryModal: false,
  expiryModalDismissed: false,
  certThumbprint: null,

  setActiveSession: (session) =>
    set({
      activeSession: session,
      countdown: session
        ? Math.max(
            0,
            Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000)
          )
        : 0,
      showExpiryModal: false,
      expiryModalDismissed: false,
    }),
  setCertThumbprint: (thumbprint) => set({ certThumbprint: thumbprint }),
  updateCountdown: (seconds) => set({ countdown: seconds }),
  setShowExpiryModal: (show) =>
    set({ showExpiryModal: show, expiryModalDismissed: !show }),
  clearSession: () =>
    set({
      activeSession: null,
      countdown: 0,
      showExpiryModal: false,
      expiryModalDismissed: false,
      certThumbprint: null,
    }),
}));

/**
 * Helper para formatar segundos em HH:MM:SS
 */
export function formatCountdown(seconds: number): string {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}