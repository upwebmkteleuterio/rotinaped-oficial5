import { useAppStore } from '../store/useAppStore';
import { Card, Skeleton } from '../components/common/UI';
import { Bell, Syringe, Calendar, Ruler, TrendingUp, ChevronRight, FileText, Search, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeDate, cn } from '../lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { MILESTONES_DATA } from '../data/milestones';
import { PNI_SCHEDULE } from '../data/vaccineSchedule';
import NotificationModal from '../components/notifications/NotificationModal';
import CustomAIIcon from '../components/common/CustomAIIcon';

export default function Dashboard() {
  const { children, activeChildId, vaccines, measurements, dailyTips, exams, toggleNotifications, notifications } = useAppStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // Select a tip based on the day of the year
  const todayTip = useMemo(() => {
    if (!dailyTips || dailyTips.length === 0) return null;
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dailyTips[dayOfYear % dailyTips.length];
  }, [dailyTips]);


  const calculateAge = (child: any) => {
    const birthDate = child.birthDate;
    if (child.profileType === 'pregnant') {
      const dpp = new Date(birthDate);
      const start = new Date(dpp.getTime() - 280 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.max(0, Math.floor(diffDays / 7));
      if (weeks >= 40) return 'GESTANTE (DPP PRÓXIMO)';
      return `GESTANTE (${weeks} ${weeks === 1 ? 'SEMANA' : 'SEMANAS'})`;
    }
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    if (child.profileType === 'adult' || child.profileType === 'elderly') {
      return `${years} ANOS`;
    }

    let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    if (months < 1) return 'RECÉM-NASCIDO';
    if (months < 12) return months === 1 ? '1 MÊS' : `${months} MESES`;
    return `${years} ${years === 1 ? 'ANO' : 'ANOS'}`;
  };

  if (loading) {
    return (
      <div className="pb-8">
        <div className="h-64 animate-header-gradient px-6 pt-10 pb-20 space-y-4">
           <Skeleton className="h-8 w-32 bg-white/20" />
           <Skeleton className="h-10 w-48 bg-white/20" />
        </div>
        <main className="px-6 -mt-10 space-y-6">
          <Skeleton className="h-48 w-full rounded-[2.5rem]" />
          <Skeleton className="h-40 w-full rounded-[2.5rem]" />
          <Skeleton className="h-40 w-full rounded-[2.5rem]" />
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Animated Header Section */}
      <section className="animate-header-gradient pt-6 pb-12 px-6 text-white relative transition-all duration-1000 shadow-md">
        <div className="flex items-center justify-between mb-0">
          <h1 className="text-2xl font-bold tracking-tight">RotinaPed</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleNotifications(true)}
              className="relative p-2 bg-white/10 rounded-xl text-white/90 hover:text-white transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <div 
              onClick={() => navigate('/profiles')}
              className="w-11 h-11 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 p-0.5 cursor-pointer active:scale-95 transition-transform shadow-lg"
            >
               <img 
                 src="https://picsum.photos/seed/avatar-mom/100/100" 
                 alt="Profile" 
                 className="w-full h-full object-cover rounded-full"
                 referrerPolicy="no-referrer"
               />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-xl font-medium opacity-90 flex items-center gap-2">
            Olá, Mamãe! <span className="text-2xl">👋</span>
          </h2>
        </motion.div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Próximas Vacinas</h3>
          <button 
            onClick={() => navigate('/vaccines')}
            className="text-[10px] font-black text-white/70 uppercase tracking-widest hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            VER TODAS
          </button>
        </div>
      </section>
      
      <NotificationModal />

      <main className="px-5 -mt-10 relative z-10 space-y-6">
        {/* Unified Vaccines Section */}
        <div className="space-y-4">
          {children.map(child => {
            // Logic to find real next vaccine for THIS specific child
            const childVaccines = vaccines.filter(v => v.childId === child.id);
            const pendingVaccines = childVaccines.filter(v => v.status === 'pending');
            
            // Determine current child cycle
            const birthDate = new Date(child.birthDate);
            const today = new Date();
            const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
            const childCycle = child.profileType && child.profileType !== 'child' 
              ? child.profileType 
              : (ageInMonths <= 12 ? 'baby' : ageInMonths <= 120 ? 'child' : 'adolescent');

            let nextVaccineDisplay = pendingVaccines
              .filter(v => {
                // Also filter manual ones by cycle if possible, or just upcoming
                // In dashboard we focus on the current relevant ones
                const scheduleMatch = PNI_SCHEDULE.find(ps => ps.name.toLowerCase().includes(v.name.toLowerCase()));
                return scheduleMatch ? scheduleMatch.category === childCycle : true;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            
            // If no manual pending, get from schedule
            if (!nextVaccineDisplay) {
              const pref = child.preferredFacilityType || 'BOTH';
              const nextInSchedule = PNI_SCHEDULE.find(item => {
                if (child.ignoredVaccines?.includes(item.id)) return false;
                if (pref === 'SUS' && item.facilityType === 'PRIVATE') return false;
                if (pref === 'PRIVATE' && item.facilityType === 'SUS') return false;

                const alreadyDone = childVaccines.some(cv => {
                  if (cv.status !== 'completed') return false;
                  const cvName = cv.name.toLowerCase().trim();
                  const sName = item.name.toLowerCase().trim();
                  const nameMatch = cvName.includes(sName) || sName.includes(cvName);
                  if (!nameMatch) return false;
                  if (!item.dose) return true;
                  const cvDose = cv.dose?.toLowerCase().trim() || '';
                  const sDose = item.dose.toLowerCase().trim();
                  return cvDose.includes(sDose) || sDose.includes(cvDose) || cvName.includes(sDose);
                });
                return item.category === childCycle && !alreadyDone;
              });

              if (nextInSchedule) {
                const predDate = new Date(birthDate);
                predDate.setMonth(predDate.getMonth() + (nextInSchedule.ageInMonths || 0));
                
                nextVaccineDisplay = {
                  id: `v-${nextInSchedule.id}`,
                  name: nextInSchedule.name,
                  date: predDate.toISOString().split('T')[0],
                  dose: nextInSchedule.dose,
                  status: 'pending',
                  facilityType: nextInSchedule.facilityType === 'PRIVATE' ? 'PRIVATE' : 'SUS'
                } as any;
              } else {
                nextVaccineDisplay = {
                  id: 'all-completed',
                  name: 'Vacinação em dia! 🎉',
                  date: today.toISOString().split('T')[0],
                  status: 'completed',
                  dose: 'Todas as doses aplicadas'
                } as any;
              }
            }
            
            const daysDiff = Math.ceil((new Date(nextVaccineDisplay.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = nextVaccineDisplay.id !== 'all-completed' && daysDiff < 0;
            
            // Gender-based styles
            const isGirl = child.gender === 'female';
            const genderColor = isGirl ? 'text-pink-600' : 'text-brand-blue';
            const genderBg = isGirl ? 'bg-pink-100' : 'bg-blue-100';
            const avatarBorderColor = isGirl ? 'border-pink-400' : 'border-brand-blue/60';

            return (
              <motion.div
                key={`vac-card-${child.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-6 rounded-[2.5rem] shadow-sm space-y-6 border-none bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-14 h-14 rounded-full border-2 overflow-hidden shadow-sm", avatarBorderColor)}>
                        {child.photoUrl ? (
                          <img src={child.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-300">
                            {child.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-slate-800 tracking-tight">{child.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{calculateAge(child)}</span>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "px-4 py-1.5 rounded-full font-black text-[9px] uppercase shadow-sm",
                      nextVaccineDisplay.id === 'all-completed'
                        ? "bg-emerald-50 text-emerald-600"
                        : isOverdue ? "bg-rose-50 text-rose-600" : (genderBg + " " + genderColor)
                    )}>
                      {nextVaccineDisplay.id === 'all-completed'
                        ? 'Em Dia'
                        : isOverdue ? 'Em Atraso' : `Em ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'}`}
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      useAppStore.getState().setActiveChild(child.id);
                      navigate('/vaccines');
                    }}
                    className={cn(
                      "rounded-3xl p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-sm",
                      genderBg
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Syringe className={cn("w-6 h-6", genderColor)} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={cn("font-bold text-sm tracking-tight leading-tight", genderColor)}>{nextVaccineDisplay.name}</span>
                        {nextVaccineDisplay.dose && (
                          <div className="flex">
                            <span className="text-[8px] font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded shadow-xs border border-white/50 uppercase tracking-tighter">
                              {nextVaccineDisplay.dose}
                            </span>
                          </div>
                        )}
                        {nextVaccineDisplay.facilityType && (
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter opacity-60">
                             Via {nextVaccineDisplay.facilityType === 'SUS' ? 'Posto de Saúde' : 'Clínica Particular'}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={cn("w-5 h-5", genderColor, "opacity-60")} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Health Alerts (Allergies/Observations) */}
        {(activeChild?.allergies || activeChild?.observations) && (
          <section className="space-y-3 pt-2">
             <Card 
               onClick={() => navigate('/profiles')}
               className="bg-rose-50 border-rose-100/50 p-5 p-5 flex items-start gap-4 cursor-pointer active:scale-[0.98] transition-all rounded-[2rem]"
             >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                   <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <div>
                   <h4 className="font-bold text-rose-900 text-sm italic underline decoration-rose-200">Alertas de Saúde</h4>
                   <p className="text-[10px] text-rose-700/70 font-medium leading-relaxed line-clamp-2 mt-0.5">
                      {activeChild.allergies && `Alergias: ${activeChild.allergies}. `}
                      {activeChild.observations && activeChild.observations}
                   </p>
                </div>
             </Card>
          </section>
        )}

        {/* Unified Growth Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Crescimento</h3>
            <button onClick={() => navigate('/growth')} className="text-[10px] font-bold text-brand-blue uppercase tracking-widest leading-none">Ver Histórico</button>
          </div>
          
          <div className="space-y-4">
            {children.map(child => {
              const childMeasurements = measurements.filter(m => m.childId === child.id);
              const lastM = childMeasurements.length > 0 ? childMeasurements[childMeasurements.length - 1] : null;

              const bgColor = child.gender === 'male' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100';
              const iconBg = child.gender === 'male' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white';
              const labelColor = child.gender === 'male' ? 'text-emerald-700' : 'text-orange-700';
              const tagColor = child.gender === 'male' ? 'bg-emerald-600 text-white' : 'bg-orange-600 text-white';

              return (
                <motion.div
                  key={`meas-${child.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    onClick={() => navigate('/growth')}
                    className={cn(
                      "p-5 shadow-sm active:scale-[0.98] transition-all cursor-pointer border-2 relative overflow-hidden",
                      bgColor
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shadow-sm", iconBg)}>
                          <Ruler className="w-4 h-4" />
                        </div>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", labelColor)}>Última Medição</span>
                      </div>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm", tagColor)}>
                        {child.name}
                      </span>
                    </div>

                    {lastM ? (
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/40 p-3 rounded-2xl border border-white/50">
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Peso</span>
                           <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-black text-slate-800 tracking-tighter">{lastM.weight}</span>
                             <span className="text-[10px] font-bold text-slate-400">kg</span>
                           </div>
                         </div>
                         <div className="bg-white/40 p-3 rounded-2xl border border-white/50">
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Altura</span>
                           <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-black text-slate-800 tracking-tighter">{lastM.height}</span>
                             <span className="text-[10px] font-bold text-slate-400">cm</span>
                           </div>
                         </div>
                      </div>
                    ) : (
                      <div className="bg-white/40 p-4 rounded-2xl border border-white/50 flex items-center justify-center">
                        <p className="text-xs font-bold text-slate-400 italic">Nenhuma medição registrada</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Exams Access */}
        <section className="pt-2">
          <Card 
            onClick={() => navigate('/exams')}
            className="bg-card-yellow border border-amber-100 flex items-center justify-between group cursor-pointer active:scale-95 transition-all p-6 rounded-[2rem]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:rotate-6">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 leading-tight">Central de Exames</h3>
                <p className="text-xs text-amber-900/60 font-medium">
                  {exams.length} documentos salvos no total
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </Card>
        </section>

        {/* AI Support Access */}
        <section className="pt-2">
          <Card 
            onClick={() => navigate('/ai-support')}
            className={cn(
              "border flex items-center justify-between group cursor-pointer active:scale-95 transition-all p-6 rounded-[2rem] overflow-hidden relative",
              activeChild?.gender === 'female' 
                ? "bg-pink-50 border-pink-100" 
                : "bg-blue-50 border-blue-100"
            )}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:rotate-6 shadow-sm",
                activeChild?.gender === 'female' ? "bg-pink-500" : "bg-brand-blue"
              )}>
                <CustomAIIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn(
                  "font-bold leading-tight",
                  activeChild?.gender === 'female' ? "text-pink-900" : "text-brand-blue"
                )}>Dúvida com IA</h3>
                <p className={cn(
                  "text-xs font-medium",
                  activeChild?.gender === 'female' ? "text-pink-900/60" : "text-brand-blue/60"
                )}>
                  Pediatra virtual especialista no {activeChild?.name}
                </p>
              </div>
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 relative z-10",
              activeChild?.gender === 'female' ? "text-pink-400" : "text-brand-blue/40"
            )} />
            
            <Sparkles className={cn(
              "absolute -right-4 -bottom-4 w-24 h-24 opacity-5 rotate-12",
              activeChild?.gender === 'female' ? "text-pink-900" : "text-brand-blue"
            )} />
          </Card>
        </section>

        {/* Daily Tips */}
        <section className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">Dicas de Hoje</h3>
            <button 
              onClick={() => navigate('/library')}
              className="text-xs font-bold text-brand-blue uppercase tracking-wider"
            >
              Ver Biblioteca
            </button>
          </div>
          {todayTip && (
            <motion.div 
              onClick={() => navigate('/library')}
              whileTap={{ scale: 0.98 }}
              className="aspect-[4/3] relative rounded-[2.5rem] overflow-hidden group shadow-lg cursor-pointer bg-slate-200"
            >
              <img 
                src={todayTip.imageUrl} 
                alt={todayTip.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="bg-brand-blue/30 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest self-start mb-3 border border-white/20">
                  {todayTip.category}
                </span>
                <h4 className="text-2xl font-bold mb-2 leading-tight">{todayTip.title}</h4>
                <p className="text-white/80 text-sm font-medium line-clamp-2">{todayTip.description}</p>
              </div>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
}
