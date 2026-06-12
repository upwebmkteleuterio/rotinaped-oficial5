import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { 
  Loader2, 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  X,
  Syringe,
  Info
} from 'lucide-react';
import { Card } from '../common/UI';
import { formatDate } from '../../lib/utils';
import { useVaccines } from '../../hooks/useVaccines';
import { analyzeVaccineNotebook } from '../../services/aiVaccineService';

interface ImportedVaccine {
  id: string;
  name: string;
  dose: string;
  date: string;
  selected: boolean;
  isFallback: boolean;
}

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
}

export default function AIImportModal({ isOpen, onClose, imageFile }: AIImportModalProps) {
  const { activeChild, addVaccine } = useVaccines();
  const [status, setStatus] = useState<'idle' | 'processing' | 'review'>('idle');
  const [results, setResults] = useState<ImportedVaccine[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && imageFile && status === 'idle') {
      handleProcess();
    }
  }, [isOpen, imageFile]);

  const handleProcess = async () => {
    if (!imageFile || !activeChild) return;
    
    setStatus('processing');
    setError(null);

    try {
      // Simulate reading the file as base64 for the Gemini API
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        try {
          const aiResults = await analyzeVaccineNotebook(base64, activeChild.birthDate);
          
          setResults(aiResults.map(res => ({
            id: res.vaccineId,
            name: res.name,
            dose: res.dose,
            date: res.dateRead || res.expectedDate, // Use fallback if not read
            selected: true,
            isFallback: !res.dateRead
          })));
          
          setStatus('review');
        } catch (err) {
          console.error(err);
          setError("Não foi possível processar a imagem. Tente novamente.");
          setStatus('idle');
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError("Erro ao ler o arquivo.");
      setStatus('idle');
    }
  };

  const toggleSelection = (id: string) => {
    setResults(prev => prev.map(res => 
      res.id === id ? { ...res, selected: !res.selected } : res
    ));
  };

  const updateDate = (id: string, newDate: string) => {
    setResults(prev => prev.map(res => 
      res.id === id ? { ...res, date: newDate, isFallback: false } : res
    ));
  };

  const handleConfirm = () => {
    const selected = results.filter(r => r.selected);
    selected.forEach(v => {
      addVaccine({
        id: crypto.randomUUID(),
        childId: activeChild.id,
        name: v.name,
        dose: v.dose,
        date: v.date,
        status: 'completed',
        description: 'Importado via IA'
      });
    });
    onClose();
    reset();
  };

  const reset = () => {
    setStatus('idle');
    setResults([]);
    setError(null);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => { onClose(); reset(); }} 
      title={status === 'processing' ? 'Analisando Caderneta' : 'Revisar Vacinas'}
    >
      <div className="space-y-6">
        {status === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-brand-blue">
                <Loader2 className="w-12 h-12 animate-spin" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                <Syringe className="w-4 h-4 text-brand-blue" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Aguarde um momento...</h3>
              <p className="text-sm text-slate-500 max-w-[240px]">
                Nossa IA está lendo os registros e identificando as vacinas aplicadas.
              </p>
            </div>
          </div>
        )}

        {status === 'review' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Analise Concluída</h4>
                <p className="text-[11px] text-emerald-600 leading-tight">
                  Identificamos {results.length} vacinas. Revise as datas antes de salvar.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar pb-4">
              {results.map((res) => (
                <div 
                  key={res.id}
                  className={cn(
                    "p-3 rounded-[1.5rem] border transition-all space-y-2.5",
                    res.selected ? "bg-white border-blue-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSelection(res.id)}
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0",
                        res.selected ? "bg-brand-blue border-brand-blue text-white" : "border-slate-200 bg-white"
                      )}
                    >
                      {res.selected && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shadow-sm border shrink-0",
                        res.selected ? "bg-blue-50 text-brand-blue border-blue-50" : "bg-slate-100 text-slate-400 border-slate-100"
                      )}>
                        <Syringe className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800 leading-none truncate max-w-[150px]">{res.name}</h4>
                        <p className="text-[9px] text-brand-blue font-bold uppercase mt-1 tracking-widest">{res.dose}</p>
                      </div>
                    </div>
                  </div>

                  {res.selected && (
                    <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <div className="flex-1 space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase ml-1 tracking-tighter">Data Aplicada</span>
                        <input 
                          type="date"
                          value={res.date}
                          onChange={(e) => updateDate(res.id, e.target.value)}
                          className="w-full bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 p-0 h-4"
                        />
                      </div>
                      {res.isFallback && (
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100" title="Data aproximada sugerida">
                          <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                          <span className="text-[7px] font-bold text-amber-600 uppercase">Sugestão</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleConfirm}
                disabled={results.filter(r => r.selected).length === 0}
                className="w-full py-5 bg-brand-blue text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                Confirmar Importação
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-4 font-medium px-4">
                Ao confirmar, as vacinas marcadas serão adicionadas ao histórico de {activeChild.name}.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-600 font-medium">{error}</p>
            <button 
              onClick={handleProcess}
              className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Helper for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
