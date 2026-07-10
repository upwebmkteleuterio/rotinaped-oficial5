import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Bell,
  ArrowLeft,
  Menu,
  X,
  LogOut
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import DataBridgeProbe from '../dev/DataBridgeProbe';

interface AdminLayoutProps {
  children: React.ReactNode;
  uiCount?: number; // Permite passar o total de registros renderizados na UI
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      path: '/admin/users', 
      label: 'Usuários/Clientes', 
      icon: Users 
    },
    {
      path: '/admin/plans',
      label: 'Gestão de Planos',
      icon: CreditCard
    },
    {
      path: '/admin/notifications',
      label: 'Disparos em Massa',
      icon: Bell
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row w-screen overflow-x-hidden">
      {/* Botão de Menu para Celular */}
      <div className="bg-[#1b6392] text-white p-4 flex items-center justify-between md:hidden shadow-md">
        <span className="font-bold tracking-wide text-base">Painel RotinaPed</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-lg hover:bg-white/10 active:scale-95 transition-all">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1b6392] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out shadow-2xl
        md:translate-x-0 md:static md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo / Título */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg tracking-wide">RotinaPed</h1>
              <p className="text-xs text-white/75">Área Administrativa</p>
            </div>
            <button className="md:hidden p-1 rounded-lg hover:bg-white/10 active:scale-95 transition-all" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* Menus de Navegação */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-white text-[#1b6392] shadow-md font-semibold' 
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Voltar para o App Comum */}
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            <span>Voltar para o App</span>
          </Link>

          {/* Sair do Sistema */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all text-left"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Sombra de fundo para quando a sidebar estiver aberta no celular */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Header Superior sutil para PC */}
        <header className="hidden md:flex items-center justify-between bg-white px-8 py-4 border-b border-slate-200">
          <span className="text-slate-500 text-sm font-medium">Bem-vinda de volta ao centro de controle</span>
          <div className="flex items-center space-x-2 text-slate-700 text-sm font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* Área útil da página */}
        <div className="p-4 md:p-8 flex-1 space-y-6">
          {/* Sonda de Integridade Data-Bridge flutuando no topo de todas as telas de administração (Ocultada temporariamente) */}
          {/* <DataBridgeProbe uiCount={0} /> */}
          {children}
        </div>
      </main>
    </div>
  );
};