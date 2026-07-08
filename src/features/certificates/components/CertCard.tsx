import { useState } from 'react';
import { Power, Building2, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { Certificado } from '../../../types/api';
import { JustificativaModal } from './JustificativaModal';
import { SessionService } from '../../sessions/session.service';
import { useSessionStore } from '../../sessions/session.store';
import { DeviceService } from '../device.service';

interface CertCardProps {
  cert: Certificado;
  showCnpj?: boolean;
}

export function CertCard({ cert, showCnpj = true }: CertCardProps) {
  const [showJustificativa, setShowJustificativa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);

  const isVencido = cert.status === 'vencido' || cert.status === 'inativo';
  const isBloqueado = cert.status === 'bloqueado';
  const isVigente = cert.status === 'vigente';

  const handleActivateClick = () => {
    setError(null);
    if (cert.requires_justification) {
      setShowJustificativa(true);
    } else {
      // Sem justificativa necessária, ativa direto
      doActivate();
    }
  };

  const doActivate = async (justificativa?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Garantir que dispositivo está registrado
      const device = await ensureDeviceRegistered();

      // 2. Ativar certificado via API
      const session = await SessionService.activate(
        cert.id,
        device.device_id,
        justificativa
      );

      // 3. Instalar PFX no Windows Certificate Store (em memória)
      if (!session.pfx_base64) {
        setError('Backend não retornou o arquivo PFX. Verifique se o certificado possui arquivo anexado.');
        return;
      }
      if (!session.pfx_password) {
        setError('Backend não retornou a senha do PFX.');
        return;
      }

      const installResult = await window.ipcRenderer.invoke('cert:decrypt-and-install', {
        pfxBase64: session.pfx_base64,
        password: session.pfx_password,
        thumbprint: session.certificado_id.toString(),
      }) as { success: boolean; error: string | null; realThumbprint: string | null };

      if (!installResult.success) {
        setError(`Falha ao instalar: ${installResult.error || 'erro desconhecido'}`);
        return;
      }

      // 4. Backup no localStorage (Correção 6) - para recuperação em crash
      if (installResult.realThumbprint) {
        localStorage.setItem('certguard-active-thumbprint', installResult.realThumbprint);
      }
      localStorage.setItem('certguard-active-session', JSON.stringify({
        sessionId: session.session_id,
        certificateId: session.certificado_id,
        installedAt: new Date().toISOString(),
      }));

      // 5. Atualizar store
      setActiveSession(session, installResult.realThumbprint);

      // 6. Notificar main process (Correção 2 - DEPOIS da instalação bem-sucedida)
      SessionService.notifyMainProcess(session, installResult.realThumbprint);
      setShowJustificativa(false);
    } catch (e) {
      const error = e as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao ativar certificado');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Formatar data de vencimento
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Mapear status para label e cor
  const getStatusInfo = () => {
    if (isVencido) return { label: 'Vencido', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (isBloqueado) return { label: 'Bloqueado', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (isVigente) return { label: 'Vigente', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { label: cert.status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
  };

  const statusInfo = getStatusInfo();
  const displayName = cert.apelido || cert.empresa || `Certificado #${cert.id}`;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          {/* Lado Esquerdo: Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              isVigente ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Building2 size={24} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-800 truncate">
                {displayName}
              </h3>
              {cert.empresa && cert.apelido && (
                <p className="text-xs text-gray-500 truncate">{cert.empresa}</p>
              )}

              {/* Metadados */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {showCnpj && cert.cnpj && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    CNPJ: {cert.cnpj}
                  </span>
                )}
                {cert.data_vencimento && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar size={10} />
                    Vencimento: {formatDate(cert.data_vencimento)}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                {cert.requires_justification && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                    <ShieldAlert size={10} />
                    JUSTIFICATIVA
                  </span>
                )}
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <ShieldCheck size={10} />
                  TTL: {cert.session_ttl_minutes}min
                </span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Botão */}
          <button
            onClick={handleActivateClick}
            disabled={loading || isVencido || isBloqueado}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Power size={12} />
            {loading ? 'Ativando...' : 'Ativar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}

      <JustificativaModal
        open={showJustificativa}
        onClose={() => setShowJustificativa(false)}
        onConfirm={doActivate}
        certificadoNome={displayName}
      />
    </>
  );
}

/**
 * Garante que o dispositivo atual está registrado no backend.
 * Cria o registro se necessário.
 * Valida o cache antes de usar (pode ter sido deletado).
 */
async function ensureDeviceRegistered(): Promise<{ device_id: number }> {
  // Tenta usar cache, mas valida se ainda existe E está ativo
  const cached = localStorage.getItem('certguard-device-id');
  if (cached) {
    try {
      const devices = await DeviceService.list();
      const exists = devices.find((d) => d.id === parseInt(cached, 10));
      if (exists && exists.is_active) {
        return { device_id: exists.id };
      }
      // Cache inválido, limpa
      localStorage.removeItem('certguard-device-id');
    } catch (e) {
      // Se falhar ao listar, força novo registro
      localStorage.removeItem('certguard-device-id');
    }
  }

  // Gerar ou carregar par de chaves RSA
  const { publicKey } = await window.ipcRenderer.invoke('cert:generate-keys');

  // Coletar informações do dispositivo via IPC
  const os = await window.ipcRenderer.invoke('system:get-os-info');

  // Registrar no backend
  const device = await DeviceService.register({
    hostname: os.hostname,
    ip_address: os.ip_address,
    so: os.platform,
    fingerprint: os.fingerprint,
    public_key: publicKey,
  });

  localStorage.setItem('certguard-device-id', String(device.device_id));
  return { device_id: device.device_id };
}