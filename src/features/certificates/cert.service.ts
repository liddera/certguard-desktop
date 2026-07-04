import { apiClient } from '../../lib/apiClient';
import type { Certificado } from '../../types/api';

export const CertService = {
  async list(): Promise<Certificado[]> {
    const { data } = await apiClient.get<{ certificados: Certificado[] }>(
      '/desktop/certificados'
    );
    return data.certificados;
  },
};