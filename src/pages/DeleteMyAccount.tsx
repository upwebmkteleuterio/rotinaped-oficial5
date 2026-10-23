import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'rotinaped-storage-supabase-v1';
const CONFIRM_WORD = 'EXCLUIR';

export default function DeleteMyAccount() {
  const navigate = useNavigate();
  const { children, reset } = useAppStore();
  const { signOut } = useAuth();

  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = acknowledged && confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const removeExamFiles = async () => {
    // Os arquivos de exames ficam em {childId}/{arquivo} no bucket "exams".
    const paths: string[] = [];

    for (const child of children) {
      const { data: files } = await supabase.storage.from('exams').list(child.id);
      if (files) {
        files.forEach((file) => paths.push(`${child.id}/${file.name}`));
      }
    }

    if (paths.length === 0) return;

    const { error: removeError } = await supabase.storage.from('exams').remove(paths);
    if (removeError) throw removeError;
  };

  const handleDelete = async () => {
    if (!canDelete || loading) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Remove os arquivos de exames enviados (imagens e PDFs).
      //    Uma falha aqui não deve impedir a exclusão da conta.
      try {
        await removeExamFiles();
      } catch (storageError) {
        console.error('Falha ao remover arquivos de exames:', storageError);
      }

      // 2. Exclui a conta e todos os dados vinculados (cascade no banco).
      const { error: rpcError } = await supabase.rpc('delete_my_account');
      if (rpcError) throw rpcError;

      // 3. Limpa o estado em memória e redireciona para a confirmação pública.
      reset();
      navigate('/excluir-conta?excluido=1', { replace: true });

      // 4. Encerra a sessão (o token já está inválido após a exclusão).
      try {
        await signOut();
      } catch (signOutError) {
        console.error('Falha ao encerrar a sessão após a exclusão:', signOutError);
      }

      // 5. Remove os dados persistidos no dispositivo.
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      setError(
        err?.message ||
          'Não foi possível excluir a sua conta. Tente novamente ou entre em contato pelo e-mail contato@rotinaped.com.br.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <main className="px-6 py-4 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Excluir Minha Conta</h2>
        </div>

        {/* Aviso principal */}
        <div className="rounded-3xl bg-rose-50 border border-rose-100 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <h3 className="font-bold text-rose-700 tracking-tight">Esta ação é irreversível</h3>
          </div>
          <p className="text-sm text-rose-600/90 leading-relaxed">
            Ao excluir a sua conta, todos os dados vinculados a ela serão apagados
            permanentemente. Não será possível recuperar nenhuma informação depois da
            confirmação.
          </p>
        </div>

        {/* O que será excluído */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800 tracking-tight text-sm">
            O que será excluído definitivamente
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 leading-relaxed">
            <li>Sua conta, nome, e-mail e senha de acesso.</li>
            <li>Os perfis de todas as crianças acompanhadas.</li>
            <li>O histórico completo de vacinas e a caderneta digital.</li>
            <li>As medições de crescimento e as curvas acompanhadas.</li>
            <li>Os exames cadastrados e os arquivos enviados (imagens e PDFs).</li>
            <li>Os registros de alimentação e amamentação.</li>
            <li>Os lembretes, a rotina e os marcos do desenvolvimento.</li>
            <li>As notificações e as mensagens publicadas na comunidade.</li>
          </ul>
          <p className="text-xs text-slate-400 leading-relaxed">
            Alguns registros podem ser mantidos temporariamente por obrigação legal (por
            exemplo, registros de acesso e registros fiscais).{' '}
            <Link to="/excluir-conta" className="font-bold text-[#1b6392] hover:underline">
              Ver detalhes
            </Link>
          </p>
        </div>

        {/* Confirmação */}
        <div className="rounded-3xl bg-white border border-slate-100 p-6 space-y-5 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-md border-slate-300 text-[#1b6392] focus:ring-[#1b6392] accent-[#1b6392]"
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              Estou ciente de que a exclusão da minha conta é <strong>permanente e
              irreversível</strong> e que todos os dados das crianças que eu acompanho serão
              apagados.
            </span>
          </label>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 pl-1">
              Digite <span className="text-rose-500">{CONFIRM_WORD}</span> para confirmar
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoCapitalize="characters"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all text-slate-800 tracking-widest"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-100">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || loading}
            className={cn(
              'w-full py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              canDelete && !loading
                ? 'bg-rose-500 text-white shadow-md shadow-rose-900/10 hover:bg-rose-600 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Excluindo sua conta...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Excluir Definitivamente
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancelar e voltar
          </button>
        </div>

        <div className="flex items-start gap-3 px-1 pb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            A exclusão é executada de forma automática e imediata em nossos servidores. Se você
            não consegue acessar o aplicativo, também pode solicitar a exclusão por e-mail,
            conforme descrito na nossa Política de Privacidade.
          </p>
        </div>
      </main>
    </div>
  );
}
