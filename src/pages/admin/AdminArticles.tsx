import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2,
  Calendar,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { libraryService, Article } from '@/services/libraryService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await libraryService.getArticles();
      setArticles(data);
    } catch (err: any) {
      console.error('Erro ao buscar artigos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) return;
    try {
      await libraryService.deleteArticle(id);
      fetchArticles();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
    setActiveMenuId(null);
  };

  const handleDuplicate = async (article: Article) => {
    try {
      setLoading(true);
      await libraryService.duplicateArticle(article);
      await fetchArticles();
    } catch (err: any) {
      alert('Erro ao duplicar: ' + err.message);
    } finally {
      setLoading(false);
      setActiveMenuId(null);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Postagens da Biblioteca</h2>
          <p className="text-slate-500 text-sm">Gerencie artigos, dicas e orientações para os usuários.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin/articles/new')}
            className="flex items-center justify-center space-x-2 bg-[#1b6392] hover:bg-[#154d72] text-white px-5 py-2.5 rounded-xl hover:shadow-md active:scale-95 transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Postagem</span>
          </button>
          <button 
            onClick={fetchArticles}
            className="flex items-center justify-center bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] text-sm bg-slate-50/50"
          />
        </div>
        <div className="text-slate-500 text-xs font-medium">
          Total: <span className="text-slate-800 font-bold">{filteredArticles.length}</span> postagens
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Postagem</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Publicado em</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && articles.length === 0 ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-2/3"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/3"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded-lg w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    Nenhuma postagem encontrada.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr 
                    key={article.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-200">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate group-hover:text-[#1b6392] transition-colors">{article.title}</h4>
                          {article.summary && <p className="text-xs text-slate-500 truncate max-w-xs">{article.summary}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {article.category ? (
                        <div className="flex items-center space-x-1.5">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            article.category.color === 'blue' && "bg-blue-500",
                            article.category.color === 'emerald' && "bg-emerald-500",
                            article.category.color === 'rose' && "bg-rose-500",
                            article.category.color === 'orange' && "bg-orange-500",
                            article.category.color === 'purple' && "bg-purple-500",
                            article.category.color === 'amber' && "bg-amber-500",
                            !article.category.color && "bg-slate-400"
                          )} />
                          <span className="text-slate-600 font-medium">{article.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sem categoria</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenuId === article.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-20 overflow-hidden"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 w-full transition-colors"
                                  >
                                    <Edit2 size={14} className="text-[#1b6392]" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    onClick={() => handleDuplicate(article)}
                                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 w-full transition-colors"
                                  >
                                    <Copy size={14} className="text-emerald-500" />
                                    <span>Duplicar</span>
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => handleDelete(article.id)}
                                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
