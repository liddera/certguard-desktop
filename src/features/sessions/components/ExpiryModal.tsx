import { useEffect, useState } from 'react';
import { Shield, X, Check } from 'lucide-react';
import { useSessionStore } from '../session.store';
import { SessionService } from '../session.service';

/**
 * Modal de aviso quando a sessão está perto de expirar.
 * Aparece quando faltam menos de 5 minutos.
 * Mostra countdown real baseado no expires_at.
 */
export function ExpiryModal() {
  const show = useSessionStore((s) => s.showExpiryModal);
  const setShow = useSessionStore((s) => s.setShowExpiryModal);
  const session = useSessionStore((s) => s.activeSession);
  const countdown = useSessionStore((s) => s.countdown);
  const [renewing, setRenewing] = useState(false);

  // Se countdown zerou, fecha o modal automaticamente
  useEffect(() => {
    if (countdown <= 0) {
      setShow(false);
    }
  }, [countdown, setShow]);

  const handleRenew = async () => {
    if (!session) return;
    setRenewing(true);
    try {
      const response = await SessionService.heartbeat(session.session_id);
      if (response.status === 'active') {
        // Heartbeat ok, fecha modal (countdown será atualizado pelo useHeartbeat)
        setShow(false);
      }
    } catch (e) {
      console.error('Erro ao renovar', e);
    } finally {
      setRenewing(false);
    }
  };

  if (!show) return null;

  // Formata o countdown em MM:SS para o modal
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-[450px] bg-white border border-slate-300 shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-blue-600" />
            <span className="text-[10.5px] font-bold text-slate-800">
              CertGuard – A sessão está sendo finalizada
            </span>
          </div>
          <button
            onClick={() => setShow(false)}
            className="p-1 hover:bg-slate-200 rounded"
          >
            <X size={12} />
          </button>
        </div>

        <div className="bg-white p-8 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-800">Cert</span>
              <span className="font-bold text-xl text-blue-600">Guard</span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-blue-800">
              Sua sessão será encerrada em:
            </h4>
            <p className="text-3xl font-black text-slate-800 mt-2 tabular-nums">
              {formatted}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              (ou {countdown} segundos)
            </p>
          </div>

          <button
            onClick={handleRenew}
            disabled={renewing}
            className="px-6 py-2.5 border-2 border-slate-400 bg-slate-50 hover:bg-slate-100 disabled:bg-slate-200 rounded text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Check size={14} className="text-emerald-600" />
            {renewing ? 'Renovando...' : 'Renovar sessão'}
          </button>
        </div>
      </div>
    </div>
  );
}