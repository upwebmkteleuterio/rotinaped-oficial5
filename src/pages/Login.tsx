import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'motion/react';
import { Baby, ShieldCheck } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-50 to-white px-6 py-12">
      {/* Top Section / Branding */}
      <div className="flex flex-col items-center text-center mt-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-20 h-20 bg-[#1b6392] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6"
        >
          <Baby className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-slate-800 tracking-tight"
        >
          Rotina<span className="text-[#1b6392]">Ped</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-500 text-sm mt-2 max-w-[280px]"
        >
          Seu assistente inteligente de pediatria, rotina e acompanhamento de vacinas.
        </motion.p>
      </div>

      {/* Middle Section / Auth Form Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 my-8"
      >
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#1b6392] bg-blue-50 px-3 py-1.5 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4" />
          Acesso Seguro Integrado
        </div>

        <Auth
          supabaseClient={supabase}
          view="sign_in"
          showLinks={false}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#1b6392',
                  brandAccent: '#134e75',
                  brandButtonText: '#ffffff',
                  defaultButtonBackground: '#ffffff',
                  defaultButtonBackgroundHover: '#f8fafc',
                  inputBackground: '#ffffff',
                  inputBorder: '#cbd5e1',
                  inputBorderHover: '#94a3b8',
                  inputBorderFocus: '#1b6392',
                  inputText: '#0f172a',
                  inputPlaceholder: '#94a3b8',
                },
                radii: {
                  borderRadiusButton: '1rem',
                  inputBorderRadius: '1rem',
                },
                fontSizes: {
                  baseInputSize: '15px',
                  baseButtonSize: '15px',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Endereço de e-mail',
                password_label: 'Senha',
                email_input_placeholder: 'exemplo@email.com',
                password_input_placeholder: 'Sua senha de acesso',
                button_label: 'Entrar com Segurança',
                loading_button_label: 'Autenticando...',
              },
            },
          }}
          theme="light"
        />
      </motion.div>

      {/* Bottom Section / Security Footer */}
      <div className="text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} RotinaPed. Proteção de dados garantida.</p>
      </div>
    </div>
  );
}
