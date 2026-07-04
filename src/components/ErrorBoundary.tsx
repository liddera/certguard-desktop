import { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log do erro (sem expor dados sensíveis)
    console.error('[ErrorBoundary] Erro capturado:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
    });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-50 to-slate-100 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Algo deu errado
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Ocorreu um erro inesperado na aplicação. Por favor, recarregue a
                página para continuar.
              </p>

              {this.state.error && (
                <div className="w-full bg-rose-50 border border-rose-200 rounded-lg p-3 mb-6 text-left">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                    Detalhes do erro
                  </p>
                  <p className="text-xs text-rose-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Shield size={14} />
                Recarregar Aplicação
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}