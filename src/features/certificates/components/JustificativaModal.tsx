import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface JustificativaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (justificativa: string) => void;
  certificadoNome: string;
}

export function JustificativaModal({
  open,
  onClose,
  onConfirm,
  certificadoNome,
}: JustificativaModalProps) {
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!justificativa.trim()) return;
    setLoading(true);
    try {
      await onConfirm(justificativa);
      setJustificativa('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-[500px] bg-white border border-slate-300 shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">
            Justificativa obrigatória
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600">
            Para ativar o certificado <strong>{certificadoNome}</strong>, é
            necessário informar uma justificativa de uso. Esta informação será
            registrada na auditoria do sistema.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Justificativa
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex: Emissão de NF-e para cliente XYZ, ref. pedido 12345"
              rows={4}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Mínimo 10 caracteres
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || justificativa.trim().length < 10}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Send size={12} />
            {loading ? 'Ativando...' : 'Ativar Certificado'}
          </button>
        </div>
      </div>
    </div>
  );
}