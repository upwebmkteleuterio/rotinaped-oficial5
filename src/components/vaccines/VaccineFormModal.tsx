import { useState, FormEvent, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { 
  Syringe, 
  Calendar, 
  MapPin, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Vaccine, VaccineScheduleItem } from '../../types';

interface VaccineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If we're creating from a schedule item
  scheduleItem?: VaccineScheduleItem | null;
  // If we're editing an existing record
  editingVaccine?: Vaccine | null;
  // If we're performing a manual registration
  isManual?: boolean;
}

export default function VaccineFormModal({ isOpen, onClose, scheduleItem, editingVaccine, isManual }: VaccineFormModalProps) {
  const { addVaccine, updateVaccine, activeChildId } = useAppStore();
  
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [location, setLocation] = useState('');
  const [lotNumber, setLotNumber] = useState('');

  // Sync state when modal opens or editingVaccine changes
  useEffect(() => {
    if (editingVaccine) {
      setName(editingVaccine.name);
      setDose(editingVaccine.dose || '');
      setDate(editingVaccine.date.split('T')[0]);
      setLocation(editingVaccine.location || '');
      setLotNumber(editingVaccine.lotNumber || '');
    } else if (scheduleItem) {
      setName(scheduleItem.name);
      setDose(scheduleItem.dose || '');
      setDate(getLocalDateString());
      setLocation('');
      setLotNumber('');
    } else {
      setName('');
      setDose('');
      setDate(getLocalDateString());
      setLocation('');
      setLotNumber('');
    }
  }, [editingVaccine, scheduleItem, isOpen]);

  if (!scheduleItem && !editingVaccine && !isManual) return null;

  const handleSubmit = (status: 'completed' | 'pending' = 'completed') => {
    if (!activeChildId) return;

    if (editingVaccine) {
      updateVaccine(editingVaccine.id, {
        name,
        dose,
        date,
        location,
        lotNumber
      });
    } else {
      if (isManual && !name.trim()) {
        alert("Por favor, informe o nome da vacina.");
        return;
      }
      
      addVaccine({
        id: crypto.randomUUID(),
        childId: activeChildId,
        name: name,
        dose: dose,
        date,
        status,
        location,
        lotNumber,
        description: scheduleItem?.description || ''
      });
    }

    onClose();
  };

  const title = editingVaccine ? 'Editar Aplicação' : (isManual ? 'Registrar Vacina' : 'Confirmar Aplicação');
  const displayName = isManual ? '' : (editingVaccine ? editingVaccine.name : scheduleItem?.name);
  const displayDose = isManual ? '' : (editingVaccine ? editingVaccine.dose : scheduleItem?.dose);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
    >
      <div className="space-y-8 pb-4">
        {/* Vaccine Summary or Name Input */}
        {!isManual ? (
          <div className="bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-50 shrink-0">
              <Syringe className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 tracking-tight text-lg leading-tight truncate">{displayName}</h4>
              {displayDose && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-widest">{displayDose}</span>
                  <div className="w-1 h-1 rounded-full bg-blue-200" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Padrão PNI</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Syringe className="w-3.5 h-3.5" /> Nome da Vacina *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Influenza, Particular..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-200 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Dose (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Dose única, 1ª Dose..."
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-200 shadow-sm"
              />
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Apply Date - REQUIRED */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> {isManual && !editingVaccine ? 'Data de Aplicação / Agendamento' : 'Data da Aplicação'} *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lot Number - OPTIONAL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Nº Lote
              </label>
              <input
                type="text"
                placeholder="Ex: 2309AX"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-200 shadow-sm"
              />
            </div>

            {/* Location - OPTIONAL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Local
              </label>
              <input
                type="text"
                placeholder="Ex: UBS Centro"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-200 shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {isManual && !editingVaccine ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit('pending')}
                  className="w-full py-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-500 transition-colors"
                >
                  Agendar para o futuro
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('completed')}
                  className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Registrar como Aplicada
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit('completed')}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                {editingVaccine ? 'Salvar Alterações' : 'Confirmar Aplicação'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
