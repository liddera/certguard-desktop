export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Certificado {
  id: number;
  apelido: string;
  empresa: string;
  cnpj: string;
  status: string;
  data_vencimento: string;
  requires_justification: boolean;
  session_ttl_minutes: number;
  allowed_weekdays: string[];
  allowed_time_start: string;
  allowed_time_end: string;
}

export interface Device {
  id: number;
  hostname: string;
  ip_address: string;
  so: string;
  fingerprint: string;
  is_active: boolean;
  last_seen_at: string | null;
}

export interface Sessao {
  session_id: number;
  session_code: string;
  certificado_id: number;
  pfx_path: string;
  cnpj: string;
  common_name: string;
  expires_at: string;
}

export interface HeartbeatResponse {
  status: 'active' | 'expired' | 'revoked' | 'completed';
  expires_at: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}