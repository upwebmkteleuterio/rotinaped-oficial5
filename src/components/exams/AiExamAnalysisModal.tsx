import { useState, FormEvent } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { 
  FileText, 
  ImageIcon, 
  Upload,
  Sparkles,
  FlaskConical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Exam } from '../../types';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface AiExamAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiExamAnalysisModal({ isOpen, onClose }: AiExamAnalysisModalProps) {
  const navigate = useNavigate();
  const { addExam, activeChildId, children } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);
  
  const [name, setName] = useState('');
  const [laboratory, setLaboratory] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    setIsUploading(true);

    // Simulate analysis upload flow
    setTimeout(() => {
      const examId = crypto.randomUUID();
      const newExam: Exam = {
        id: examId,
        childId: activeChildId,
        name: name || 'Exame de Análise',
        category: 'laboratoriais', // default category
        laboratory: laboratory || 'Laboratório Geral',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        patientName: activeChild?.name,
        fileType,
        fileUrl: fileType === 'pdf' 
          ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          : 'https://picsum.photos/seed/exam/800/1200'
      };

      // Add to patient record so it's persisted
      addExam(newExam);

      setIsUploading(false);
      onClose();
      
      // Navigate to the AISupport chat, passing the newly created exam details to analyze
      navigate('/ai-support', { 
        state: { 
          analyzeExam: {
            name: newExam.name,
            laboratory: newExam.laboratory,
            date: newExam.date,
            fileType: newExam.fileType
          } 
        } 
      });

      // Reset form
      setName('');
      setLaboratory('');
      setFileType('pdf');
      setUploadedFile(false);
    }, 1500);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Analisar Exame com Inteligência Artificial"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0 animate-pulse" />
          <p className="text-[11px] font-bold text-indigo-950 leading-relaxed">
            Como cérebro do RotinaPed, enviarei a imagem ou PDF do exame para a Dra. Flávia analisar, traduzindo resultados técnicos para você em tempo real e de forma simples.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome ou Tipo do Exame</label>
          <input
            type="text"
            required
            placeholder="Ex: Hemograma, Exame de Fezes, Urocultura"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Lab */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Laboratório (Opcional)</label>
          <input
            type="text"
            placeholder="Ex: Fleury, Hermes Pardini, Delboni"
            value={laboratory}
            onChange={(e) => setLaboratory(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Upload Simulation */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tipo de Arquivo</label>
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => { setFileType('pdf'); setUploadedFile(false); }}
              className={cn(
                "flex-1 p-4 rounded-xl border flex items-center justify-center gap-3 transition-all",
                fileType === 'pdf' ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white"
              )}
            >
              <FileText className={cn("w-5 h-5", fileType === 'pdf' ? "text-indigo-600" : "text-slate-300")} />
              <span className={cn("text-xs font-bold", fileType === 'pdf' ? "text-indigo-600" : "text-slate-500")}>PDF</span>
            </button>
            <button 
              type="button"
              onClick={() => { setFileType('image'); setUploadedFile(false); }}
              className={cn(
                "flex-1 p-4 rounded-xl border flex items-center justify-center gap-3 transition-all",
                fileType === 'image' ? "border-indigo-500 bg-indigo-50" : "border-slate-100 bg-white"
              )}
            >
              <ImageIcon className={cn("w-5 h-5", fileType === 'image' ? "text-indigo-600" : "text-slate-300")} />
              <span className={cn("text-xs font-bold", fileType === 'image' ? "text-indigo-600" : "text-slate-500")}>Foto / Imagem</span>
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setUploadedFile(true)}
            className={cn(
              "w-full border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 transition-all outline-none",
              uploadedFile 
                ? "border-emerald-200 bg-emerald-50/20" 
                : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/30"
            )}
          >
            <Upload className={cn("w-8 h-8", uploadedFile ? "text-emerald-500" : "text-slate-300")} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {uploadedFile ? "Exame anexado com sucesso! 🎉" : "Toque para anexar o exame"}
            </p>
            <span className="text-[9px] text-slate-400 font-medium">Suporta PDF, JPG ou PNG de até 10MB</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:bg-indigo-700 font-sans tracking-tight"
        >
          {isUploading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
              Processando Arquivo...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analisar e Abrir Chat da Dra. Flávia
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
