import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

export type UserRole = 'admin' | 'client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync session details and extract user role from app_metadata or user_metadata
  const handleSession = (currentSession: Session | null) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      // Sincronização segura e síncrona do papel do usuário diretamente do JWT
      const userRole = (currentUser.app_metadata?.role ||
                        currentUser.user_metadata?.role ||
                        'client') as UserRole;
      setRole(userRole);
      
      // Carregar todos os dados do Supabase de forma assíncrona em background
      useAppStore.getState().loadAllData();
    } else {
      setRole(null);
      // Limpar os estados do Zustand ao deslogar
      useAppStore.getState().reset();
    }
    setLoading(false);
  };

  useEffect(() => {
    // Mecanismo de Segurança: Força um logout único para sincronizar a sessão com o novo cache v2
    const hasCleared = localStorage.getItem('rotinaped_v2_sync_cleared');
    if (!hasCleared) {
      localStorage.setItem('rotinaped_v2_sync_cleared', 'true');
      supabase.auth.signOut().then(() => {
        window.location.reload();
      });
      return;
    }

    // 1. Get initial session immediately
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleSession(initialSession);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      handleSession(currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};