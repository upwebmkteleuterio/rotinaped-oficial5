import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  RefreshCw, 
  CreditCard, 
  AlertCircle, 
  Briefcase,
  WifiOff 
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  benefits: string[];
  external_id: string | null;
  created_at: string;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timeout State
  const [hasTimeout, setHasTimeout] = useState(false);

  // Formulario / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planPrice, setPlanPrice] = useState<number>(0);
  const [planExternalId, setPlanExternalId] = useState('');
  
  // Beneficios dinâmicos
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    setHasTimeout(false);

    let isRequestActive = true;
    const timeoutId = setTimeout(() => {
      if (isRequestActive) {
        setHasTimeout(true);
        setLoading(false);
      }
    }, 8000);

    try {
      const { data, error: fetchErr } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      isRequestActive = false;
      clearTimeout(timeoutId);

      if (fetchErr) throw fetchErr;
      setPlans((data as Plan[]) || []);
    } catch (err: any) {
      isRequestActive = false;
      clearTimeout(timeoutId);
      console.error('Erro ao buscar planos:', err);
      setError(err.message || 'Erro ao carregar os planos.');
    } finally {
      setLoading(false); // Correção Sênior: força o loading a fechar sempre ao finalizar
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanDescription('');
    setPlanPrice(0);
    setPlanExternalId('');
    setBenefitsList([]);
    setNewBenefit('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || '');
    setPlanPrice(plan.price);
    setPlanExternalId(plan.external_id || '');
    setBenefitsList(plan.benefits || []);
    setNewBenefit('');
    setIsModalOpen(true);
  };

  // Algoritmo de formatacao de moedas "direita-esquerda"
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    if (!rawDigits) {
      setPlanPrice(0);
      return;
    }
    const centsValue = parseInt(rawDigits, 10);
    setPlanPrice(centsValue / 100);
  };

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefitsList(prev => [...prev, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (indexToRemove: number) => {
    setBenefitsList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza de que deseja excluir o plano "${name}"? Esta ação é irreversível.`)) {
      setLoading(true);
      try {
        const { error: delErr } = await supabase
          .from('plans')
          .delete()
          .eq('id', id);

        if (delErr) throw delErr;
        fetchPlans();
      } catch (err: any) {
        console.error('Erro ao deletar plano:', err);
        alert(err.message || 'Não foi possível deletar o plano.');
        setLoading(false);
      }
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) {
      setError('Por favor, defina o nome do plano.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: planName,
      description: planDescription || null,
      price: planPrice,
      benefits: benefitsList,
      external_id: planExternalId || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingPlan) {
        // UPDATE
        const { error: saveErr } = await supabase
          .from('plans')
          .update(payload)
          .eq('id', editingPlan.id);

        if (saveErr) throw saveErr;
      } else {
        // INSERT
        const { error: saveErr } = await supabase
          .from('plans')
          .insert(payload);

        if (saveErr) throw saveErr;
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      console.error('Erro ao salvar plano:', err);
      setError(err.message || 'Erro ao salvar informações do plano.');
      setLoading(false);
    }
  };

  // Componente Skeleton Card para Planos
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="space-y-2 pt-4 border-t border-slate-200/60">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestão de Planos</h2>
          <p className="text-slate-500 text-sm">Visualize e gerencie todos os planos cadastrados no aplicativo.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 bg-[#1b6392] hover:bg-[#154d72] text-white px-5 py-2.5 rounded-xl hover:shadow-md active:scale-95 transition-all text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Plano</span>
        </button>
      </div>

      {hasTimeout ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center justify-center space-y-4">
          <WifiOff className="w-12 h-12 text-amber-500" />
          <div>
            <h3 className="font-bold text-slate-700 text-lg">A conexão demorou muito a responder</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Não foi possível recuperar a lista de planos neste momento. Por favor, tente atualizar a página.</p>
          </div>
          <button
            onClick={fetchPlans}
            className="bg-[#1b6392] hover:bg-[#154d72] text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="font-bold text-slate-700 text-lg">Erro na requisição</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">{error}</p>
          </div>
          <button
            onClick={fetchPlans}
            className="bg-[#1b6392] hover:bg-[#154d72] text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      ) : (
        /* LISTAGEM DE PLANOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : plans.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 text-lg">Nenhum Plano Cadastrado</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Crie planos para ativar os recursos pagos de integração com o Asaas no aplicativo dos usuários.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-4 bg-[#1b6392] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#154d72]"
              >
                Criar Primeiro Plano
              </button>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                {/* Topo do Card */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{plan.name}</h3>
                      <p className="text-xs text-[#1b6392] font-semibold mt-0.5">Asaas ID: {plan.external_id || 'Não Integrado'}</p>
                    </div>
                    <span className="p-2 bg-blue-50 text-[#1b6392] rounded-xl">
                      <Briefcase className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-3xl font-extrabold text-slate-800">{formatBRL(plan.price)}</span>
                    <span className="text-slate-400 text-xs font-medium block mt-1">cobrança única / mensal</span>
                  </div>

                  {plan.description && (
                    <p className="text-slate-500 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">{plan.description}</p>
                  )}

                  {/* Benefícios */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Vantagens</span>
                    {plan.benefits && plan.benefits.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {plan.benefits.map((benefit, bIdx) => (
                          <li key={bIdx} className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-400 italic block">Nenhum benefício listado</span>
                    )}
                  </div>
                </div>

                {/* Botões do Card */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    className="flex-1 flex items-center justify-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                    className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 text-red-600 rounded-xl transition-all active:scale-95"
                    title="Deletar Plano"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== MODAL DE CADASTRO / EDIÇÃO DE PLANO ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#1b6392]" />
                <span>{editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePlan} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Nome do Plano *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plano Trimestral Pediatra"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                />
              </div>

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Descrição</label>
                <textarea
                  placeholder="Breve descrição do plano..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                  rows={2}
                />
              </div>

              {/* Valor em Reais */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Valor Mensal *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">R$</span>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={planPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    onChange={handlePriceInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392] font-semibold text-slate-800 text-left"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Preenchimento automático da direita para a esquerda</span>
              </div>

              {/* ID Externo */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">ID de Integração (Asaas)</label>
                <input
                  type="text"
                  placeholder="Ex: price_12345abcdef"
                  value={planExternalId}
                  onChange={(e) => setPlanExternalId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#1b6392]/20 focus:border-[#1b6392]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">ID opcional usado para sincronizar as cobranças</span>
              </div>

              {/* Gestão de Benefícios Individuais */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Benefícios e Vantagens</label>
                
                {/* Inputs de inclusão */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ex: Suporte 24h com a Dra. Flávia"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="bg-[#1b6392] hover:bg-[#154d72] text-white p-2.5 rounded-xl active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Lista de Benefícios Cadastrados */}
                {benefitsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Nenhum benefício inserido ainda para este plano.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {benefitsList.map((benefit, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700">
                        <span className="font-medium pr-2">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões Finais */}
              <div className="flex space-x-2 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-xs font-bold bg-[#1b6392] hover:bg-[#154d72] text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>Salvar Plano</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
