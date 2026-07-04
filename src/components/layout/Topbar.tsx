import { Minus, Square, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../features/auth/auth.store';

export function Topbar() {
  const logout = useAuthStore((s) => s.logout);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const handleMinimize = () => {
    console.log('[Topbar] Minimize clicked');
    window.ipcRenderer.send('window:minimize');
  };
  const handleMaximize = () => {
    console.log('[Topbar] Maximize clicked');
    window.ipcRenderer.send('window:maximize');
  };
  const handleClose = () => {
    console.log('[Topbar] Close clicked');
    window.ipcRenderer.send('window:close');
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  return (
    <div
      className="bg-gray-100 border-b border-gray-300 h-8 flex justify-between items-center px-3 text-xs select-none"
    >
      {/* Lado Esquerdo: Logo + usuário logado */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-blue-600 rounded flex items-center justify-center text-white text-[10px]">
            🛡️
          </div>
          <span className="font-medium text-[11px]">CertGuard</span>
        </div>

        {/* Indicador de usuário logado */}
        {token && user && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="font-medium">{user.name}</span>
          </div>
        )}
      </div>

      {/* Lado Direito: Controles de janela + logout */}
      <div className="flex items-center">
        {token && (
          <button
            type="button"
            onClick={handleLogout}
            onMouseDown={(e) => e.stopPropagation()}
            className="hover:bg-rose-100 hover:text-rose-700 text-gray-500 h-8 px-2 flex items-center gap-1 transition-all rounded mr-1"
            title="Sair"
          >
            <LogOut size={12} />
            <span className="text-[10px] font-bold">Sair</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleMinimize}
          onMouseDown={(e) => e.stopPropagation()}
          className="hover:bg-gray-200 h-8 w-8 flex items-center justify-center transition-all"
          title="Minimizar"
        >
          <Minus size={12} />
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          onMouseDown={(e) => e.stopPropagation()}
          className="hover:bg-gray-200 h-8 w-8 flex items-center justify-center transition-all"
          title="Maximizar"
        >
          <Square size={10} />
        </button>
        <button
          type="button"
          onClick={handleClose}
          onMouseDown={(e) => e.stopPropagation()}
          className="hover:bg-red-500 hover:text-white h-8 w-8 flex items-center justify-center transition-all"
          title="Fechar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}