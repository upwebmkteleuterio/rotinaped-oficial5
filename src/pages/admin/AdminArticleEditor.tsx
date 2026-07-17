import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  X, 
  RefreshCw, 
  AlertCircle,
  Check,
  Type,
  FileText,
  Tag
} from 'lucide-react';
import { libraryService, Article, Category } from '@/services/libraryService';
import RichTextEditor from '@/components/common/RichTextEditor';
import { cn } from '@/lib/utils';

export default function AdminArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await libraryService.getCategories();
        setCategories(cats);

        if (isEditing && id) {
          const article = await libraryService.getArticleById(id);
          setTitle(article.title);
          setSummary(article.summary || '');
          setContent(article.content);
          setCategoryId(article.category_id || '');
          setImageUrl(article.image_url || '');
          setIsFeatured(article.is_featured || false);
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar as informações do artigo.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await libraryService.uploadImage(file);
      setImageUrl(url);
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Título e descrição são obrigatórios.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const articleData: Partial<Article> = {
        title,
        summary,
        content,
        category_id: categoryId || null,
        image_url: imageUrl || null,
        is_featured: isFeatured
      };

      if (isEditing && id) {
        await libraryService.updateArticle(id, articleData);
      } else {
        await libraryService.createArticle(articleData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar o artigo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#1b6392]" />
        <p className="text-slate-500 font-medium">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/articles')}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Voltar para a lista</span>
        </button>

        {success && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 text-sm font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
            <Check size={18} />
            <span>Postagem salva com sucesso!</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isEditing ? 'Editar Postagem' : 'Nova Postagem'}
            </h2>
            <p className="text-slate-500 text-sm">Preencha as informações para publicar na biblioteca.</p>
          </div>
          <div className={cn(
            "hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold",
            isEditing ? "bg-amber-50 text-amber-600" : "bg-[#1b6392]/10 text-[#1b6392]"
          )}>
            {isEditing ? 'Modo Edição' : 'Novo Conteúdo'}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm flex items-center space-x-3">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Seção Principal: Título e Resumo */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                <Type size={16} className="text-[#1b6392]" />
                <span>Título da Postagem *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Um título atraente para o seu conteúdo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-base bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categoria */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                  <Tag size={16} className="text-[#1b6392]" />
                  <span>Categoria</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Destaque */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                  <Check size={16} className="text-[#1b6392]" />
                  <span>Destaque</span>
                </label>
                <div 
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={cn(
                    "w-full px-4 py-3 border rounded-2xl text-sm transition-all cursor-pointer flex items-center justify-between",
                    isFeatured 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" 
                      : "bg-slate-50/50 border-slate-200 text-slate-500"
                  )}
                >
                  <span>Aparecer em destaque na biblioteca?</span>
                  <div className={cn(
                    "w-10 h-6 rounded-full relative transition-colors duration-200",
                    isFeatured ? "bg-emerald-500" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200",
                      isFeatured ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                <FileText size={16} className="text-[#1b6392]" />
                <span>Resumo Curto (Opcional)</span>
              </label>
              <textarea
                placeholder="Um pequeno texto que aparece na listagem antes do clique..."
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] transition-all resize-none"
              />
            </div>
          </div>

          {/* Seção Imagem */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
              <ImageIcon size={16} className="text-[#1b6392]" />
              <span>Imagem de Capa</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="relative group aspect-video bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300 mb-2">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Nenhuma imagem carregada</p>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-[#1b6392]" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-[#1b6392]/5 p-4 rounded-2xl border border-[#1b6392]/10">
                  <h4 className="text-xs font-bold text-[#1b6392] uppercase tracking-wider mb-2">Upload de Arquivo</h4>
                  <p className="text-[10px] text-slate-500 mb-3">Recomendado: 1200x630px (formato horizontal). Máx 5MB.</p>
                  <label className="flex items-center justify-center space-x-2 bg-white border border-[#1b6392]/20 text-[#1b6392] py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#1b6392] hover:text-white transition-all active:scale-95 shadow-sm">
                    <Upload size={14} />
                    <span>Selecionar Imagem</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type size={14} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem aqui..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Conteúdo (Rich Text) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
              <FileText size={16} className="text-[#1b6392]" />
              <span>Conteúdo da Postagem *</span>
            </label>
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
              className="min-h-[400px]"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/articles')}
              className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-10 py-3 bg-[#1b6392] hover:bg-[#154d72] text-white font-bold rounded-2xl shadow-lg shadow-[#1b6392]/20 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? 'Salvar Alterações' : 'Publicar Agora'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
