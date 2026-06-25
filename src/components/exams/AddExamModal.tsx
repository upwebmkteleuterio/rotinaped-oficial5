import { useState, FormEvent, useRef } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../integrations/supabase/client';
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
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'laboratoriais', label: 'Laboratoriais', icon: FlaskConical, color: 'bg-rose-50 text-rose-500' },
    { id: 'infecciosos', label: 'Infecciosos', icon: ShieldCheck, color: 'bg-yellow-50 text-yellow-600' },
    { id: 'imagens', label: 'Imagens', icon: Eye, color: 'bg-sky-50 text-sky-500' },
    { id: 'respiratorios', label: 'Respiratórios', icon: Wind, color: 'bg-teal-50 text-teal-600' },
    { id: 'triagens', label: 'Triagens', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-500' },
  ] as const;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    if (!file) {
      alert('Por favor, anexe um arquivo (PDF ou Imagem) para o exame.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${activeChildId}/${fileName}`;

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

      await addExam({
        id: crypto.randomUUID(),
        childId: activeChildId,
        name,
        category,
        laboratory,
        date,
        status: 'completed',
        patientName: activeChild?.name,
        fileType: determinedFileType,
        fileUrl: publicUrl
      });

      setIsUploading(false);
      toggleAddExam(false);
      
      // Reset form
      setName('');
      setCategory('laboratoriais');
      setLaboratory('');
      setDate(new Date().toISOString().split('T')[0]);
      setFile(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ocorreu um erro inesperado ao salvar o exame.');
      setIsUploading(false);
    }
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
                ? "border-brand-blue bg-blue-50/50"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
            )}
          >
            {file ? (
              <>
                {file.type.includes('pdf') ? <FileText className="w-8 h-8 text-brand-blue" /> : <ImageIcon className="w-8 h-8 text-brand-blue" />}
                <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest text-center truncate w-full px-4">
                  {file.name}
                </p>
                <span className="text-[9px] text-brand-blue/60 font-medium">Toque para trocar o arquivo</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toque para anexar arquivo</p>
                <span className="text-[9px] text-slate-400 font-medium">Suporta PDF, JPG ou PNG</span>
              </>
            )}
          </button>
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
