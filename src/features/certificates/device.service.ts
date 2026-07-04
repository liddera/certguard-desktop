import { apiClient } from '../../lib/apiClient';
import type { Device } from '../../types/api';

export const DeviceService = {
  async register(data: {
    hostname: string;
    ip_address: string;
    so: string;
    fingerprint: string;
    public_key: string;
  }): Promise<{ device_id: number; fingerprint: string; is_active: boolean }> {
    const { data: response } = await apiClient.post<{
      device_id: number;
      fingerprint: string;
      is_active: boolean;
    }>('/desktop/devices', data);
    return response;
  },

  async list(): Promise<Device[]> {
    const { data } = await apiClient.get<{ devices: Device[] }>(
      '/desktop/devices'
    );
    return data.devices;
  },

  async deactivate(deviceId: number): Promise<void> {
    await apiClient.delete(`/desktop/devices/${deviceId}`);
  },
};