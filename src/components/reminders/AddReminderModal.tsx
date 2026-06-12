import { useState, FormEvent, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { 
  Bell,
  Clock,
  RefreshCcw,
  Stethoscope,
  ShieldCheck,
  Syringe,
  Pill,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Reminder } from '../../types';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Reminder>;
}

export default function AddReminderModal({ isOpen, onClose, initialData }: AddReminderModalProps) {
  const { addReminder } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('08:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<Reminder['type']>('appointment');
  const [frequency, setFrequency] = useState<Reminder['frequency']>('once');

  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.type) setType(initialData.type);
      if (initialData.date) setDate(initialData.date);
      if (initialData.time) setTime(initialData.time);
      if (initialData.frequency) setFrequency(initialData.frequency);
    } else if (isOpen) {
      // Reset for new entry
      setTitle('');
      setDescription('');
      setTime('08:00');
      setDate(new Date().toISOString().split('T')[0]);
      setType('appointment');
      setFrequency('once');
    }
  }, [isOpen, initialData]);

  const types = [
    { id: 'appointment', label: 'Consulta', icon: Stethoscope, color: 'bg-blue-50 text-blue-500' },
    { id: 'vaccine', label: 'Vacina', icon: Syringe, color: 'bg-emerald-50 text-emerald-500' },
    { id: 'medication', label: 'Medicação', icon: Pill, color: 'bg-rose-50 text-rose-500' },
  ] as const;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    addReminder({
      id: crypto.randomUUID(),
      title,
      description,
      time,
      date,
      type,
      frequency,
      enabled: true
    });

    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={type === 'appointment' ? "Nova Consulta" : "Novo Lembrete"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Título</label>
          <input
              type="text"
              required
              placeholder={type === 'appointment' ? "Ex: Consulta de Rotina" : type === 'vaccine' ? "Ex: Vacina" : "Ex: Paracetamol"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {types.map((t) => (
              <button 
                key={t.id}
                type="button"
                onClick={() => setType(t.id as Reminder['type'])}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                  type === t.id ? "border-brand-blue bg-blue-50" : "border-slate-50 bg-white"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center scale-90", t.color)}>
                   <t.icon className="w-4 h-4" />
                </div>
                <span className={cn("text-[8px] font-bold", type === t.id ? "text-brand-blue" : "text-slate-400")}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Horário</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Frequência</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Reminder['frequency'])}
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all appearance-none"
            >
              <option value="once">Uma vez</option>
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Observações (Opcional)</label>
          <textarea
            placeholder={type === 'appointment' ? "Local, nome do médico..." : "Dosagem..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300 min-h-[80px] resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-brand-blue text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" /> Salvar Agendamento
        </button>
      </form>
    </Modal>
  );
}
