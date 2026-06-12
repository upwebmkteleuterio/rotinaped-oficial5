import { useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import HeaderWithChild from '../components/layout/HeaderWithChild';
import { Card } from '../components/common/UI';
import { CheckCircle2, Circle, AlertCircle, ThumbsUp, ChevronRight, Baby, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { MILESTONES_DATA } from '../data/milestones';
import { PREMIUM_MILESTONES_DATA } from '../data/premiumMilestones';
import { useNavigate } from 'react-router-dom';

export default function Milestones() {
  const { 
    children, 
    activeChildId, 
    childMilestones, 
    ui, 
    setSelectedPeriod, 
    toggleMilestone,
    setActiveChild
  } = useAppStore();

  const navigate = useNavigate();

  // Create sequence of months 0 (Recém-Nascido) to 48 (4 Years)
  const periods = useMemo(() => Array.from({ length: 49 }, (_, i) => i), []);

  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  const isGirl = activeChild?.gender === 'female';
  
  const isChild = !activeChild?.profileType || activeChild.profileType === 'child';
  const childProfiles = children.filter(c => !c.profileType || c.profileType === 'child');

  // Calculates baby's age in months
  const calculateAgeInMonths = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    const yearsDiff = today.getFullYear() - birthDate.getFullYear();
    const monthsDiff = today.getMonth() - birthDate.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;
    return Math.max(0, Math.min(48, totalMonths)); // Bound strictly between 0 and 48
  };

  // Auto-focus on active child's current age month
  useEffect(() => {
    if (activeChild?.birthDate && isChild) {
      const initialPeriod = calculateAgeInMonths(activeChild.birthDate);
      setSelectedPeriod(initialPeriod);
    }
  }, [activeChildId, activeChild?.birthDate, isChild, setSelectedPeriod]);

  // Smooth scroll carousel to focus the selected month button
  useEffect(() => {
    const currentBtn = document.getElementById(`milestone-month-btn-${ui.milestones.selectedPeriod}`);
    if (currentBtn) {
      setTimeout(() => {
        currentBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 100);
    }
  }, [ui.milestones.selectedPeriod]);

  const currentPeriodMilestones = MILESTONES_DATA.filter(m => m.periodMonths === ui.milestones.selectedPeriod);
  const currentPeriodPremiumMilestones = PREMIUM_MILESTONES_DATA.filter(m => m.periods.includes(ui.milestones.selectedPeriod));
  const completedInPeriod = childMilestones.filter(cm => 
    cm.childId === activeChildId && 
    cm.completed && 
    currentPeriodMilestones.some(m => m.id === cm.milestoneItemId)
  );

  const isPeriodComplete = currentPeriodMilestones.length > 0 && completedInPeriod.length === currentPeriodMilestones.length;

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <HeaderWithChild title="Marcos" />

      <main className="px-6 py-4 space-y-6">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Desenvolvimento</h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Acompanhe o crescimento e as conquistas do seu pequeno passo a passo (0 a 48 meses).
          </p>
        </section>

        {!isChild ? (
          <div className="space-y-6">
            <Card className="bg-white border border-slate-100 p-8 text-center flex flex-col items-center justify-center space-y-6 rounded-[2.5rem] shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-indigo-500 rounded-3xl flex items-center justify-center animate-pulse">
                <Baby className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <span className="inline-block px-3.5 py-1 rounded-full bg-slate-150 text-slate-500 text-[10px] uppercase tracking-widest font-extrabold mb-1">
                  Painel Suspenso
                </span>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Marcos de Desenvolvimento</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Esta funcionalidade é projetada para o acompanhamento dos marcos de progresso psicomotor, cognitivo, de linguagem e social recomendados para bebês e crianças.
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
                  <p className="text-[11px] text-slate-400">Escolha um perfil de criança abaixo ou no topo para acessar os marcos imediatamente:</p>
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
            {/* Month Selector Carousel (0 to 48 Months) */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2.5 px-1 -mx-1 snap-x scroll-smooth">
              {periods.map((period) => (
                <button
                  key={period}
                  id={`milestone-month-btn-${period}`}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-full transition-all border shrink-0 snap-center",
                    ui.milestones.selectedPeriod === period
                      ? (isGirl ? "bg-pink-500 text-white shadow-lg border-pink-500 scale-105" : "bg-brand-blue text-white shadow-lg border-brand-blue scale-105")
                      : "bg-white text-slate-450 border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider opacity-90">
                    {period === 0 ? "Bebê" : "Meses"}
                  </span>
                  <span className="text-xl font-extrabold">
                    {period === 0 ? "RN" : period}
                  </span>
                </button>
              ))}
            </div>

            {/* Checklist Card */}
            <motion.div
              key={ui.milestones.selectedPeriod}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-white border border-slate-100 p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Checklist: {ui.milestones.selectedPeriod === 0 ? "Recém-Nascido" : `${ui.milestones.selectedPeriod} Meses`}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Marque o que seu bebê já faz no cotidiano</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1.5 text-[10px] font-extrabold rounded-full tracking-wider",
                    isGirl ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-brand-blue"
                  )}>
                    {completedInPeriod.length} DE {currentPeriodMilestones.length}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {currentPeriodMilestones.map((milestone) => {
                    const isCompleted = childMilestones.some(cm => cm.childId === activeChildId && cm.milestoneItemId === milestone.id && cm.completed);
                    return (
                      <button
                        key={milestone.id}
                        onClick={() => toggleMilestone(activeChildId, milestone.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group hover:shadow-2xs",
                          isCompleted 
                            ? "bg-blue-50/20 border-blue-100" 
                            : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className={cn("w-6 h-6 shrink-0", isGirl ? "text-pink-500 animate-scale-up" : "text-brand-blue animate-scale-up")} />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 shrink-0 group-hover:text-slate-400" />
                        )}
                        <div className="flex flex-col">
                          <span className={cn("text-sm font-semibold leading-normal", isCompleted ? "text-slate-850" : "text-slate-600")}>
                            {milestone.description}
                          </span>
                          {milestone.stimulusAdvice && (
                            <span className="text-[10.5px] text-slate-400 mt-1 font-medium select-none">
                              💡 {milestone.stimulusAdvice}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {currentPeriodMilestones.length === 0 && (
                    <p className="text-center text-xs text-slate-450 py-4 font-medium">
                      Nenhum marco cadastrado para este mês.
                    </p>
                  )}
                </div>

                {/* Bloco de marcos Premium */}
                {currentPeriodPremiumMilestones.length > 0 && (
                  <div className="border-t border-dashed border-slate-205 pt-6 mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                            ⭐ Premium
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium select-none">
                          Disponível para clientes plano pago
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md select-none">
                        Bloqueado 🔒
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 opacity-60">
                      {currentPeriodPremiumMilestones.map((milestone) => {
                        let catIcon = "⭐";
                        let catLabel = "Geral";
                        let catColor = "text-amber-700 bg-amber-50 border-amber-200";
                        if (milestone.category === 'motor') {
                          catIcon = "🏃";
                          catLabel = "Motor";
                          catColor = "text-blue-700 bg-blue-50 border-blue-200";
                        } else if (milestone.category === 'cognitive') {
                          catIcon = "🧠";
                          catLabel = "Cognitivo";
                          catColor = "text-purple-700 bg-purple-50 border-purple-200";
                        } else if (milestone.category === 'language') {
                          catIcon = "🗣️";
                          catLabel = "Linguagem";
                          catColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                        } else if (milestone.category === 'social') {
                          catIcon = "❤️";
                          catLabel = "Social";
                          catColor = "text-rose-700 bg-rose-50 border-rose-200";
                        } else if (milestone.category === 'stimulus') {
                          catIcon = "🎯";
                          catLabel = "Estimular";
                          catColor = "text-orange-700 bg-orange-50 border-orange-200 font-bold";
                        }

                        return (
                          <div
                            key={milestone.id}
                            className="flex items-start gap-4 p-4 rounded-2xl border border-slate-150 bg-slate-50/50 select-none cursor-not-allowed transition-all"
                          >
                            <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-slate-200 border border-slate-350">
                              <span className="text-[10px] text-slate-400">🔒</span>
                            </div>
                            <div className="flex flex-col flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn("text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 border rounded-md", catColor)}>
                                  {catIcon} {catLabel}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-slate-500">
                                {milestone.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Feedback Section */}
            <AnimatePresence mode="wait">
              {isPeriodComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-emerald-50 border-emerald-100 border p-6 rounded-3xl flex gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg shadow-emerald-100">
                      <ThumbsUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">Tudo em dia!</h4>
                      <p className="text-xs text-emerald-800/80 font-medium leading-relaxed">
                        Parabéns! O desenvolvimento do seu filho está progredindo conforme o esperado para esta fase.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                currentPeriodMilestones.length > 0 && (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Alert Box */}
                    <div className="bg-amber-50/60 border border-amber-150 p-6 rounded-3xl flex gap-4">
                      <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shrink-0 text-white shadow-md shadow-amber-100">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 mb-1">Brincadeiras de Estímulo</h4>
                        <p className="text-xs text-amber-800/80 font-medium leading-relaxed">
                          Notou que alguns marcos ainda não foram marcados? Pratique os estímulos descritos acima durante o dia de forma leve e divertida!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* Clinical Alert Card (🚨 ALERTAS IMPORTANTES) */}
            <Card className="bg-rose-50/50 border border-rose-150 p-6 space-y-4 rounded-[2rem]">
              <div className="flex items-center gap-2 text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Alertas Importantes</h4>
              </div>
              <p className="text-xs text-rose-900/80 leading-relaxed font-semibold">
                Procure avaliação com o pediatra se seu pequeno apresentar algum destes sinais de alerta no desenvolvimento:
              </p>
              
              <div className="space-y-4 border-t border-rose-100/50 pt-4">
                <div>
                  <h5 className="text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-2">Fase de 0 a 24 Meses</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não sorri até 2 meses</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não sustenta cabeça até 4 meses</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não senta até 9 meses</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não anda até 18 meses</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não fala palavras até 18 meses</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não junta palavras até 2 anos</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-rose-100/30 pt-4">
                  <h5 className="text-[11px] font-bold text-rose-900 uppercase tracking-wider mb-2">Fase de 2 a 4 Anos</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não fala frases até 2 anos</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não interage com outras crianças</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não brinca de faz-de-conta</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Não entende comandos simples</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-rose-850 font-medium">
                      <span className="text-rose-500 font-bold shrink-0">❌</span>
                      <span>Linguagem difícil de entender aos 3–4 anos</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
