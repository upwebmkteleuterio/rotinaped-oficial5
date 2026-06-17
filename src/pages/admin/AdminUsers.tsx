import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, ChevronLeft, ChevronRight, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  updated_at: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const ITEMS_PER_PAGE = 50;

  // Busca os usuários com filtros e paginação no banco
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fromIndex = (page - 1) * ITEMS_PER_PAGE;
      const toIndex = fromIndex + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order('full_name', { ascending: true })
        .range(fromIndex, toIndex);

      if (error) throw error;

      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reseta para a primeira página ao pesquisar
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão de Usuários</h2>
          <p className="text-slate-500 text-sm">Visualize e gerencie todos os clientes cadastrados no aplicativo.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar lista</span>
        </button>
      </div>

      {/* Busca e Resumo */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] text-sm bg-slate-50/50"
          />
        </div>
        <div className="text-slate-500 text-sm font-medium">
          Total: <span className="text-slate-800 font-bold">{totalCount}</span> usuários encontrados
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Nome Completo</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Cadastro</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Perfil</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Plano Ativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-8 h-8 border-3 border-[#1b6392] border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium text-slate-500 text-xs">Carregando dados dos usuários...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Nenhum usuário encontrado com os filtros de busca.
                  </td>
                </tr>
              ) : (
                users.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {profile.full_name || 'Usuário Sem Nome'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {profile.email || 'E-mail não sincronizado'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(profile.updated_at)}
                    </td>
                    <td className="px-6 py-4">
                      {profile.role === 'admin' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Plano Gratuito
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Paginação */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-slate-500 text-sm">
            Página <span className="font-semibold text-slate-800">{page}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-white active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-white active:scale-95 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
