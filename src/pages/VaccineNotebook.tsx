import { useState, useMemo, useEffect } from 'react';
import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  ChevronLeft, 
  Baby, 
  User, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  ShieldAlert,
  Heart,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { PNI_SCHEDULE } from '../data/vaccineSchedule';
import { formatDate, cn } from '../lib/utils';
import VaccineFormModal from '../components/vaccines/VaccineFormModal';
import { useVaccines } from '../hooks/useVaccines';
import { Vaccine } from '../types';

type Cycle = 'baby' | 'child' | 'adolescent' | 'pregnant' | 'adult' | 'elderly';

export default function VaccineNotebook() {
  const navigate = useNavigate();
  const { children, activeChildId, setActiveChild, addVaccinesBatch, vaccines } = useAppStore();
  const {
		activeChild,
		activeChildCycle,
		isFormOpen,
		scheduleItem,
		openCreateFromSchedule,
		closeForm,
		isCompleted,
		toggleIgnoreVaccine,
		setPreferredFacilityType,
		historyVaccines
	} = useVaccines();

  const [activeCycle, setActiveCycle] = useState<Cycle>(activeChildCycle as Cycle);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Sync active cycle when child cycle changes
  useEffect(() => {
    setActiveCycle(activeChildCycle as Cycle);
  }, [activeChildCycle]);

  const preferredFacility = activeChild?.preferredFacilityType || 'BOTH';

  // Filter schedule based on cycle and preferred facility
  const filteredSchedule = useMemo(() => {
    return PNI_SCHEDULE.filter(item => {
      // First, filter by cycle category
      if (item.category !== activeCycle) return false;
      
      // Then, filter out facility types if preference is set
      if (preferredFacility === 'SUS' && item.facilityType === 'PRIVATE') return false;
      if (preferredFacility === 'PRIVATE' && item.facilityType === 'SUS') return false;
      
      return true;
    });
  }, [activeCycle, preferredFacility]);

  // Check if cycle is all completed
  const isCycleCompleted = useMemo(() => {
    return filteredSchedule.every(item => isCompleted(item.name, item.dose));
  }, [filteredSchedule, isCompleted]);

  const handleCompleteCycle = () => {
    if (!activeChild) return;

    // Get all pending and missing items in this cycle
    const pendingInCycle = filteredSchedule.filter(item => !isCompleted(item.name, item.dose));

    // First convert any existing 'pending' vaccine for this child that matches Name & Dose in this cycle to 'completed'
    let updatedVaccines = vaccines.map(v => {
      if (v.childId === activeChild.id && v.status === 'pending') {
        const matchesSchedule = filteredSchedule.some(item => {
          const vName = v.name.toLowerCase().trim();
          const sName = item.name.toLowerCase().trim();
          const nameMatch = vName.includes(sName) || sName.includes(vName);
          if (!nameMatch) return false;
          if (!item.dose) return true;
          const vDose = v.dose?.toLowerCase().trim() || '';
          const sDose = item.dose.toLowerCase().trim();
          return vDose.includes(sDose) || sDose.includes(vDose) || vName.includes(sDose);
        });
        if (matchesSchedule) {
          return {
            ...v,
            status: 'completed' as const
          };
        }
      }
      return v;
    });

    // Then, for any schedule item that still doesn't have an associated 'completed' vaccine, create a new one
    const newVaccines: Vaccine[] = [];
    pendingInCycle.forEach(item => {
      const alreadyCompleted = updatedVaccines.some(v => {
        if (v.childId !== activeChild.id || v.status !== 'completed') return false;
        const vName = v.name.toLowerCase().trim();
        const sName = item.name.toLowerCase().trim();
        const nameMatch = vName.includes(sName) || sName.includes(vName);
        if (!nameMatch) return false;
        if (!item.dose) return true;
        const vDose = v.dose?.toLowerCase().trim() || '';
        const sDose = item.dose.toLowerCase().trim();
        return vDose.includes(sDose) || sDose.includes(vDose) || vName.includes(sDose);
      });

      if (!alreadyCompleted) {
        const birthDate = new Date(activeChild.birthDate);
        const vaccineDate = new Date(birthDate);
        vaccineDate.setMonth(vaccineDate.getMonth() + item.ageInMonths);
        
        newVaccines.push({
          id: crypto.randomUUID(),
          childId: activeChild.id,
          name: item.name,
          dose: item.dose || '',
          date: vaccineDate.toISOString().split('T')[0],
          status: 'completed',
          facilityType: 'SUS'
        });
      }
    });

    // Update the Zustand store list directly and save it beautifully
    useAppStore.setState({ vaccines: [...updatedVaccines, ...newVaccines] });
    setShowBulkModal(false);
  };

  // Group by ageLabel
  const groupedSchedule = useMemo(() => {
    const groups: { [key: string]: typeof filteredSchedule } = {};
    filteredSchedule.forEach(item => {
      if (!groups[item.ageLabel]) groups[item.ageLabel] = [];
      groups[item.ageLabel].push(item);
    });
    return groups;
  }, [filteredSchedule]);

  const ageLabels = Object.keys(groupedSchedule);

  const profileType = activeChild?.profileType || 'child';

  const cycles = useMemo(() => {
    if (profileType === 'pregnant') {
      return [
        { id: 'pregnant', label: 'Gestante', range: 'Esquema', icon: Heart, color: 'bg-pink-100 text-pink-600' }
      ];
    }
    if (profileType === 'adult') {
      return [
        { id: 'adult', label: 'Adulto', range: 'Esquema', icon: User, color: 'bg-indigo-100 text-indigo-600' }
      ];
    }
    if (profileType === 'elderly') {
      return [
        { id: 'elderly', label: 'Idoso', range: 'Esquema', icon: Sparkles, color: 'bg-amber-100 text-amber-600' }
      ];
    }
    return [
      { id: 'baby', label: 'Bebê', range: '0-12m', icon: Baby, color: 'bg-blue-100 text-blue-600' },
      { id: 'child', label: 'Criança', range: '1-10a', icon: User, color: 'bg-emerald-100 text-emerald-600' },
      { id: 'adolescent', label: 'Adolescente', range: '11-19a', icon: ShieldCheck, color: 'bg-purple-100 text-purple-600' },
    ];
  }, [profileType]);

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <Header />
      
      <main className="px-6 py-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/vaccines')}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Caderneta</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Individual por Filho</p>
            </div>
          </div>

          <div className="flex -space-x-1.5">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setActiveChild(child.id);
                  // Force a small update to refresh components relying on activeChildId
                }}
                className={cn(
                  "w-11 h-11 rounded-full border-2 transition-all p-0.5 bg-white shadow-sm hover:z-20",
                  activeChildId === child.id 
                    ? (child.gender === 'female' ? "border-pink-500 scale-110 z-20" : "border-brand-blue scale-110 z-20")
                    : "border-slate-200 opacity-60 hover:opacity-100 z-10"
                )}
              >
                {child.photoUrl ? (
                  <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center rounded-full text-xs font-bold",
                    child.gender === 'female' ? "bg-pink-50 text-pink-400" : "bg-blue-50 text-brand-blue"
                  )}>
                    {child.name[0]}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <section className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-full border-4 overflow-hidden shrink-0",
            activeChild?.gender === 'female' ? "border-pink-100" : "border-blue-100"
          )}>
             {activeChild?.photoUrl ? (
                <img src={activeChild.photoUrl} alt="" className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-xl font-bold text-slate-300">
                  {activeChild?.name[0]}
                </div>
             )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">{activeChild?.name}</h3>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md",
                activeChild?.gender === 'female' ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-brand-blue"
              )}>
                {activeCycle === 'baby' ? 'Ciclo Bebê' : activeCycle === 'child' ? 'Ciclo Criança' : 'Ciclo Adolescente'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cronograma Ativo</span>
            </div>
          </div>
        </section>

        {/* Filtro de Rede Pública vs Particular */}
        <div className="bg-slate-100 p-1.5 rounded-3xl flex gap-1 shadow-inner">
          {(['BOTH', 'SUS', 'PRIVATE'] as const).map((type) => {
            const active = preferredFacility === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setPreferredFacilityType(type)}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all",
                  active 
                    ? "bg-white text-slate-800 shadow-sm scale-[1.01]" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {type === 'BOTH' ? 'Esquema Completo' : type === 'SUS' ? 'Apenas SUS' : 'Clínicas Privadas'}
              </button>
            );
          })}
        </div>

        <section className="grid grid-cols-3 gap-3">
          {cycles.map((cycle) => (
            <button
              key={cycle.id}
              onClick={() => setActiveCycle(cycle.id as Cycle)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-[2.5rem] transition-all border shadow-sm",
                activeCycle === cycle.id 
                  ? "bg-white border-blue-200 shadow-md scale-[1.02]" 
                  : "bg-slate-50 border-slate-100 opacity-60"
              )}
            >
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", cycle.color)}>
                <cycle.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-bold text-slate-800 uppercase leading-none mb-1">{cycle.label}</span>
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{cycle.range}</span>
              </div>
            </button>
          ))}
        </section>

        {!isCycleCompleted && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowBulkModal(true)}
            className="w-full py-4 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center gap-3 text-emerald-700 active:scale-[0.98] transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">Marcar Ciclo como Completo</span>
          </motion.button>
        )}

        <section className="relative pl-6 space-y-12 pb-10">
          <div className="absolute left-[34px] top-4 bottom-4 w-0.5 bg-slate-200/50" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCycle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {ageLabels.map((age) => (
                <div key={age} className="space-y-4">
                  <div className="relative flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-white border-4 border-blue-500 relative z-10 shadow-sm" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{age}</h3>
                  </div>

                  <div className="space-y-4 pl-4">
                    {groupedSchedule[age].map((vaccine) => {
                      const completed = isCompleted(vaccine.name, vaccine.dose);
                      const isIgnored = activeChild?.ignoredVaccines?.includes(vaccine.id) || false;
                      const appliedRecord = completed 
                        ? historyVaccines.find(v => {
                            const vName = v.name.toLowerCase().trim();
                            const sName = vaccine.name.toLowerCase().trim();
                            const nameMatch = vName.includes(sName) || sName.includes(vName);
                            if (!nameMatch) return false;
                            if (!vaccine.dose) return true;
                            const vDose = v.dose?.toLowerCase().trim() || '';
                            const sDose = vaccine.dose.toLowerCase().trim();
                            return vDose.includes(sDose) || sDose.includes(vDose) || vName.includes(sDose);
                          })
                        : null;
                      
                      return (
                        <Card 
                          key={vaccine.id}
                          className={cn(
                            "p-4 rounded-3xl border transition-all flex items-center gap-4 relative",
                            completed 
                              ? "bg-emerald-50/60 border-emerald-200/80 shadow-xs" 
                              : isIgnored
                                ? "bg-slate-100/55 border-slate-200/80 opacity-60 shadow-xs scale-98"
                                : "bg-white border-slate-100 shadow-sm hover:shadow-md active:scale-[0.99]"
                          )}
                        >
                          <div 
                            onClick={() => {
                              if (!completed && !isIgnored) openCreateFromSchedule(vaccine);
                            }}
                            className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm cursor-pointer",
                              completed 
                                ? "bg-emerald-500 text-white shadow-emerald-100" 
                                : isIgnored
                                  ? "bg-slate-200 text-slate-400"
                                  : "bg-slate-50 text-slate-300"
                            )}
                          >
                            {completed ? (
                              <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                            ) : isIgnored ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Clock className="w-6 h-6" />
                            )}
                          </div>
                          
                          <div 
                            onClick={() => {
                              if (!completed && !isIgnored) openCreateFromSchedule(vaccine);
                            }}
                            className="flex-1 min-w-0 cursor-pointer animate-fade-in"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={cn(
                                  "font-black tracking-tight text-sm",
                                  completed ? "text-emerald-800" : isIgnored ? "text-slate-400 line-through" : "text-slate-800"
                                )}>{vaccine.name}</h4>
                                {isIgnored && (
                                  <span className="text-[8px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                    Omitida
                                  </span>
                                )}
                                {completed && (
                                  <span className="text-[8px] font-black text-emerald-750 bg-emerald-100/80 border border-emerald-200 px-1.5 py-0.5 rounded-md uppercase tracking-tighter flex items-center gap-1">
                                    ✓ Aplicada
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {vaccine.dose && (
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md shadow-sm border",
                                    completed 
                                      ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                                      : isIgnored
                                        ? "text-slate-400 bg-slate-100 border-slate-200/60"
                                        : "text-blue-500 bg-blue-50/80 border-blue-100/50"
                                  )}>
                                    {vaccine.dose}
                                  </span>
                                )}
                                
                                {vaccine.facilityType && (
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md border",
                                    vaccine.facilityType === 'PRIVATE'
                                      ? "text-purple-600 bg-purple-50 border-purple-100/50"
                                      : vaccine.facilityType === 'SUS'
                                        ? "text-orange-600 bg-orange-50 border-orange-100/50"
                                        : "text-slate-500 bg-slate-50 border-slate-200/50"
                                  )}>
                                    {vaccine.facilityType === 'BOTH' ? 'SUS • Particular' : vaccine.facilityType === 'PRIVATE' ? 'Particular' : 'SUS'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 leading-tight">Previne: {vaccine.prevents}</p>
                            {completed && appliedRecord && (
                              <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wide mt-1.5 animate-fade-in flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md w-fit">
                                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                Aplicada em {formatDate(appliedRecord.date)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Botão de ocultar/ignorar para evitar pendência eternamente */}
                            {!completed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleIgnoreVaccine(vaccine.id);
                                }}
                                title={isIgnored ? "Exibir no calendário de pendências" : "Omitir esta pendência"}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors border",
                                  isIgnored
                                    ? "bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300"
                                    : "bg-slate-50 border-slate-100 text-slate-450 hover:text-slate-650 hover:bg-slate-100"
                                )}
                              >
                                {isIgnored ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            {!completed && !isIgnored && (
                              <button
                                type="button"
                                onClick={() => openCreateFromSchedule(vaccine)}
                                className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-colors shrink-0"
                              >
                                <PlusCircle className="w-4.5 h-4.5" />
                              </button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-blue-800 uppercase">Informação Importante</h4>
            <p className="text-[10px] text-blue-600 leading-relaxed">
              Este calendário reflete o Programa Nacional de Imunização (SUS).
            </p>
          </div>
        </div>
      </main>

      <VaccineFormModal 
        isOpen={isFormOpen}
        onClose={closeForm}
        scheduleItem={scheduleItem}
      />

      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-10 h-10" />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  Confirmar Conclusão do Ciclo
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-bold opacity-70">
                  Deseja marcar todas as vacinas deste ciclo <strong>({activeCycle === 'baby' ? 'Bebê' : activeCycle === 'child' ? 'Criança' : 'Adolescente'})</strong> como aplicadas? 
                  Esta ação registrará todas as doses no histórico de {activeChild?.name}.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleCompleteCycle}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                >
                  Sim, Marcar como Aplicadas
                </button>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full py-4 text-slate-400 font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
