import { LibraryArticle } from '../../types';
import Modal from '../common/Modal';
import { ShieldCheck, Calendar, User, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ArticleModalProps {
  article: LibraryArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  if (!article) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Orientação Médica"
    >
      <div className="space-y-6">
        {article.imageUrl && (
          <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-sm">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm text-slate-600 active:scale-95 transition-transform cursor-pointer">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              <ShieldCheck className="w-4 h-4" /> Conteúdo Verificado
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 leading-tight tracking-tight">
            {article.title}
          </h2>

          <div className="flex items-center gap-6 py-2 border-y border-slate-50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Atualizado em 2024
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <User className="w-4 h-4" /> Comitê Científico
             </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="text-slate-600 leading-relaxed space-y-4 text-sm font-medium">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {article.authoritativeSources && article.authoritativeSources.length > 0 && (
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fontes Consultadas</h4>
            <div className="flex flex-wrap gap-2">
              {article.authoritativeSources.map((source, idx) => (
                <span key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-600">
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-full bg-slate-100 text-slate-600 font-bold py-5 rounded-2xl active:opacity-50 transition-opacity mt-4"
        >
          Fechar Leitura
        </button>
      </div>
    </Modal>
  );
}
