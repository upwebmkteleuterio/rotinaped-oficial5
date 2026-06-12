import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  Search, 
  ChevronLeft, 
  FileText, 
  ImageIcon, 
  Download,
  Trash2,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AllExams() {
  const navigate = useNavigate();
  const { exams, activeChildId, deleteExam } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    { id: 'Todos', label: 'Todos' },
    { id: 'laboratoriais', label: 'Laboratoriais' },
    { id: 'infecciosos', label: 'Infecciosos' },
    { id: 'imagens', label: 'Imagens' },
    { id: 'respiratorios', label: 'Respiratórios' },
    { id: 'triagens', label: 'Triagens' },
  ];

  const filteredExams = exams.filter(e => 
    e.childId === activeChildId && 
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     e.laboratory.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'Todos' || e.category === selectedCategory)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Relatório de Exames gerado com sucesso! O download começará em instantes.');
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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Todos os Exames</h2>
        </div>

        {/* Action Header */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por nome ou laboratório..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleExportPDF}
            className={cn(
               "w-14 h-14 bg-brand-blue text-white rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95",
               isExporting && "opacity-50 pointer-events-none"
            )}
          >
            <Download className={cn("w-6 h-6", isExporting && "animate-bounce")} />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                selectedCategory === cat.id 
                  ? "bg-brand-blue text-white border-brand-blue shadow-md" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exam List */}
        <div className="space-y-4">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-white border border-slate-50 p-5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      exam.fileType === 'pdf' ? "bg-blue-50 text-brand-blue" : "bg-rose-50 text-rose-500"
                    )}>
                      {exam.fileType === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 tracking-tight">{exam.name}</h4>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{exam.laboratory}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDate(exam.date).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-300 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteExam(exam.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-bold">Nenhum exame encontrado</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
