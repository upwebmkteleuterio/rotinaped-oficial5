import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  UserPlus, 
  X, 
  Baby, 
  Eye, 
  User, 
  Mail, 
  Check, 
  AlertCircle, 
  WifiOff 
} from 'lucide-react';

const SUPABASE_URL = "https://uorlurdviijaunepstds.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcmx1cmR2aWlqYXVuZXBzdGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTQ5NzcsImV4cCI6MjA5Njc5MDk3N30.V7vqSCubhxX71ako0O2aLFIHn4KxhfMSHfFyF68J-IA";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_patient: boolean;
  updated_at: string | null;
}

interface ChildDb {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  profile_type?: string;
  delivery_type?: string;
  feeding_type?: string;
  allergies?: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const setSimulatedUser = useAppStore(state => state.setSimulatedUser);

  // Estados principais
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estados de erro e limite de carregamento (Timeout)
  const [hasTimeout, setHasTimeout] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filtro persistente no localStorage (Todos ou Apenas Pacientes)
  const [activeFilter, setActiveFilter] = useState<'all' | 'patients'>(() => {
    return (localStorage.getItem('rotinaped_admin_filter') as 'all' | 'patients') || 'all';
  });

  // Estados para o Slide Panel (Detalhes)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userChildren, setUserChildren] = useState<ChildDb[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // Estados para o Modal de Novo Usuário
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserType, setNewUserType] = useState<'comum' | 'paciente'>('comum');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const ITEMS_PER_PAGE = 50;

  // Atualiza localStorage sempre que mudar o filtro
  useEffect(() => {
    localStorage.setItem('rotinaped_admin_filter', activeFilter);
  }, [activeFilter]);

  // Busca os usuários no banco de dados aplicando os filtros, paginação e controle de Timeout
  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);
    setHasTimeout(false);

    // Timeout de 8 segundos
    let isRequestActive = true;
    const timeoutId = setTimeout(() => {
      if (isRequestActive) {
        setHasTimeout(true);
        setLoading(false);
      }
    }, 8000);

    try {
      const fromIndex = (page - 1) * ITEMS_PER_PAGE;
      const toIndex = fromIndex + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Filtro por Paciente vs Todos
      if (activeFilter === 'patients') {
        query = query.eq('is_patient', true);
      }

      // Filtro de pesquisa
      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order('full_name', { ascending: true })
        .range(fromIndex, toIndex);

      isRequestActive = false;
      clearTimeout(timeoutId);

      if (error) throw error;

      setUsers((data as Profile[]) || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      isRequestActive = false;
      clearTimeout(timeoutId);
      console.error('Erro ao buscar usuários:', err);
      setFetchError(err.message || 'Ocorreu um erro de comunicação com o servidor.');
    } finally {
      if (isRequestActive) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, search, activeFilter]);

  // Carrega as crianças de um usuário ao abrir o painel lateral
  useEffect(() => {
    if (selectedUser) {
      const fetchChildren = async () => {
        setLoadingChildren(true);
        try {
          const { data, error } = await supabase
            .from('children')
            .select('id, name, birth_date, gender, profile_type, delivery_type, feeding_type, allergies')
            .eq('user_id', selectedUser.id)
            .order('name', { ascending: true });

          if (error) throw error;
          setUserChildren((data as ChildDb[]) || []);
        } catch (err) {
          console.error('Erro ao buscar crianças do usuário:', err);
        } finally {
          setLoadingChildren(false);
        }
      };
      fetchChildren();
    } else {
      setUserChildren([]);
    }
  }, [selectedUser]);

  // Manipulador de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Alternador rápido da flag is_patient
  const togglePatientStatus = async (profile: Profile, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede abrir o Slide Panel ao clicar no interruptor
    const targetValue = !profile.is_patient;

    // Atualização otimista na tela
    setUsers(prev => prev.map(u => u.id === profile.id ? { ...u, is_patient: targetValue } : u));
    if (selectedUser?.id === profile.id) {
      setSelectedUser(prev => prev ? { ...prev, is_patient: targetValue } : null);
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_patient: targetValue })
        .eq('id', profile.id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao alternar status de paciente:', err);
      // Reverte se der erro
      setUsers(prev => prev.map(u => u.id === profile.id ? { ...u, is_patient: !targetValue } : u));
      if (selectedUser?.id === profile.id) {
        setSelectedUser(prev => prev ? { ...prev, is_patient: !targetValue } : null);
      }
    }
  };

  // Cadastra um novo usuário mantendo o administrador logado
  const handleRegisterNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setRegisterError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setRegistering(true);
    setRegisterError(null);

    try {
      // Cria um cliente temporário e isolado do Supabase para fazer o cadastro de forma autônoma
      const tempClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // Cadastra o usuário e passa diretamente o campo is_patient nos metadados!
      const { data, error } = await tempClient.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserName,
            role: 'client',
            is_patient: newUserType === 'paciente'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setRegisterSuccess(true);
        
        // Aguarda 1 segundo e recarrega a lista
        setTimeout(() => {
          fetchUsers(); 
          setIsNewUserModalOpen(false);
          setRegisterSuccess(false);
          
          // Reseta campos
          setNewUserName('');
          setNewUserEmail('');
          setNewUserPassword('');
          setNewUserType('comum');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erro de registro de usuário:', err);
      setRegisterError(err.message || 'Ocorreu um erro ao criar a conta do usuário.');
    } finally {
      setRegistering(false);
    }
  };

  // Simular acesso ao usuário
  const handleSimulateAccess = async (profile: Profile) => {
    if (window.confirm(`Iniciar modo de simulação? Você passará a ver e operar o app exatamente como: ${profile.full_name || profile.email}.`)) {
      setLoading(true);
      try {
        await setSimulatedUser(profile.id, profile.email || profile.full_name);
        setSelectedUser(null);
        navigate('/'); // Redireciona para o painel principal agora operando no modo simulado!
      } catch (err) {
        console.error('Erro ao simular acesso:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Componente Skeleton Row
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-2/3"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/3"></div></td>
      <td className="px-6 py-4 text-center">
        <div className="h-5 bg-slate-200 rounded-full w-10 mx-auto"></div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-14 h-6 bg-slate-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 relative">
      {/* CABEÇALHO COM BOTÃO NOVO USUÁRIO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão de Usuários</h2>
          <p className="text-slate-500 text-sm">Gerencie, filtre e simule o acesso dos seus clientes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsNewUserModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-[#1b6392] hover:bg-[#154d72] text-white px-5 py-2.5 rounded-xl hover:shadow-md active:scale-95 transition-all text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
          <button 
            onClick={fetchUsers}
            className="flex items-center justify-center bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* FILTROS (TODOS vs PACIENTES) E BUSCA */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interruptor Todos | Pacientes */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 self-start">
          <button
            onClick={() => { setActiveFilter('all'); setPage(1); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Todos os Usuários
          </button>
          <button
            onClick={() => { setActiveFilter('patients'); setPage(1); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeFilter === 'patients' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Apenas Meus Pacientes
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] text-sm bg-slate-50/50"
          />
        </div>
        
        <div className="text-slate-500 text-xs font-medium">
          Total: <span className="text-slate-800 font-bold">{totalCount}</span> encontrados
        </div>
      </div>

      {/* TRATAMENTO DE TEMPO LIMITE (TIMEOUT) OU ERRO */}
      {hasTimeout ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center justify-center space-y-4">
          <WifiOff className="w-12 h-12 text-amber-500" />
          <div>
            <h3 className="font-bold text-slate-700 text-lg">A conexão demorou muito a responder</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Não foi possível recuperar a lista de usuários neste momento. Por favor, tente atualizar a página.</p>
          </div>
          <button
            onClick={fetchUsers}
            className="bg-[#1b6392] hover:bg-[#154d72] text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="font-bold text-slate-700 text-lg">Erro na requisição</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">{fetchError}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="bg-[#1b6392] hover:bg-[#154d72] text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      ) : (
        /* TABELA DE USUÁRIOS */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Nome Completo</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Cadastro</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">É Paciente?</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  // Carregamento estilo SKELETON ao invés de roleta de loading
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      Nenhum usuário cadastrado nesta categoria.
                    </td>
                  </tr>
                ) : (
                  users.map((profile) => (
                    <tr 
                      key={profile.id} 
                      onClick={() => setSelectedUser(profile)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {profile.full_name || 'Sem Nome Cadastrado'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {profile.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(profile.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {/* Chave liga/desliga para status de Paciente */}
                        <button
                          onClick={(e) => togglePatientStatus(profile, e)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${profile.is_patient ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${profile.is_patient ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(profile)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1b6392] hover:bg-slate-100 transition-colors"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSimulateAccess(profile)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#1b6392] rounded-lg hover:bg-[#1b6392] hover:text-white transition-all active:scale-95"
                            title="Simular Acesso do Usuário"
                          >
                            Simular
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINAÇÃO */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-slate-500 text-sm">
              Página <span className="font-semibold text-slate-800">{page}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-white active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-white active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SLIDE PANEL (DETALHES DO USUÁRIO) ==================== */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200
        ${selectedUser ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {selectedUser && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Ficha do Cliente</h3>
                <p className="text-xs text-slate-500">Detalhes e perfis dependentes</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Seção Geral */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#1b6392] font-bold text-xl">
                    {selectedUser.full_name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{selectedUser.full_name || 'Sem Nome'}</h4>
                    <p className="text-xs text-slate-500">Cadastrado em {formatDate(selectedUser.updated_at)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  
                  {/* Status do Paciente */}
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                    <span className="text-sm font-medium text-slate-700">Paciente do Consultório</span>
                    <button
                      onClick={(e) => togglePatientStatus(selectedUser, e)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${selectedUser.is_patient ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${selectedUser.is_patient ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Seção Crianças Dependentes */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <Baby className="w-4 h-4 text-[#1b6392]" />
                  <span>Dependentes / Crianças</span>
                </h5>

                {loadingChildren ? (
                  <div className="py-4 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-1.5 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                ) : userChildren.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Nenhuma criança cadastrada por este usuário.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userChildren.map((child) => (
                      <div key={child.id} className="p-3 bg-white border border-slate-150 rounded-xl hover:shadow-sm transition-all flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${child.gender === 'female' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                            {child.gender === 'female' ? '♀' : '♂'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{child.name}</span>
                            <span className="text-[10px] text-slate-500">{formatDate(child.birth_date)} • {child.profile_type === 'pregnant' ? 'Gestação' : 'Criança'}</span>
                          </div>
                        </div>
                        {child.allergies && (
                          <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                            Alergia
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ações Inferiores do Slide Panel */}
            <div className="p-6 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleSimulateAccess(selectedUser)}
                className="w-full flex items-center justify-center space-x-2 bg-[#1b6392] hover:bg-[#154d72] text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
              >
                <span>Simular Acesso do Usuário</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ==================== MODAL DE NOVO USUÁRIO ==================== */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#1b6392]" />
                <span>Adicionar Novo Usuário</span>
              </h3>
              <button 
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterNewUser} className="p-6 space-y-4">
              {registerSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Usuário Criado com Sucesso!</h4>
                    <p className="text-xs text-slate-500 mt-1">O perfil foi registrado e vinculado.</p>
                  </div>
                </div>
              ) : (
                <>
                  {registerError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  {/* Nome */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo do pai ou da mãe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@exemplo.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                    />
                  </div>

                  {/* Senha */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Senha Temporária *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                    />
                  </div>

                  {/* Tipo / Classificação do Usuário */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Classificação do Usuário *</label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNewUserType('comum')}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${newUserType === 'comum' ? 'bg-[#1b6392]/10 text-[#1b6392] border-[#1b6392]' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        Comum
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserType('paciente')}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${newUserType === 'paciente' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        Paciente do Consultório
                      </button>
                    </div>
                  </div>

                  {/* Botões do Modal */}
                  <div className="flex space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsNewUserModalOpen(false)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={registering}
                      className="flex-1 py-2.5 text-xs font-bold bg-[#1b6392] hover:bg-[#154d72] text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {registering && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />}
                      <span>Cadastrar</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
