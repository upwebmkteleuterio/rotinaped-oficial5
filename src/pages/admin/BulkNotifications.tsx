import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/common/UI';
import { Bell, Send, Users, CheckSquare, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TargetAudience = 'all' | 'customers';

export default function BulkNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<TargetAudience>('all');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setStatus({ type: 'error', message: 'Preencha o título e a mensagem.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    setProgress(0);

    try {
      // 1. Fetch targeted users
      let query = supabase.from('profiles').select('id');
      
      if (target === 'customers') {
        // Assume 'is_patient' or specific role identifies customers
        // Based on the schema check earlier, 'is_patient' exists and role defaults to 'client'
        query = query.eq('is_patient', true); 
      }

      const { data: users, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      if (!users || users.length === 0) {
        setStatus({ type: 'error', message: 'Nenhum usuário encontrado para este filtro.' });
        setLoading(false);
        return;
      }

      // 2. Prepare notifications
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type: 'announcement', // Custom type for bulk notifications
        is_read: false
      }));

      // 3. Batch insert (Supabase handles batching efficiently)
      // For large amounts of data, we could chunk this, but for common use cases batch insert is fine.
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;

      setStatus({ 
        type: 'success', 
        message: `Notificação enviada com sucesso para ${users.length} usuários.` 
      });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      console.error('Error sending bulk notifications:', err);
      setStatus({ type: 'error', message: err.message || 'Erro ao enviar notificações.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Disparos em Massa</h1>
          <p className="text-slate-500">Envie notificações importantes para grupos de usuários.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          <span>Atenção: Esta ação não pode ser desfeita.</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Título da Notificação</label>
              <input
                placeholder="Ex: Atualização Importante"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392] focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Mensagem</label>
              <textarea
                placeholder="Escreva aqui o conteúdo da notificação..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1b6392] focus:border-transparent outline-none transition-all text-slate-700 bg-slate-50/50"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-12 bg-[#1b6392] text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-900/10 hover:bg-[#134e75] active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Disparar Agora
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  status.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Filter Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1b6392]" />
              Público-Alvo
            </h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  target === 'all' 
                    ? 'border-[#1b6392] bg-blue-50/50 shadow-sm ring-1 ring-[#1b6392]' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Todos os Usuários</span>
                  {target === 'all' && <CheckSquare className="w-5 h-5 text-[#1b6392]" />}
                </div>
                <p className="text-xs text-slate-500">Envia para toda a base cadastrada no sistema.</p>
              </button>

              <button
                type="button"
                onClick={() => setTarget('customers')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  target === 'customers' 
                    ? 'border-[#1b6392] bg-blue-50/50 shadow-sm ring-1 ring-[#1b6392]' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Apenas Clientes</span>
                  {target === 'customers' && <CheckSquare className="w-5 h-5 text-[#1b6392]" />}
                </div>
                <p className="text-xs text-slate-500">Envia apenas para usuários marcados como pacientes/clientes.</p>
              </button>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50/30 border-blue-100">
            <h3 className="font-bold text-slate-800 mb-2">Dica de Segurança</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O sistema utiliza RLS (Row Level Security) para garantir que apenas administradores autenticados possam realizar disparos em massa. Todas as notificações são registradas individualmente.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
