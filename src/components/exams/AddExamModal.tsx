import { useState, FormEvent } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { 
  FileText, 
  FlaskConical, 
  ImageIcon, 
  MoreHorizontal, 
  Droplet, 
  Sun, 
  ShieldCheck,
  Calendar,
  Upload,
  CheckCircle2,
  Wind,
  ClipboardList,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Exam } from '../../types';
import { motion } from 'motion/react';

export default function AddExamModal() {
  const { ui, toggleAddExam, addExam, activeChildId, children } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exam['category']>('laboratoriais');
  const [laboratory, setLaboratory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { id: 'laboratoriais', label: 'Laboratoriais', icon: FlaskConical, color: 'bg-rose-50 text-rose-500' },
    { id: 'infecciosos', label: 'Infecciosos', icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600' },
    { id: 'imagens', label: 'Imagens', icon: Eye, color: 'bg-sky-50 text-sky-500' },
    { id: 'respiratorios', label: 'Respiratórios', icon: Wind, color: 'bg-teal-50 text-teal-600' },
    { id: 'triagens', label: 'Triagens', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-500' },
  ] as const;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      addExam({
        id: crypto.randomUUID(),
        childId: activeChildId,
        name,
        category,
        laboratory,
        date,
        status: 'completed',
        patientName: activeChild?.name,
        fileType,
        fileUrl: fileType === 'pdf' 
          ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          : 'https://picsum.photos/seed/exam/800/1200'
      });

      setIsUploading(false);
      toggleAddExam(false);
      
      // Reset form
      setName('');
      setCategory('laboratoriais');
      setLaboratory('');
      setDate(new Date().toISOString().split('T')[0]);
    }, 1500);
  };

  return (
    <Modal 
      isOpen={ui.exams?.isAddModalOpen || false} 
      onClose={() => toggleAddExam(false)} 
      title="Registrar Novo Exame"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Exame</label>
          <input
            type="text"
            required
            placeholder="Ex: Hemograma Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Categoria</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as Exam['category'])}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                  category === cat.id 
                    ? "border-brand-blue bg-blue-50/50" 
                    : "border-slate-50 bg-white"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center scale-90", cat.color)}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <span className={cn("text-[9px] font-bold tracking-tight", category === cat.id ? "text-brand-blue" : "text-slate-500")}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lab and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Laboratório</label>
            <input
              type="text"
              placeholder="Ex: Fleury"
              value={laboratory}
              onChange={(e) => setLaboratory(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Data</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Upload Simulation */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Documento</label>
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setFileType('pdf')}
              className={cn(
                "flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all",
                fileType === 'pdf' ? "border-brand-blue bg-blue-50" : "border-slate-50 bg-white"
              )}
            >
              <FileText className={cn("w-5 h-5", fileType === 'pdf' ? "text-brand-blue" : "text-slate-300")} />
              <span className={cn("text-xs font-bold", fileType === 'pdf' ? "text-brand-blue" : "text-slate-500")}>PDF</span>
            </button>
            <button 
              type="button"
              onClick={() => setFileType('image')}
              className={cn(
                "flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all",
                fileType === 'image' ? "border-brand-blue bg-blue-50" : "border-slate-50 bg-white"
              )}
            >
              <ImageIcon className={cn("w-5 h-5", fileType === 'image' ? "text-brand-blue" : "text-slate-300")} />
              <span className={cn("text-xs font-bold", fileType === 'image' ? "text-brand-blue" : "text-slate-500")}>Imagem</span>
            </button>
          </div>
          
          <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-300" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toque para selecionar arquivo</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-5 bg-brand-cyan text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-cyan-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          {isUploading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Confirmar Registro
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
