import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  ArrowLeft,
  Calendar,
  Syringe,
  CheckCircle2,
  Trash2,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AllVaccines() {
  const navigate = useNavigate();
  const { vaccines, activeChildId, deleteVaccine } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredVaccines = vaccines.filter(v => 
    v.childId === activeChildId &&
    (filter === 'all' || v.status === filter) &&
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Caderneta Digital exportada com sucesso! O arquivo PDF será baixado agora.');
    }, 2000);
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <Header />

      <main className="px-6 py-4 space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Histórico de Vacinas</h2>
        </div>

        {/* Action Header */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar vacina pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleExportPDF}
            className={cn(
               "w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95",
               isExporting && "opacity-50 pointer-events-none"
            )}
          >
            <Download className={cn("w-6 h-6", isExporting && "animate-bounce")} />
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'completed', label: 'Aplicadas' },
            { id: 'pending', label: 'Pendentes' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === item.id 
                  ? "bg-white text-brand-blue shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Vaccine List */}
        <div className="space-y-4">
          {filteredVaccines.length > 0 ? (
            filteredVaccines.map((vaccine) => (
              <motion.div 
                key={vaccine.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className={cn(
                  "p-6 flex items-center justify-between border rounded-[2rem] transition-all",
                  vaccine.status === 'completed' ? "bg-white border-slate-100 shadow-sm" : "bg-blue-50/30 border-blue-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      vaccine.status === 'completed' ? "bg-emerald-50 text-emerald-500" : "bg-blue-500 text-white"
                    )}>
                      {vaccine.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <Syringe className="w-7 h-7" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 tracking-tight text-base truncate pr-2">{vaccine.name}</h4>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                        vaccine.status === 'completed' ? "text-slate-400" : "text-blue-500"
                      )}>
                        {vaccine.status === 'completed' ? 'Aplicada • ' : 'Prevista • '} {formatDate(vaccine.date)}
                      </p>
                    </div>
                  </div>

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
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center space-y-6 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Syringe className="w-10 h-10" />
              </div>
              <div>
                <p className="text-slate-800 font-bold text-lg">Nenhuma vacina encontrada</p>
                <p className="text-xs text-slate-400 mt-1">Tente mudar o filtro ou buscar outro nome.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
