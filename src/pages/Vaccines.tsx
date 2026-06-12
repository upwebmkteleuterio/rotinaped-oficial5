import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderWithChild from '../components/layout/HeaderWithChild';
import { Card } from '../components/common/UI';
import { 
  Calendar, 
  Syringe, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  Camera,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { useVaccines } from '../hooks/useVaccines';
import VaccineFormModal from '../components/vaccines/VaccineFormModal';
import AIImportModal from '../components/vaccines/AIImportModal';
import { PNI_SCHEDULE } from '../data/vaccineSchedule';

export default function Vaccines() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    activeChild,
    nextVaccine,
    otherUpcoming,
    historyVaccines,
    isFormOpen,
    isManual,
    editingVaccine,
    scheduleItem,
    closeForm,
    openEditModal,
    openManualModal,
    openCreateFromSchedule,
    deleteVaccine
  } = useVaccines();
  
  const isGirl = activeChild?.gender === 'female';

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [historyFilter, setHistoryFilter] = useState<'all' | 'recent'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleNextVaccineClick = () => {
    if (nextVaccine) {
      const sItem = PNI_SCHEDULE.find(s => nextVaccine.name.includes(s.name));
      if (sItem) {
        openCreateFromSchedule(sItem);
      } else {
        openEditModal(nextVaccine);
      }
    } else {
      // Suggest opening notebook to pick one
      navigate('/vaccine-notebook');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setIsAIModalOpen(true);
    }
  };

  const filteredHistory = historyFilter === 'recent' ? historyVaccines.slice(0, 3) : historyVaccines;

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <HeaderWithChild title="Vacinas" />

      <main className="px-6 py-4 space-y-8">
        {/* 1. Caderneta Completa (At the Top) - CTA */}
        <section>
          <button 
            onClick={() => navigate('/vaccine-notebook')}
            className="w-full flex items-center justify-between bg-white border border-slate-100 p-5 rounded-[2rem] hover:bg-slate-50 transition-colors shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform",
                isGirl ? "bg-pink-500 shadow-pink-100" : "bg-blue-500 shadow-blue-100"
              )}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block mb-0.5">Visão Completa</span>
                <h4 className="text-base font-bold text-slate-800">Calendário de Vacinação</h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* Title & Child Info */}
        <section className="flex items-end justify-between">
          <div className="space-y-1">
             <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block">
              Plano de Imunização
            </span>
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Próximas</h2>
          </div>
          <div className="flex items-center gap-2 bg-brand-yellow/10 px-3 py-1.5 rounded-full border border-brand-yellow/20">
            <span className="text-[9px] font-bold text-brand-yellow uppercase tracking-tighter">Brasil • PNI</span>
          </div>
        </section>

        {/* 2. Featured Next Vaccine */}
        {nextVaccine ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleNextVaccineClick}
            className="cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Card className={cn(
              "text-white p-8 relative overflow-hidden shadow-xl min-h-[190px] flex flex-col justify-between border-none",
              isGirl 
                ? "bg-gradient-to-br from-pink-500 to-pink-600 shadow-pink-200" 
                : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200"
            )}>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                  <Syringe className="w-6 h-6" />
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/30">
                  Próxima Recomendação
                </div>
              </div>
              
              <div className="relative z-10 mt-6">
                <h3 className="text-2xl font-bold mb-1 tracking-tight">{nextVaccine.name}</h3>
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{formatDate(nextVaccine.date)}</span>
                </div>
              </div>
              
              <Syringe className="absolute -right-10 -bottom-10 w-44 h-44 text-white/5 rotate-12" />
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            onClick={() => navigate('/vaccine-notebook')}
            className="cursor-pointer"
          >
            <Card className="bg-white border-2 border-dashed border-slate-200 p-8 flex flex-col items-center text-center space-y-4 rounded-[2.5rem]">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <PlusCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Nenhuma vacina agendada</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Acesse o calendário completo para planejar as próximas doses.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Upcoming List */}
        {otherUpcoming.length > 0 && (
          <div className="space-y-4">
            {otherUpcoming.map((vaccine) => (
              <Card 
                key={vaccine.id} 
                onClick={() => openEditModal(vaccine)}
                className="bg-white border border-slate-100 flex items-center justify-between group p-6 cursor-pointer active:bg-slate-50 transition-all rounded-[2rem]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 tracking-tight">{vaccine.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Prevista • {formatDate(vaccine.date)}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Novos Registros</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleUploadClick}
              className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:bg-blue-50/30 active:scale-95 transition-all shadow-sm group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest text-center leading-tight">Importar<br />Caderneta</span>
            </button>
            <button 
              onClick={openManualModal}
              className="flex flex-col items-center justify-center gap-4 bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:bg-emerald-50/30 active:scale-95 transition-all shadow-sm group"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest text-center leading-tight">Registro<br />Manual</span>
            </button>
          </div>
        </section>

        {/* 3. History Section with Filter */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Histórico</h2>
            <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-full border border-slate-200/50">
              {(['all', 'recent'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    historyFilter === f ? "bg-white text-brand-blue shadow-sm" : "text-slate-400"
                  )}
                >
                  {f === 'all' ? 'Ver tudo' : 'Recentes'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((vaccine) => (
                <Card key={vaccine.id} className="bg-white border border-slate-100 p-6 space-y-4 rounded-[2rem] hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 tracking-tight leading-tight">{vaccine.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{formatDate(vaccine.date)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(vaccine)}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === vaccine.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1.5 rounded-xl shrink-0">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteVaccine(vaccine.id);
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
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(vaccine.id);
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {vaccine.location && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2 border-l-2 border-slate-100 ml-6">
                      <MapPin className="w-3.5 h-3.5 text-slate-300" />
                      <span>{vaccine.location}</span>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-16 space-y-4 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Nenhum registro encontrado</p>
                  <p className="text-xs text-slate-400">Suas vacinas aplicadas aparecerão aqui.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <VaccineFormModal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        editingVaccine={editingVaccine}
        scheduleItem={scheduleItem}
        isManual={isManual}
      />

      <AIImportModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        imageFile={selectedImage}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
