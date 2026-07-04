import { apiClient } from '../../lib/apiClient';
import type { LoginResponse } from '../../types/api';

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/desktop/login', {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/desktop/logout');
  },

  async me(): Promise<LoginResponse['user']> {
    const { data } = await apiClient.get<{ user: LoginResponse['user'] }>('/desktop/me');
    return data.user;
  },
};