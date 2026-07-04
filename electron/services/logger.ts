/**
 * Logger sanitizado para CertGuard.
 *
 * Importante: NUNCA deve logar:
 * - Conteúdo de payloads de certificado (PFX, senhas, chaves privadas)
 * - Tokens de autenticação
 * - Senhas em qualquer lugar
 *
 * Apenas metadados estruturados são permitidos.
 */

const SENSITIVE_KEYS = [
  'password',
  'pfx',
  'pfx_path',
  'private_key',
  'public_key',
  'token',
  'authorization',
  'cookie',
  'session_code',
];

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

/**
 * Sanitiza um objeto removendo chaves sensíveis.
 * Mostra apenas "[REDACTED]" para campos sensíveis.
 */
function sanitize(meta: LogMeta | unknown): LogMeta {
  if (meta === null || meta === undefined) return {};
  if (typeof meta !== 'object') return { value: meta };

  const result: LogMeta = {};
  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitize(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Logger sanitizado que escreve no console com timestamp.
 * Pode ser expandido para escrever em arquivo de log depois.
 */
export const logger = {
  info(module: string, message: string, meta?: LogMeta | unknown): void {
    log('info', module, message, meta);
  },

  warn(module: string, message: string, meta?: LogMeta | unknown): void {
    log('warn', module, message, meta);
  },

  error(module: string, message: string, meta?: LogMeta | unknown): void {
    log('error', module, message, meta);
  },

  debug(module: string, message: string, meta?: LogMeta | unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      log('debug', module, message, meta);
    }
  },
};

function log(level: LogLevel, module: string, message: string, meta?: LogMeta | unknown): void {
  const timestamp = new Date().toISOString();
  const sanitized = meta ? sanitize(meta) : {};
  const logLine = JSON.stringify({
    timestamp,
    level,
    module,
    message,
    ...sanitized,
  });

  switch (level) {
    case 'error':
      console.error(logLine);
      break;
    case 'warn':
      console.warn(logLine);
      break;
    case 'debug':
      console.debug(logLine);
      break;
    default:
      console.log(logLine);
  }
}