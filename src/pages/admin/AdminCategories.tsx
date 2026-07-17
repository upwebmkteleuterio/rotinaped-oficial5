import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  AlertCircle,
  Check,
  X,
  Type,
  Palette
} from 'lucide-react';
import { libraryService, Category } from '@/services/libraryService';
import { cn } from '@/lib/utils';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // New/Edit category state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    { name: 'Azul', value: 'blue', class: 'bg-blue-500' },
    { name: 'Verde', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Rosa', value: 'rose', class: 'bg-rose-500' },
    { name: 'Laranja', value: 'orange', class: 'bg-orange-500' },
    { name: 'Roxo', value: 'purple', class: 'bg-purple-500' },
    { name: 'Âmbar', value: 'amber', class: 'bg-amber-500' },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await libraryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Erro ao buscar categorias:', err);
      setError('Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      if (editingCategory) {
        await libraryService.updateCategory(editingCategory.id, { name, color });
      } else {
        await libraryService.createCategory({ name, color });
      }
      setIsModalOpen(false);
      setName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Artigos vinculados a ela ficarão sem categoria.')) return;
    
    try {
      await libraryService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert('Erro ao excluir categoria: ' + err.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Categorias da Biblioteca</h2>
          <p className="text-slate-500 text-sm">Gerencie os grupos de conteúdo para as postagens.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditingCategory(null);
              setName('');
              setColor('blue');
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-2 bg-[#1b6392] hover:bg-[#154d72] text-white px-5 py-2.5 rounded-xl hover:shadow-md active:scale-95 transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
          <button 
            onClick={fetchCategories}
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
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] text-sm bg-slate-50/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-400">Nenhuma categoria encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div 
              key={category.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative"
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-110",
                  category.color === 'blue' && "bg-blue-500",
                  category.color === 'emerald' && "bg-emerald-500",
                  category.color === 'rose' && "bg-rose-500",
                  category.color === 'orange' && "bg-orange-500",
                  category.color === 'purple' && "bg-purple-500",
                  category.color === 'amber' && "bg-amber-500",
                  !category.color && "bg-slate-400"
                )}>
                  {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{category.name}</h3>
                  <p className="text-xs text-slate-500">ID: {category.id.substring(0, 8)}...</p>
                </div>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setName(category.name);
                    setColor(category.color || 'blue');
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 bg-slate-100 text-slate-600 hover:bg-[#1b6392] hover:text-white rounded-lg transition-all"
                >
                  <Type size={14} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1.5 bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova/Editar Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Saúde, Alimentação, Sono..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">Cor da Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                        color === c.value 
                          ? "bg-slate-50 border-[#1b6392] text-[#1b6392] shadow-sm ring-1 ring-[#1b6392]" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full", c.class)} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-xs font-bold bg-[#1b6392] hover:bg-[#154d72] text-white rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingCategory ? 'Atualizar' : 'Salvar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
