import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  Search, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ArticleModal from '../components/library/ArticleModal';
import { LibraryArticle } from '../types';

// Dynamic Icon Renderer
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.BookOpen;
  return <IconComponent className={className} />;
};

// Helper to map color ID to Tailwind classes
const getCategoryColorClasses = (colorId: string) => {
  switch (colorId) {
    case 'rose': return 'bg-rose-50 text-rose-500';
    case 'blue': return 'bg-blue-50 text-brand-blue';
    case 'emerald': return 'bg-emerald-50 text-emerald-500';
    case 'amber': return 'bg-amber-50 text-amber-600';
    case 'slate': return 'bg-slate-50 text-slate-500';
    case 'purple': return 'bg-purple-50 text-purple-500';
    case 'pink': return 'bg-pink-50 text-pink-500';
    case 'indigo': return 'bg-indigo-50 text-indigo-500';
    default: return 'bg-blue-50 text-brand-blue';
  }
};

export default function Library() {
  const { libraryCategories, libraryArticles } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<LibraryArticle | null>(null);
  const location = useLocation();

  // Handle opening article passed via router state (e.g. from Dashboard "Dicas de Hoje")
  useEffect(() => {
    if (location.state?.openArticleId && libraryArticles.length > 0) {
      const article = libraryArticles.find(a => a.id === location.state.openArticleId);
      if (article) {
        setSelectedArticle(article);
        // Clear state so it doesn't reopen on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, libraryArticles]);

  const featuredArticle = libraryArticles.find(a => a.isFeatured) || libraryArticles[0];

  const filteredCategories = libraryCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArticles = libraryArticles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openArticleByCategory = (categoryId: string) => {
    const article = libraryArticles.find(a => 
      a.categoryId === categoryId || 
      (typeof a.category === 'object' && a.category && a.category.id === categoryId)
    );
    if (article) {
      setSelectedArticle(article);
    } else {
      alert('Nenhum artigo cadastrado para esta categoria ainda.');
    }
  };

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

        {searchTerm && filteredArticles.length > 0 && (
          <section className="space-y-6">
             <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Artigos Encontrados</h3>
             <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <motion.div key={article.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card 
                      onClick={() => setSelectedArticle(article)}
                      className="p-5 flex gap-4 bg-white border border-slate-100 group cursor-pointer active:scale-[0.98] transition-all"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                         <img src={article.imageUrl || 'https://picsum.photos/seed/doc/200/200'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                         <h4 className="font-bold text-slate-800 tracking-tight group-hover:text-brand-blue transition-colors line-clamp-1">{article.title}</h4>
                         <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1">{article.summary}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
             </div>
          </section>
        )}

        {searchTerm && filteredArticles.length === 0 && (
          <div className="py-12 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <Search className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-bold">Nenhum artigo encontrado para "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-brand-blue text-xs font-bold uppercase tracking-widest"
            >
              Limpar Busca
            </button>
          </div>
        )}

        {/* Featured Card */}
        {featuredArticle && !searchTerm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card 
              onClick={() => setSelectedArticle(featuredArticle)}
              className="relative aspect-[1/1.1] overflow-hidden rounded-[2.5rem] shadow-xl group cursor-pointer"
            >
              <img 
                src={featuredArticle.imageUrl || 'https://picsum.photos/seed/doc/800/1000'} 
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
                  onClick={(e) => { e.stopPropagation(); setSelectedArticle(featuredArticle); }}
                  className="bg-white text-brand-blue w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  Ler Artigo Completo <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Topics Grid */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Explorar por Temas</h3>
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const colorClasses = getCategoryColorClasses(category.color || 'blue');
              return (
                <motion.div 
                  key={category.id} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    onClick={() => openArticleByCategory(category.id)}
                    className="p-6 flex items-center justify-between group transition-all bg-white border border-slate-100"
                  >
                    <div className="flex gap-5">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", colorClasses)}>
                        <DynamicIcon name={category.icon} className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-slate-800 tracking-tight">{category.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">Ver orientações</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-blue transition-colors" />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Authoritative Trust Banner */}
        <section className="pt-4">
          <Card className="bg-slate-50 border border-slate-100 p-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-brand-blue uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Fontes Oficiais
            </div>
            <h3 className="text-3xl font-bold text-slate-800 leading-tight">Apoio na tomada de decisões seguras.</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nossa biblioteca é atualizada mensalmente seguindo os protocolos da Sociedade Brasileira de Pediatria, garantindo que você tenha acesso apenas ao que há de mais recente na ciência.
            </p>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-sm">
               <img 
                 src="https://picsum.photos/seed/reading/600/400" 
                 alt="Trust banner" 
                 className="w-full h-full object-cover grayscale opacity-80"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-blue-900/10" />
            </div>
          </Card>
        </section>
      </main>

      {/* Article Detail Modal */}
      <ArticleModal 
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}