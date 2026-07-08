import { apiClient } from '../../lib/apiClient';
import type { Sessao, HeartbeatResponse } from '../../types/api';

export const SessionService = {
  async activate(
    certificadoId: number,
    deviceId: number,
    justification?: string
  ): Promise<Sessao> {
    const { data } = await apiClient.post<Sessao>('/desktop/sessoes', {
      certificado_id: certificadoId,
      device_id: deviceId,
      justification,
    });

    return data;
  },

  notifyMainProcess(session: Sessao, certThumbprint: string | null): void {
    window.ipcRenderer?.send('session:activated', {
      sessionId: session.session_id,
      token: (apiClient.defaults.headers as { Authorization?: string } | undefined)?.Authorization?.replace('Bearer ', '') || '',
      apiUrl: apiClient.defaults.baseURL || '',
      certThumbprint,
    });
  },

  async heartbeat(sessionId: number): Promise<HeartbeatResponse> {
    const { data } = await apiClient.post<HeartbeatResponse>(
      '/desktop/heartbeat',
      { session_id: sessionId }
    );
    return data;
  },

  async deactivate(sessionId: number): Promise<void> {
    await apiClient.delete(`/desktop/sessoes/${sessionId}`);
    window.ipcRenderer?.send('session:deactivated');
  },
};