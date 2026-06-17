import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#1b6392] border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-slate-500 text-sm font-medium animate-pulse">Verificando permissões...</div>
      </div>
    );
  }

  // Se não estiver autenticado ou não for administrador, manda para o dashboard padrão
  if (!user || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
