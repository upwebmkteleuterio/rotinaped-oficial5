import { useState, FormEvent, useRef } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../integrations/supabase/client';
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
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    if (!file) {
      alert('Por favor, anexe um arquivo (PDF ou Imagem) do exame para a IA analisar.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${activeChildId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exams')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('exams')
        .getPublicUrl(filePath);

      const determinedFileType = file.type.includes('pdf') ? 'pdf' : 'image';

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
        fileType: determinedFileType,
        fileUrl: publicUrl
      };

      // Add to patient record so it's persisted
      await addExam(newExam);

      setIsUploading(false);
      onClose();
      
      // Navigate to the AISupport chat, passing the newly created exam details to analyze
      navigate('/ai-support', {
        state: {
          analyzeExam: {
            name: newExam.name,
            laboratory: newExam.laboratory,
            date: newExam.date,
            fileType: newExam.fileType,
            fileUrl: newExam.fileUrl
          }
        }
      });

      // Reset form
      setName('');
      setLaboratory('');
      setFile(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ocorreu um erro inesperado ao processar o exame.');
      setIsUploading(false);
    }
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

        {/* Upload File */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Documento (PDF ou Imagem)</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*,application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 transition-all outline-none",
              file
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/30"
            )}
          >
            {file ? (
              <>
                {file.type.includes('pdf') ? <FileText className="w-8 h-8 text-indigo-600" /> : <ImageIcon className="w-8 h-8 text-indigo-600" />}
                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest text-center truncate w-full px-4">
                  {file.name}
                </p>
                <span className="text-[9px] text-indigo-600/60 font-medium">Toque para trocar o arquivo</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-300" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Toque para anexar o exame
                </p>
                <span className="text-[9px] text-slate-400 font-medium">Suporta PDF, JPG ou PNG de até 10MB</span>
              </>
            )}
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
