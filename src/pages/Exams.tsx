import { useAppStore } from '../store/useAppStore';
import HeaderWithChild from '../components/layout/HeaderWithChild';
import { Card } from '../components/common/UI';
import { 
  Search, 
  ChevronRight, 
  FileText, 
  Droplet, 
  ShieldCheck, 
  Sun, 
  FlaskConical, 
  ImageIcon, 
  MoreHorizontal,
  Download,
  Calendar,
  Plus,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Trash2,
  Wind,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { useState } from 'react';
import Modal from '../components/common/Modal';
import AddExamModal from '../components/exams/AddExamModal';
import AiExamAnalysisModal from '../components/exams/AiExamAnalysisModal';
import { useNavigate } from 'react-router-dom';

export default function Exams() {
  const navigate = useNavigate();
  const { exams, activeChildId, toggleAddExam, deleteExam } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);

  const categories = [
    { id: 'laboratoriais', label: 'Laboratoriais', icon: FlaskConical, color: 'bg-rose-100 text-rose-500' },
    { id: 'infecciosos', label: 'Infecciosos', icon: ShieldCheck, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'imagens', label: 'Imagens', icon: Eye, color: 'bg-sky-100 text-sky-500' },
    { id: 'respiratorios', label: 'Respiratórios', icon: Wind, color: 'bg-teal-100 text-teal-600' },
    { id: 'triagens', label: 'Triagens', icon: ClipboardList, color: 'bg-emerald-100 text-emerald-500' },
  ];

  const filteredExams = exams.filter(e => 
    e.childId === activeChildId && 
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     e.laboratory.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedCategory || e.category === selectedCategory)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <HeaderWithChild title="Exames" />

      <main className="px-6 py-4 space-y-8">
        {/* Banner Section */}
        <section>
          <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-8 overflow-hidden relative shadow-xl shadow-blue-100">
            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Central de Exames</h2>
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[240px]">
                Organize e acesse os resultados de exames do seu pequeno em um clique.
              </p>
            </div>
            <FileText className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
          </Card>
        </section>

        {/* AI Exam Analysis Card */}
        <section>
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-100/60 p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 relative z-10">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">Análise de Exame com IA</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Dra. Flávia Explica seu Exame</h3>
              <p className="text-xs text-slate-500 leading-normal max-w-[320px]">
                Receba uma análise inicial com IA e entenda os principais resultados de forma clara e didática. Não substitui avaliação médica.
              </p>
            </div>
            <button 
              onClick={() => setIsAiAnalysisOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 self-start md:self-auto shadow-md shadow-indigo-100 transition-all z-10"
            >
              <Sparkles className="w-4 h-4" /> Analisar Exame com IA
            </button>
            <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-100/30 rotate-12 pointer-events-none" />
          </Card>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar exames ou laboratórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
          />
        </div>

        {/* Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Categorias</h3>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-[10px] font-bold text-brand-blue uppercase tracking-widest active:opacity-50 transition-opacity"
              >
                Limpar Filtro
              </button>
            )}
            {!selectedCategory && (
              <button 
                onClick={() => navigate('/all-exams')}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest active:opacity-50 transition-opacity"
              >
                Ver Todas
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <motion.div 
                key={cat.id} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <Card className={cn(
                  "bg-white border flex flex-col items-center gap-3 p-6 text-center transition-all cursor-pointer",
                  selectedCategory === cat.id ? "border-brand-blue ring-2 ring-brand-blue/10 bg-blue-50/20" : "border-slate-100 hover:bg-slate-50"
                )}>
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-transform", cat.color, selectedCategory === cat.id && "scale-110 shadow-inner")}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-xs font-bold tracking-tight",
                    selectedCategory === cat.id ? "text-brand-blue" : "text-slate-600"
                  )}>
                    {cat.label}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Exams */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">
            {selectedCategory ? `Exames: ${categories.find(c => c.id === selectedCategory)?.label}` : 'Exames Recentes'}
          </h3>
          <div className="space-y-4">
            {filteredExams.map((exam) => (
              <motion.div 
                key={exam.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  onClick={() => exam.fileUrl && setSelectedExam(exam)}
                  className={cn(
                    "bg-white border relative p-5 flex items-center justify-between group cursor-pointer",
                    exam.status === 'analyzing' ? "border-amber-200 border-l-4 border-l-amber-400" : "border-slate-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      exam.fileType === 'pdf' ? "bg-blue-50 text-brand-blue" : "bg-rose-50 text-rose-500"
                    )}>
                      {exam.fileType === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 tracking-tight truncate">{exam.name}</h4>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{exam.laboratory}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {exam.patientName ? `${exam.patientName} • ` : ''}
                          {formatDate(exam.date).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {exam.status === 'analyzing' ? (
                    <div className="bg-amber-50 px-3 py-1.5 rounded-full text-[8px] font-bold text-amber-700 uppercase tracking-widest whitespace-nowrap ml-2">
                      Em Análise
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 ml-2">
                      <a
                        href={exam.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-blue-50 text-brand-blue px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider group-active:scale-95 transition-transform hover:bg-blue-100"
                      >
                        <Download className="w-3.5 h-3.5" /> {exam.fileType === 'pdf' ? 'PDF' : 'IMG'}
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteExam(exam.id); }}
                        className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}

            {filteredExams.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <FileText className="w-10 h-10" />
                </div>
                <p className="text-slate-400 font-medium tracking-tight">Nenhum exame encontrado nesta categoria.</p>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-brand-blue font-bold text-xs uppercase"
                  >
                    Ver todos os exames
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FAB - Add Exam */}
      <button 
        onClick={() => toggleAddExam(true)}
        className="fixed right-6 bottom-28 w-14 h-14 bg-brand-cyan rounded-2xl shadow-lg shadow-cyan-200 flex items-center justify-center text-white active:scale-95 transition-transform z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddExamModal />
      <AiExamAnalysisModal isOpen={isAiAnalysisOpen} onClose={() => setIsAiAnalysisOpen(false)} />

      {/* Exam Viewer Modal */}
      <Modal 
        isOpen={!!selectedExam} 
        onClose={() => { setSelectedExam(null); setZoom(1); }}
        title={selectedExam?.name || 'Ver Exame'}
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
             <div className="space-y-3">
               <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <span>Informações do Exame</span>
                 <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Assinado Digitalmente</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Data</span>
                    <span className="text-sm font-bold text-slate-800">{formatDate(selectedExam?.date)}</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Laboratório</span>
                    <span className="text-sm font-bold text-slate-800 truncate">{selectedExam?.laboratory}</span>
                 </div>
               </div>
             </div>

             <a
               href={selectedExam?.fileUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="bg-brand-blue text-white w-full py-4 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-[#134e75] transition-colors"
             >
               <Download className="w-5 h-5" /> Abrir / Baixar Documento
             </a>
          </div>

          <button 
            onClick={() => setSelectedExam(null)}
            className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl active:opacity-90 transition-opacity"
          >
            Fechar Visualizador
          </button>
        </div>
      </Modal>
    </div>
  );
}