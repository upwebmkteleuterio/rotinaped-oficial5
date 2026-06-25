"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.toString() };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro de renderização interceptado:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
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
              {this.state.errorMessage}
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

    return this.props.children;
  }
}