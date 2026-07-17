import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Card, Skeleton } from '../components/common/UI';
import { 
  Search, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Tag,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { libraryService, Article, Category } from '@/services/libraryService';

export default function Library() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          libraryService.getArticles(),
          libraryService.getCategories()
        ]);
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Erro ao carregar biblioteca:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const featuredArticle = articles.find(a => a.is_featured);

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (a.summary && a.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategoryId || a.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="pb-24 bg-slate-50 min-h-screen">
        <Header />
        <main className="px-6 py-4 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shrink-0">
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-[2.5rem]" />
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <Header />

      <main className="px-6 py-4 space-y-8">
        <section>
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Biblioteca de Orientações</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Conteúdo revisado por SBP, SBIm e GINA</p>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar termos (ex: tosse, mancha...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-200/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
          />
        </div>

        {/* Categories Chips */}
        {!searchTerm && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm",
                !selectedCategoryId 
                  ? "bg-brand-blue text-white shadow-brand-blue/20" 
                  : "bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2",
                  selectedCategoryId === cat.id
                    ? "bg-brand-blue text-white shadow-brand-blue/20"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  selectedCategoryId === cat.id ? "bg-white" : (
                    cat.color === 'blue' ? "bg-blue-500" :
                    cat.color === 'emerald' ? "bg-emerald-500" :
                    cat.color === 'rose' ? "bg-rose-500" :
                    cat.color === 'orange' ? "bg-orange-500" :
                    cat.color === 'purple' ? "bg-purple-500" :
                    cat.color === 'amber' ? "bg-amber-500" : "bg-slate-400"
                  )
                )} />
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Featured Article (Home of Library) */}
        {featuredArticle && !searchTerm && !selectedCategoryId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card 
              onClick={() => navigate(`/library/article/${featuredArticle.id}`)}
              className="relative aspect-[1/1.1] overflow-hidden rounded-[2.5rem] shadow-xl group cursor-pointer border-none"
            >
              <img 
                src={featuredArticle.image_url || 'https://picsum.photos/seed/doc/800/1000'} 
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute top-6 left-6">
                <span className="bg-brand-yellow text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Destaque do Dia
                </span>
              </div>

              <div className="absolute inset-x-8 bottom-8">
                <h3 className="text-3xl font-bold text-white leading-tight mb-3">
                  {featuredArticle.title}
                </h3>
                <p className="text-white/70 text-sm font-medium mb-6 line-clamp-2">
                  {featuredArticle.summary}
                </p>
                <button 
                  className="bg-white text-brand-blue w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  Ler Artigo Completo <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Articles List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {searchTerm ? 'Resultados' : selectedCategoryId ? 'Nesta Categoria' : 'Mais Recentes'}
            </h3>
            {articles.length > filteredArticles.length && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
                {filteredArticles.length} itens
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Search className="w-10 h-10" />
                </div>
                <p className="text-slate-500 font-bold">Nenhum artigo encontrado</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategoryId(null); }}
                  className="text-brand-blue text-xs font-bold uppercase tracking-widest"
                >
                  Ver Tudo
                </button>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <motion.div 
                  key={article.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    onClick={() => navigate(`/library/article/${article.id}`)}
                    className="p-5 flex gap-4 bg-white border border-slate-100 group cursor-pointer hover:shadow-md transition-all rounded-[2rem]"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                       {article.image_url ? (
                         <img src={article.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       ) : (
                         <ShieldCheck className="w-8 h-8 text-slate-200" />
                       )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                       <div className="flex items-center gap-1.5 mb-1">
                         {article.category && (
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded",
                             article.category.color === 'blue' && "bg-blue-50 text-blue-500",
                             article.category.color === 'emerald' && "bg-emerald-50 text-emerald-500",
                             article.category.color === 'rose' && "bg-rose-50 text-rose-500",
                             article.category.color === 'orange' && "bg-orange-50 text-orange-500",
                             article.category.color === 'purple' && "bg-purple-50 text-purple-500",
                             article.category.color === 'amber' && "bg-amber-50 text-amber-500",
                             !article.category.color && "bg-slate-100 text-slate-400"
                           )}>
                             {article.category.name}
                           </span>
                         )}
                       </div>
                       <h4 className="font-bold text-slate-800 tracking-tight group-hover:text-brand-blue transition-colors line-clamp-1">{article.title}</h4>
                       <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1">{article.summary}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-blue self-center flex-shrink-0" />
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Authoritative Trust Banner */}
        {!searchTerm && (
          <section className="pt-4">
            <Card className="bg-slate-100/50 border border-slate-200 p-8 space-y-6 rounded-[2.5rem]">
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Fontes Oficiais
              </div>
              <h3 className="text-3xl font-bold text-slate-800 leading-tight">Apoio na tomada de decisões seguras.</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Nossa biblioteca é atualizada mensalmente seguindo os protocolos da Sociedade Brasileira de Pediatria, garantindo que você tenha acesso apenas ao que há de mais recente na ciência.
              </p>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
