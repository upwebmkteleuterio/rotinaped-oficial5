import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, ShieldCheck, Tag } from 'lucide-react';
import { libraryService, Article } from '@/services/libraryService';
import Header from '@/components/layout/Header';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const data = await libraryService.getArticleById(id);
        setArticle(data);
      } catch (err: any) {
        console.error('Erro ao buscar artigo:', err);
        setError('Não foi possível carregar este artigo.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="pb-24 bg-white min-h-screen">
        <div className="h-64 bg-slate-100 animate-pulse" />
        <div className="px-6 -mt-10 space-y-4">
          <div className="h-10 bg-slate-100 rounded-2xl w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded-xl w-1/4 animate-pulse" />
          <div className="space-y-2 pt-8">
            <div className="h-4 bg-slate-100 rounded-xl w-full animate-pulse" />
            <div className="h-4 bg-slate-100 rounded-xl w-full animate-pulse" />
            <div className="h-4 bg-slate-100 rounded-xl w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pb-24 bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Ops! Artigo não encontrado</h2>
        <p className="text-slate-500 mt-2 mb-8">{error || 'Este artigo pode ter sido removido.'}</p>
        <button 
          onClick={() => navigate('/library')}
          className="bg-brand-blue text-white px-8 py-3 rounded-2xl font-bold active:scale-95 transition-all"
        >
          Voltar para Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white min-h-screen">
      <div className="relative h-80 w-full overflow-hidden">
        {article.image_url ? (
          <img 
            src={article.image_url} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
            <ShieldCheck size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <button 
          onClick={handleShare}
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white active:scale-95 transition-all"
        >
          <Share2 size={20} />
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          {article.category && (
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/30 backdrop-blur-sm mb-3 inline-block",
              article.category.color === 'blue' && "bg-blue-500/50",
              article.category.color === 'emerald' && "bg-emerald-500/50",
              article.category.color === 'rose' && "bg-rose-500/50",
              article.category.color === 'orange' && "bg-orange-500/50",
              article.category.color === 'purple' && "bg-purple-500/50",
              article.category.color === 'amber' && "bg-amber-500/50",
              !article.category.color && "bg-slate-400/50"
            )}>
              {article.category.name}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      <main className="px-6 py-8">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-8 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Publicado em {new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-emerald-600">Conteúdo Revisado</span>
          </div>
        </div>

        {article.summary && (
          <p className="text-slate-600 font-medium text-base mb-8 leading-relaxed italic border-l-4 border-brand-blue/20 pl-4">
            {article.summary}
          </p>
        )}

        {/* Render HTML content safely with professional typography */}
        <div 
          className="prose prose-slate prose-brand-blue max-w-none 
            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
            prose-headings:text-slate-800 prose-headings:font-bold prose-headings:tracking-tight
            prose-strong:text-slate-800 prose-strong:font-bold
            prose-a:text-brand-blue prose-a:underline prose-a:font-medium
            prose-li:text-slate-600 prose-li:mb-2"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-blue" />
            Aviso Médico
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Este conteúdo tem caráter meramente informativo e não substitui a consulta médica. 
            Em caso de dúvidas sobre a saúde do seu filho, procure sempre o pediatra de confiança ou 
            uma unidade de pronto atendimento.
          </p>
        </div>
      </main>
    </div>
  );
}
