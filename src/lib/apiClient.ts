import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../features/auth/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido/expirado: limpa estado e força logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);