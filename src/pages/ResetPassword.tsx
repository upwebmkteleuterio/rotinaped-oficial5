import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/common/UI';
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionCheck, setSessionCheck] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Sessão expirada ou link inválido. Por favor, solicite uma nova recuperação de senha.');
        setSessionCheck(false);
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {

    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password: password,
      });

      if (resetError) throw resetError;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-xl border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-brand-blue" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Redefinir Senha</h1>
            <p className="text-slate-500 text-center mt-2">
              Escolha uma nova senha segura para sua conta.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Senha alterada com sucesso!</h2>
                <p className="text-slate-500 mb-6">Você será redirecionado para a tela de login em alguns segundos.</p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#1b6392] text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-blue-900/10 hover:bg-[#134e75] active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  Ir para o Login agora
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392] focus:bg-white transition-all text-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392] focus:bg-white transition-all text-slate-800"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium border border-rose-100"
                  >
                    {error}
                  </motion.div>
                )}

                {sessionCheck && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1b6392] text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-blue-900/10 hover:bg-[#134e75] active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Redefinindo...
                      </>
                    ) : (
                      'Redefinir Senha'
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o Login
                </button>
              </form>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
