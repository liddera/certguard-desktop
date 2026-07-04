import { useEffect, useMemo, useState } from 'react';
import { RotateCw, Power, X, AlertTriangle, LogOut, Search, ShieldCheck } from 'lucide-react';
import { CertService } from '../cert.service';
import type { Certificado } from '../../../types/api';
import { CertCard } from './CertCard';
import { ExpiryModal } from '../../sessions/components/ExpiryModal';
import { SessaoManager } from '../../sessions/components/SessaoManager';
import {
  useSessionStore,
  formatCountdown,
} from '../../sessions/session.store';
import { SessionService } from '../../sessions/session.service';
import { useAuthStore } from '../../auth/auth.store';

export function CertList() {
  const [certs, setCerts] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  // Filtros (baseado no mockup WidgetWindows.tsx)
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);
  const [showCnpj, setShowCnpj] = useState(true);

  const activeSession = useSessionStore((s) => s.activeSession);
  const countdown = useSessionStore((s) => s.countdown);
  const clearSession = useSessionStore((s) => s.clearSession);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    loadCerts();
  }, []);

  const loadCerts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await CertService.list();
      setCerts(data);
    } catch (e) {
      const error = e as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Erro ao carregar certificados';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadCerts(true);
  };

  const handleDeactivate = async () => {
    if (!activeSession) return;
    if (!confirm('Deseja realmente desativar este certificado?')) return;

    setDeactivating(true);
    try {
      await window.ipcRenderer.invoke('cert:remove-by-thumbprint', {
        thumbprint: activeSession.certificado_id.toString(),
      });
      await SessionService.deactivate(activeSession.session_id);
      clearSession();
    } catch (e) {
      const error = e as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao desativar');
    } finally {
      setDeactivating(false);
    }
  };

  // Filtragem (baseado no WidgetWindows.tsx)
  const filteredCerts = useMemo(() => {
    return certs.filter((cert) => {
      // Filtro "Somente ativos"
      if (onlyActive && cert.status !== 'vigente') {
        return false;
      }

      // Filtro de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const name = (cert.apelido || cert.empresa || '').toLowerCase();
        const cnpj = (cert.cnpj || '').toLowerCase();
        if (!name.includes(term) && !cnpj.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [certs, searchTerm, onlyActive]);

  return (
    <div className="p-6 space-y-4 relative h-full overflow-y-auto">
      {/* SessaoManager invisível */}
      <SessaoManager />

      {/* Header: Título + Countdown (quando ativo) */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-800 leading-tight">
              {activeSession ? 'Certificado Ativo' : 'Certificados Digitais'}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium">
              {activeSession
                ? 'Sessão de uso do certificado em andamento'
                : 'Selecione um certificado para ativar'}
            </p>
          </div>
        </div>

        {/* Countdown quando há sessão ativa */}
        <div className="flex items-center gap-2">
          {/* Botão Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Atualizar lista de certificados"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg text-xs font-bold text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw
              size={12}
              className={`${refreshing ? 'animate-spin text-blue-600' : 'text-gray-500'}`}
            />
            <span>Atualizar</span>
          </button>

          {activeSession && (
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${
                countdown <= 300
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {countdown <= 300 && (
                <AlertTriangle size={12} className="text-amber-600" />
              )}
              <span
                className={`font-mono text-xs font-bold ${
                  countdown <= 300 ? 'text-amber-700' : 'text-blue-700'
                }`}
              >
                {formatCountdown(countdown)}
              </span>
              <RotateCw size={12} className="text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Banner de sessão ativa */}
      {activeSession && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Power size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-900">
                Certificado Ativo
              </p>
              <p className="text-xs text-emerald-700">
                Sessão #{activeSession.session_id} • {activeSession.common_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleDeactivate}
            disabled={deactivating}
            className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            {deactivating ? 'Desativando...' : 'Desativar'}
          </button>
        </div>
      )}

      {/* Filtros e busca */}
      {!loading && !error && certs.length > 0 && (
        <div className="space-y-3">
          {/* Campo de busca */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou CNPJ..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Checkboxes de filtro */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCnpj}
                  onChange={() => setShowCnpj(!showCnpj)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Exibir CNPJ
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={() => setOnlyActive(!onlyActive)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Mostrar somente ativos
              </label>
            </div>

            {/* Contador */}
            <span className="text-[10px] bg-gray-100 border border-gray-200/60 px-2.5 py-1 rounded-full font-bold text-gray-500">
              {filteredCerts.length === certs.length
                ? `${certs.length} ${certs.length === 1 ? 'certificado' : 'certificados'}`
                : `${filteredCerts.length} de ${certs.length}`}
            </span>
          </div>
        </div>
      )}

      {/* Lista de certificados */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <p className="text-rose-700 font-bold text-sm mb-1">
            Não foi possível carregar os certificados
          </p>
          <p className="text-rose-600 text-xs mb-4">{error}</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={12} />
              Sair e logar novamente
            </button>
          </div>
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Nenhum certificado disponível
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <Search size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-bold text-gray-500">
            Nenhum certificado encontrado
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCerts.map((cert) => (
            <CertCard key={cert.id} cert={cert} showCnpj={showCnpj} />
          ))}
        </div>
      )}

      <ExpiryModal />
    </div>
  );
}