import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  Clock, 
  CalendarDays, 
  Syringe, 
  Bell, 
  ChevronRight,
  RefreshCcw,
  Stethoscope,
  Pill,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useState, useMemo } from 'react';
import AddReminderModal from '../components/reminders/AddReminderModal';
import { PNI_SCHEDULE } from '../data/vaccineSchedule';
import { Reminder } from '../types';

export default function Reminders() {
  const { children, activeChildId, reminders, updateReminder, deleteReminder, vaccines } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [initialModalData, setInitialModalData] = useState<Partial<Reminder> | undefined>(undefined);

  const activeChild = children.find(c => c.id === activeChildId) || children[0];

  const handleToggle = (id: string, enabled: boolean) => {
    updateReminder(id, { enabled: !enabled });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lembrete?')) {
      deleteReminder(id);
    }
  };

  const appointments = useMemo(() => 
    reminders.filter(r => r.type === 'appointment')
      .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()),
    [reminders]
  );

  const medications = useMemo(() => 
    reminders.filter(r => r.type === 'medication' || r.type === 'vitamin_d' || r.type === 'ferro')
      .sort((a, b) => a.time.localeCompare(b.time)),
    [reminders]
  );

  // Logical Upcoming Vaccines Integration
  const upcomingVaccines = useMemo(() => {
    if (!activeChild) return [];
    
    // Calculate child age in months
    const birth = new Date(activeChild.birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();

    // Get all scheduled vaccines for this age and beyond
    // Filter out those already completed
    const pref = activeChild.preferredFacilityType || 'BOTH';
    return PNI_SCHEDULE
      .filter(v => {
        if (activeChild.ignoredVaccines?.includes(v.id)) return false;
        if (pref === 'SUS' && v.facilityType === 'PRIVATE') return false;
        if (pref === 'PRIVATE' && v.facilityType === 'SUS') return false;
        return v.ageInMonths >= months || v.category === 'baby';
      })
      .filter(v => !vaccines.some(cv => cv.childId === activeChild.id && cv.name === v.name && cv.status === 'completed'))
      .slice(0, 5); // Show next 5
  }, [activeChild, vaccines]);

  const openAddModal = (data?: Partial<Reminder>) => {
    setInitialModalData(data);
    setIsAddOpen(true);
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <Header />

      <main className="px-6 py-4 space-y-10">
        <section>
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Lembretes</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Personalize o cuidado e a rotina do seu pequeno.</p>
        </section>

        {/* Real Appointments Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-bold">Próximas Consultas</h3>
            </div>
            <button 
              onClick={() => openAddModal({ type: 'appointment' })}
              className="text-xs font-bold text-brand-blue uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full"
            >
              Agendar
            </button>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="bg-white p-8 text-center border-dashed border-2 border-slate-100 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Nenhuma consulta agendada.</p>
              </Card>
            ) : (
              appointments.map(item => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center">
                             <CalendarDays className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800">{item.title}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date ? new Date(item.date).toLocaleDateString('pt-BR') : 'Sem data'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggle(item.id, item.enabled)}
                            className={cn(
                              "w-10 h-5 rounded-full relative transition-colors duration-300",
                              item.enabled ? "bg-brand-blue" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                              item.enabled ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-xs font-bold text-slate-600">{item.time}</span>
                       </div>
                       {item.description && (
                         <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-xs font-medium text-slate-400 truncate max-w-[150px]">{item.description}</span>
                         </div>
                       )}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Medicações e Rotina Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                <Pill className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold">Medicação e Rotina</h3>
            </div>
            <button 
              onClick={() => openAddModal({ type: 'medication' })}
              className="text-xs font-bold text-brand-blue uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full"
            >
              Adicionar
            </button>
          </div>

          <div className="space-y-4">
            {medications.length === 0 ? (
              <Card className="bg-white p-8 text-center border-dashed border-2 border-slate-100 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Pill className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Nenhum lembrete de medicação ou rotina criado.</p>
              </Card>
            ) : (
              medications.map(item => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                             <Pill className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800">{item.title}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">
                               {item.frequency === 'daily' ? 'Diário' : item.frequency === 'weekly' ? 'Semanal' : 'Uma vez'}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggle(item.id, item.enabled)}
                            className={cn(
                              "w-10 h-5 rounded-full relative transition-colors duration-300",
                              item.enabled ? "bg-brand-blue" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                              item.enabled ? "left-5.5" : "left-0.5"
                            )} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-xs font-bold text-slate-600">{item.time}</span>
                       </div>
                       {item.description && (
                         <div className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-xs font-medium text-slate-400 truncate max-w-[150px]">{item.description}</span>
                         </div>
                       )}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Vaccine Notifications Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                <Syringe className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-bold">Próximas Vacinas</h3>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingVaccines.map((v, idx) => {
              const hasReminder = reminders.some(r => r.type === 'vaccine' && r.title.includes(v.name));
              
              return (
                <Card key={v.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                       <span className="text-[10px] font-extrabold text-brand-blue uppercase tracking-widest">{v.ageLabel}</span>
                       <h4 className="text-lg font-bold text-slate-800 leading-tight">{v.name}</h4>
                       <p className="text-[10px] text-slate-400 font-bold mt-0.5">{v.dose}</p>
                    </div>
                    {hasReminder ? (
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-50">
                        <Bell className="w-3 h-3 fill-emerald-600" /> Lembrada
                      </div>
                    ) : (
                      <button 
                        onClick={() => openAddModal({
                          type: 'vaccine',
                          title: `Vacina: ${v.name}`,
                          description: `Ref: ${v.dose} - ${v.ageLabel}`,
                          frequency: 'once'
                        })}
                        className="bg-slate-50 text-slate-400 px-4 py-2 rounded-full text-[10px] font-bold hover:bg-brand-blue hover:text-white transition-all active:scale-95 flex items-center gap-2"
                      >
                         <Bell className="w-3.5 h-3.5" /> Ativar Alerta
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-slate-50/50 rounded-2xl p-3 flex items-center gap-3">
                     <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300">
                        <Clock className="w-4 h-4" />
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {hasReminder 
                          ? "Lembrete configurado. Você será notificada na data e hora escolhida."
                          : "Configure um alerta personalizado para nunca esquecer esta dose."}
                     </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <AddReminderModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)}
        initialData={initialModalData}
      />
    </div>
  );
}
