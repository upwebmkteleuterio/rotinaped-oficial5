import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import HeaderWithChild from '../components/layout/HeaderWithChild';
import { Card } from '../components/common/UI';
import { Plus, Ruler, Weight, Activity, TrendingUp, History, Trash2, ChevronRight, Edit2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import AddMeasurementModal from '../components/growth/AddMeasurementModal';
import { useSearchParams, useNavigate } from 'react-router-dom';
import WHOGrowthChart from '../components/growth/WHOGrowthChart';
import HealthStatusCard from '../components/growth/HealthStatusCard';

export default function Growth() {
  const { 
    children, 
    activeChildId, 
    measurements, 
    ui, 
    setGrowthTab, 
    deleteMeasurement,
    setActiveChild,
    setEditingMeasurement
  } = useAppStore();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  const activeMeasurements = useMemo(() => {
    return measurements
      .filter(m => m.childId === activeChildId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, activeChildId]);

  const currentMeasurement = activeMeasurements[activeMeasurements.length - 1];
  const previousMeasurement = activeMeasurements[activeMeasurements.length - 2];

  const isGirl = activeChild?.gender === 'female';
  const weightDiff = currentMeasurement && previousMeasurement 
    ? (currentMeasurement.weight || 0) - (previousMeasurement.weight || 0) 
    : 0;

  const isChild = !activeChild?.profileType || activeChild.profileType === 'child';
  const childProfiles = children.filter(c => !c.profileType || c.profileType === 'child');

  const tabs = [
    { id: 'weight', label: 'Peso' },
    { id: 'height', label: 'Altura' },
    { id: 'imc', label: 'IMC' },
    { id: 'head', label: 'Perímetro' },
  ] as const;

  const openAddModal = () => {
    setSearchParams({ modal: 'add-measurement' });
  };

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <HeaderWithChild title="Crescimento" />

      <main className="px-6 py-4 space-y-6">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Crescimento</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Acompanhe a jornada de desenvolvimento do seu bebê com os padrões da OMS.
          </p>
        </section>

        {!isChild ? (
          <div className="space-y-6">
            <Card className="bg-white border border-slate-100 p-8 text-center flex flex-col items-center justify-center space-y-6 rounded-[2.5rem] shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-indigo-500 rounded-3xl flex items-center justify-center animate-pulse">
                <Ruler className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <span className="inline-block px-3.5 py-1 rounded-full bg-slate-150 text-slate-500 text-[10px] uppercase tracking-widest font-extrabold mb-1">
                  Painel Suspenso
                </span>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Crescimento & Curvas da OMS</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Esta funcionalidade é projetada especificamente para o acompanhamento biométrico de peso, altura e IMC de bebês e crianças baseado nos padrões da OMS.
                </p>
                <div className="p-4 bg-amber-50/60 border border-amber-150 rounded-2xl text-[11px] text-amber-805 leading-normal font-medium max-w-sm mx-auto text-left flex gap-2.5 items-start mt-2">
                  <span className="text-base">💡</span>
                  <div>
                    O perfil ativo atual (<span className="font-bold">{activeChild?.name}</span>) está cadastrado como <span className="font-bold">{activeChild?.profileType === 'pregnant' ? 'Gestante' : activeChild?.profileType === 'elderly' ? 'Idoso' : 'Adulto'}</span>, por isso este painel não está disponível para ele.
                  </div>
                </div>
              </div>

              <div className="w-full border-t border-slate-100 pt-6 space-y-4 max-w-sm">
                <div className="text-left space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 tracking-tight">Mudar de Perfil</h4>
                  <p className="text-[11px] text-slate-400">Escolha um perfil de criança abaixo ou no topo para acessar os gráficos imediatamente:</p>
                </div>

                <div className="space-y-2">
                  {childProfiles.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setActiveChild(child.id)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 active:scale-98 transition-all rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
                          {child.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-850">{child.name}</p>
                          <span className="text-[10px] text-slate-400 font-medium">Bebê / Criança</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}

                  {childProfiles.length === 0 && (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Nenhum perfil de bebê ou criança cadastrado no momento.
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/profiles')}
                    className="w-full py-4 text-xs font-black uppercase tracking-wider text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-2xl active:scale-98 transition-all mt-2"
                  >
                    Gerenciar todos os perfis
                  </button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Tabs - Scrollable */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1 -mx-1 snap-x">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGrowthTab(tab.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap snap-start shrink-0 border",
                    ui.growth?.activeTab === tab.id 
                      ? (isGirl ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-100" : "bg-brand-blue border-brand-blue text-white shadow-md shadow-blue-100")
                      : "bg-white text-slate-400 border-slate-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Chart Section */}
            <motion.div
              key={ui.growth?.activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-start px-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Última Medição</span>
                  <div className="flex items-baseline gap-2">
                    <h3 className={cn("text-4xl font-bold", isGirl ? "text-pink-500" : "text-brand-blue")}>
                      {ui.growth?.activeTab === 'weight' ? currentMeasurement?.weight || '--' : 
                       ui.growth?.activeTab === 'height' ? currentMeasurement?.height || '--' : 
                       ui.growth?.activeTab === 'imc' ? currentMeasurement?.imc || '--' : 
                       currentMeasurement?.headCircumference || '--'} 
                      <span className="text-lg text-brand-blue/60 ml-1">
                        {ui.growth?.activeTab === 'weight' ? 'kg' : 
                         ui.growth?.activeTab === 'imc' ? '' : 'cm'}
                      </span>
                    </h3>
                    {weightDiff > 0 && ui.growth?.activeTab === 'weight' && (
                      <span className="text-xs font-bold text-amber-600">+{weightDiff.toFixed(1)}kg</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Percentil</span>
                  <p className="text-xl font-bold text-slate-700">P50</p>
                </div>
              </div>

              {/* Chart Area - Now using WHOGrowthChart for ALL metrics */}
              <div className="w-full">
                  <WHOGrowthChart 
                    child={activeChild} 
                    measurements={activeMeasurements} 
                    metric={ui.growth.activeTab as any} 
                  />
              </div>
            </motion.div>

            {/* Health Status Card - Captures REAL data with WHO logic */}
            <HealthStatusCard child={activeChild} measurements={activeMeasurements} />

            {/* Unified History List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">Histórico Unificado</h3>
              </div>

              <div className="space-y-3">
                {activeMeasurements.slice().reverse().map((m) => (
                  <Card key={m.id} className="bg-white border border-slate-100 p-5 transition-none cursor-default active:scale-100 flex items-center justify-between">
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{formatDate(m.date)}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        {/* Weight */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Weight className="w-4 h-4" />
                          </div>
                          <span className="text-base font-bold text-slate-800">{m.weight} kg</span>
                        </div>

                        {/* Height */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Ruler className="w-4 h-4" />
                          </div>
                          <span className="text-base font-bold text-slate-800">{m.height} cm</span>
                        </div>

                        {/* Perimeter (Head Circumference) */}
                        {m.headCircumference && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                              <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-base font-bold text-slate-800">{m.headCircumference} cm</span>
                          </div>
                        )}

                        {/* Blood Pressure */}
                        {m.bloodPressure && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                              <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-base font-bold text-slate-800">{m.bloodPressure}</span>
                          </div>
                        )}

                        {/* IMC (Automatic Calculation) */}
                        {m.imc && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-base font-bold text-slate-800">{m.imc} IMC</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative shrink-0 ml-4">
                      {confirmDeleteId === m.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1.5 rounded-xl shrink-0">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMeasurement(m.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 bg-rose-500 text-white font-black text-[9px] uppercase rounded-lg shadow-sm hover:bg-rose-600 active:scale-95 transition-all"
                          >
                            Sim
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 bg-white text-slate-500 font-bold text-[9px] uppercase rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === m.id ? null : m.id);
                            }}
                            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                            title="Mais opções"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          <AnimatePresence>
                            {activeMenuId === m.id && (
                              <>
                                {/* Overlay to close */}
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }} 
                                />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-12 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 z-20 min-w-[130px] flex flex-col gap-0.5"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingMeasurement(m.id);
                                      setSearchParams({ modal: 'add-measurement' });
                                      setActiveMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-white text-left hover:bg-slate-50 rounded-xl transition-all text-slate-600 active:scale-95"
                                  >
                                    <div className="p-1 bg-blue-50 text-brand-blue rounded-lg">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold">Editar</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(m.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-white text-left hover:bg-rose-50 rounded-xl transition-all text-rose-600 active:scale-95"
                                  >
                                    <div className="p-1 bg-rose-50 text-rose-400 rounded-lg">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold">Excluir</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {isChild && (
        <button 
          onClick={openAddModal}
          className={cn(
            "fixed right-6 bottom-28 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white active:scale-95 transition-transform z-30",
            isGirl ? "bg-pink-500 shadow-pink-100" : "bg-brand-blue shadow-blue-100"
          )}
        >
          <Plus className="w-8 h-8" />
        </button>
      )}

      <AddMeasurementModal />
    </div>
  );
}
