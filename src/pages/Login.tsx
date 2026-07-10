import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'motion/react';
import { Baby, Eye, EyeOff, Mail, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Validations
  const validateFullName = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed.includes(' ')) return false; // Deve conter pelo menos um sobrenome
    const parts = trimmed.split(/\s+/);
    return parts.length >= 2 && parts.every(part => part.length >= 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic common validations
    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validate full name
        if (!fullName) {
          setErrorMsg('Por favor, digite seu nome completo.');
          setLoading(false);
          return;
        }

        if (!validateFullName(fullName)) {
          setErrorMsg('Por favor, insira um nome completo válido (Nome e Sobrenome, com mínimo de 2 letras cada).');
          setLoading(false);
          return;
        }

        // SignUp flow with custom metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'client'
            }
          }
        });

        if (error) {
          throw error;
        }

        setSuccessMsg('Conta criada com sucesso! Verifique seu e-mail para confirmação se necessário.');
        // Auto signin or toggle to signin mode
        setTimeout(() => {
          setMode('signin');
          setErrorMsg(null);
          setSuccessMsg(null);
        }, 3000);

      } else {
        // SignIn flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      // Friendly messages in Portuguese
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
        setErrorMsg('E-mail ou senha incorretos. Por favor, tente novamente.');
      } else if (err.message?.includes('User already registered') || err.message?.includes('user_already_exists')) {
        setErrorMsg('Este endereço de e-mail já está cadastrado.');
      } else {
        setErrorMsg(err.message || 'Ocorreu um erro ao processar sua solicitação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Por favor, digite seu e-mail para recuperar a senha.');
      return;
    }

    setResetLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      console.error('Erro ao enviar recuperação:', err);
      setErrorMsg(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50 to-white px-6 py-10">
      {/* Top Branding Section */}
      <div className="flex flex-col items-center text-center mt-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-16 h-16 bg-[#1b6392] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4"
        >
          <Baby className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-2xl font-bold text-slate-800 tracking-tight"
        >
          Rotina<span className="text-[#1b6392]">Ped</span>
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-slate-500 text-xs mt-1 max-w-[280px]"
        >
          Seu assistente inteligente de rotina pediátrica e controle de vacinas.
        </motion.p>
      </div>

      {/* Auth Card Container */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 my-6"
      >
        {/* TABS FOR MODE SWITCHING */}
        <div className="relative flex bg-slate-100 p-1 rounded-2xl mb-6">
          {/* Entrar Tab */}
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`relative z-10 w-1/2 py-2.5 text-xs font-bold rounded-xl transition-colors duration-300 ${
              mode === 'signin' ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            Entrar
          </button>
          
          {/* Criar Conta Tab */}
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`relative z-10 w-1/2 py-2.5 text-xs font-bold rounded-xl transition-colors duration-300 ${
              mode === 'signup' ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            Criar Conta
          </button>

          {/* Sliding Indicator Background */}
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute top-1 bottom-1 left-1 bg-white rounded-xl shadow-sm border border-slate-100"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{ x: mode === 'signin' ? '0%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* FEEDBACK MESSAGES */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 text-xs bg-rose-50 text-rose-600 p-3.5 rounded-2xl border border-rose-100 font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 text-xs bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100 font-medium"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-bold text-slate-500 pl-1">Nome Completo</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nome e Sobrenome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392] focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 pl-1">Endereço de e-mail</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392] focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 pl-1">Senha</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392] focus:bg-white transition-all text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="flex justify-end px-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-[10px] font-bold text-slate-400 hover:text-[#1b6392] transition-colors flex items-center gap-1"
              >
                {resetLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : null}
                Esqueceu a senha?
              </button>
            </div>
          )}

          <button

            type="submit"
            disabled={loading}
            className="w-full bg-[#1b6392] text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-blue-900/10 hover:bg-[#134e75] active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signin' ? (
              'Entrar com Segurança'
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-slate-400">
        <p>© {new Date().getFullYear()} RotinaPed. Proteção de dados garantida de acordo com LGPD.</p>
      </div>
    </div>
  );
}
