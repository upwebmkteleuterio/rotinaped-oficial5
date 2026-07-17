import * as React from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.toString() };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro de renderização interceptado:', error, errorInfo);
  }

  render() {
    const { hasError, errorMessage } = this.state as State;
    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-rose-500 text-3xl font-black">!</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            Oops, ocorreu um erro!
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-sm">
            O aplicativo encontrou um problema ao tentar carregar ou processar as informações da tela.
          </p>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 w-full max-w-md overflow-x-auto mb-8 shadow-sm">
            <p className="text-xs text-rose-500 font-mono text-left break-words">
              {errorMessage}
            </p>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#1b6392] hover:bg-[#134e75] text-white px-8 py-4 rounded-2xl font-bold active:scale-95 transition-transform"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}
