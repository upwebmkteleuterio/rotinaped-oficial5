import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  X, 
  Check, 
  RefreshCw, 
  BookOpen, 
  AlertCircle, 
  Image as ImageIcon, 
  Tag, 
  Eye, 
  FileText,
  Sparkles,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Link as LinkIcon
} from 'lucide-react';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Dynamic Icon Renderer
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
};

// Predefined colors for categories
const CATEGORY_COLORS = [
  { id: 'rose', label: 'Rosa', bg: 'bg-rose-50 text-rose-500 border-rose-100', preview: 'bg-rose-500' },
  { id: 'blue', label: 'Azul', bg: 'bg-blue-50 text-brand-blue border-blue-100', preview: 'bg-blue-500' },
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-50 text-emerald-500 border-emerald-100', preview: 'bg-emerald-500' },
  { id: 'amber', label: 'Amarelo', bg: 'bg-amber-50 text-amber-600 border-amber-100', preview: 'bg-amber-500' },
  { id: 'slate', label: 'Cinza', bg: 'bg-slate-50 text-slate-500 border-slate-100', preview: 'bg-slate-500' },
  { id: 'purple', label: 'Roxo', bg: 'bg-purple-50 text-purple-500 border-purple-100', preview: 'bg-purple-500' },
  { id: 'pink', label: 'Pink', bg: 'bg-pink-50 text-pink-500 border-pink-100', preview: 'bg-pink-500' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-50 text-indigo-500 border-indigo-100', preview: 'bg-indigo-500' }
];

// Predefined icons for categories
const CATEGORY_ICONS = [
  'Thermometer', 'Wind', 'Droplet', 'UtensilsCrossed', 'Moon', 
  'ShieldCheck', 'Heart', 'Baby', 'Brain', 'Activity', 
  'Apple', 'Syringe', 'Sparkles', 'BookOpen', 'Smile'
];

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function AdminLibrary() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Article Form State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleImageUrl, setArticleImageUrl] = useState('');
  const [articleCategoryId, setArticleCategoryId] = useState('');
  const [articleIsFeatured, setArticleIsFeatured] = useState(false);
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');

  // Category Manager State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('BookOpen');
  const [categoryColor, setCategoryColor] = useState('blue');

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories
      const { data: catData, error: catErr } = await supabase
        .from('library_categories')
        .select('*')
        .order('name', { ascending: true });
      if (catErr) throw catErr;

      // Fetch articles
      const { data: artData, error: artErr } = await supabase
        .from('library_articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (artErr) throw artErr;

      setCategories(catData || []);
      setArticles(artData || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados da biblioteca:', err);
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Article Actions
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArticleTitle('');
    setArticleSummary('');
    setArticleContent('');
    setArticleImageUrl('');
    setArticleCategoryId(categories[0]?.id || '');
    setArticleIsFeatured(false);
    setEditorTab('edit');
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleTitle(article.title);
    setArticleSummary(article.summary);
    setArticleContent(article.content);
    setArticleImageUrl(article.image_url || '');
    setArticleCategoryId(article.category_id || '');
    setArticleIsFeatured(article.is_featured);
    setEditorTab('edit');
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleSummary.trim() || !articleContent.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        title: articleTitle.trim(),
        summary: articleSummary.trim(),
        content: articleContent.trim(),
        image_url: articleImageUrl.trim() || null,
        category_id: articleCategoryId || null,
        is_featured: articleIsFeatured
      };

      if (articleIsFeatured) {
        // Se este artigo for destaque, desmarcar todos os outros
        await supabase
          .from('library_articles')
          .update({ is_featured: false })
          .eq('is_featured', true);
      }

      if (editingArticle) {
        const { error: updateErr } = await supabase
          .from('library_articles')
          .update(articleData)
          .eq('id', editingArticle.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('library_articles')
          .insert([articleData]);
        if (insertErr) throw insertErr;
      }

      setIsArticleModalOpen(false);
      await loadAllData();
      // Sincronizar o estado global do app
      await useAppStore.getState().loadAllData();
    } catch (err: any) {
      console.error('Erro ao salvar artigo:', err);
      alert(err.message || 'Erro ao salvar artigo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateArticle = async (article: Article) => {
    if (!window.confirm(`Deseja duplicar o artigo "${article.title}"?`)) return;
    setLoading(true);
    try {
      const duplicatedData = {
        title: `${article.title} (Cópia)`,
        summary: article.summary,
        content: article.content,
        image_url: article.image_url,
        category_id: article.category_id,
        is_featured: false // Nunca duplicar como destaque
      };

      const { error: insertErr } = await supabase
        .from('library_articles')
        .insert([duplicatedData]);
      if (insertErr) throw insertErr;

      await loadAllData();
      await useAppStore.getState().loadAllData();
    } catch (err: any) {
      console.error('Erro ao duplicar artigo:', err);
      alert(err.message || 'Erro ao duplicar artigo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza de que deseja excluir o artigo "${title}"? Esta ação é irreversível.`)) return;
    setLoading(true);
    try {
      const { error: delErr } = await supabase
        .from('library_articles')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;

      await loadAllData();
      await useAppStore.getState().loadAllData();
    } catch (err: any) {
      console.error('Erro ao excluir artigo:', err);
      alert(err.message || 'Erro ao excluir artigo.');
    } finally {
      setLoading(false);
    }
  };

  // Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('BookOpen');
    setCategoryColor('blue');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setCategoryColor(category.color);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Por favor, insira o nome da categoria.');
      return;
    }

    setLoading(true);
    try {
      const catData = {
        name: categoryName.trim(),
        icon: categoryIcon,
        color: categoryColor
      };

      if (editingCategory) {
        const { error: updateErr } = await supabase
          .from('library_categories')
          .update(catData)
          .eq('id', editingCategory.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('library_categories')
          .insert([catData]);
        if (insertErr) throw insertErr;
      }

      setIsCategoryModalOpen(false);
      await loadAllData();
      await useAppStore.getState().loadAllData();
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      alert(err.message || 'Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza de que deseja excluir a categoria "${name}"? Artigos vinculados a ela ficarão sem categoria.`)) return;
    setLoading(true);
    try {
      const { error: delErr } = await supabase
        .from('library_categories')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;

      await loadAllData();
      await useAppStore.getState().loadAllData();
    } catch (err: any) {
      console.error('Erro ao excluir categoria:', err);
      alert(err.message || 'Erro ao excluir categoria.');
    } finally {
      setLoading(false);
    }
  };

  // Markdown Editor Helper
  const insertMarkdown = (syntax: string, placeholder = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    if (syntax === 'bold') {
      replacement = `**${selectedText || placeholder || 'texto em negrito'}**`;
    } else if (syntax === 'italic') {
      replacement = `*${selectedText || placeholder || 'texto em itálico'}*`;
    } else if (syntax === 'h1') {
      replacement = `\n# ${selectedText || placeholder || 'Título 1'}\n`;
    } else if (syntax === 'h2') {
      replacement = `\n## ${selectedText || placeholder || 'Título 2'}\n`;
    } else if (syntax === 'h3') {
      replacement = `\n### ${selectedText || placeholder || 'Título 3'}\n`;
    } else if (syntax === 'list') {
      replacement = `\n- ${selectedText || placeholder || 'Item da lista'}\n`;
    } else if (syntax === 'link') {
      replacement = `[${selectedText || placeholder || 'Texto do link'}](https://exemplo.com)`;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setArticleContent(newContent);
    
    // Refocus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-brand-blue" />
            Biblioteca de Orientações
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie as postagens médicas, artigos informativos e categorias exibidas no aplicativo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenAddCategory}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Tag className="w-4 h-4" />
            Nova Categoria
          </button>
          <button
            onClick={handleOpenAddArticle}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Artigo
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Artigos Publicados ({articles.length})
            </h3>
            <button 
              onClick={loadAllData}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && articles.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Carregando artigos...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Nenhum artigo cadastrado</p>
              <p className="text-slate-400 text-xs mt-1">Clique em "Novo Artigo" para começar a publicar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">Artigo</th>
                    <th className="py-4 px-6">Categoria</th>
                    <th className="py-4 px-6">Destaque</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((article) => {
                    const category = categories.find(c => c.id === article.category_id);
                    const colorTheme = CATEGORY_COLORS.find(c => c.id === category?.color) || CATEGORY_COLORS[1];
                    
                    return (
                      <tr 
                        key={article.id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        onClick={() => handleOpenEditArticle(article)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              {article.image_url ? (
                                <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-brand-blue transition-colors truncate max-w-[250px]">
                                {article.title}
                              </h4>
                              <p className="text-slate-400 text-xs truncate max-w-[250px] mt-0.5">
                                {article.summary}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {category ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorTheme.bg}`}>
                              <DynamicIcon name={category.icon} className="w-3.5 h-3.5" />
                              {category.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Sem categoria</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {article.is_featured ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit shadow-sm">
                              <Sparkles className="w-3 h-3 fill-amber-600 text-amber-600" />
                              Destaque
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditArticle(article)}
                              className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateArticle(article)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Categories List (Right 1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-slate-400" />
              Categorias ({categories.length})
            </h3>
            <button
              onClick={handleOpenAddCategory}
              className="p-1.5 text-brand-blue hover:bg-blue-50 rounded-lg transition-all"
              title="Nova Categoria"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">Nenhuma categoria</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {categories.map((category) => {
                const colorTheme = CATEGORY_COLORS.find(c => c.id === category.color) || CATEGORY_COLORS[1];
                return (
                  <div key={category.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorTheme.bg}`}>
                        <DynamicIcon name={category.icon} className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(category)}
                        className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar Categoria"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ARTICLE CREATION / EDITION MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingArticle ? 'Editar Artigo' : 'Criar Novo Artigo'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preencha as informações abaixo para publicar na biblioteca.
                </p>
              </div>
              <button 
                onClick={() => setIsArticleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Metadata */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Título do Artigo *
                    </label>
                    <input
                      type="text"
                      required
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="Ex: Guia de Lavagem Nasal no Bebê"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Resumo / Subtítulo *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={articleSummary}
                      onChange={(e) => setArticleSummary(e.target.value)}
                      placeholder="Um resumo curto que aparece nos cards de listagem."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Categoria *
                      </label>
                      <select
                        required
                        value={articleCategoryId}
                        onChange={(e) => setArticleCategoryId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                      >
                        <option value="" disabled>Selecione uma categoria</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-50 border border-slate-200 rounded-xl p-3 w-full">
                        <input
                          type="checkbox"
                          checked={articleIsFeatured}
                          onChange={(e) => setArticleIsFeatured(e.target.checked)}
                          className="w-4.5 h-4.5 text-brand-blue border-slate-300 rounded focus:ring-brand-blue"
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Destaque do Dia
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      URL da Imagem de Capa
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        value={articleImageUrl}
                        onChange={(e) => setArticleImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                      />
                    </div>
                    {articleImageUrl && (
                      <div className="mt-3 aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                        <img src={articleImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setArticleImageUrl('')}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Content Editor */}
                <div className="flex flex-col h-full min-h-[350px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Conteúdo do Artigo *
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setEditorTab('edit')}
                        className={`px-3 py-1.5 rounded-md transition-all ${editorTab === 'edit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab('preview')}
                        className={`px-3 py-1.5 rounded-md transition-all ${editorTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>

                  {editorTab === 'edit' ? (
                    <div className="flex-1 flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                      {/* Editor Toolbar */}
                      <div className="bg-white border-b border-slate-200 p-2 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('bold')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Negrito"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('italic')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Itálico"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-slate-200 mx-1 my-1" />
                        <button
                          type="button"
                          onClick={() => insertMarkdown('h1')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Título 1"
                        >
                          <Heading1 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('h2')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Título 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('h3')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Título 3"
                        >
                          <Heading3 className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-slate-200 mx-1 my-1" />
                        <button
                          type="button"
                          onClick={() => insertMarkdown('list')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Lista"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('link')}
                          className="p-2 text-slate-600 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-all"
                          title="Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Textarea */}
                      <textarea
                        id="markdown-editor"
                        required
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        placeholder="Escreva o conteúdo do artigo usando Markdown..."
                        className="flex-1 w-full bg-transparent border-none p-4 text-sm font-medium focus:ring-0 outline-none resize-none min-h-[250px]"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 border border-slate-200 rounded-2xl p-4 bg-white overflow-y-auto max-h-[400px] prose prose-slate max-w-none">
                      {articleContent.trim() ? (
                        <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                          <ReactMarkdown>
                            {articleContent}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic">Nada para visualizar ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATION / EDITION MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Introdução Alimentar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Cor do Tema
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setCategoryColor(color.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all ${categoryColor === color.id ? 'border-brand-blue bg-blue-50/50 ring-2 ring-brand-blue/10' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <span className={`w-4 h-4 rounded-full shrink-0 ${color.preview}`} />
                      <span className="truncate">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Ícone da Categoria
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-[150px] overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                  {CATEGORY_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCategoryIcon(iconName)}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all ${categoryIcon === iconName ? 'bg-brand-blue text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
                      title={iconName}
                    >
                      <DynamicIcon name={iconName} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}