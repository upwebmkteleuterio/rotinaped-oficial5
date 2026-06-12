import { useState, useEffect, useMemo, FormEvent } from 'react';
import Modal from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  ChevronRight, 
  Calendar, 
  Ruler, 
  Weight, 
  Activity, 
  Heart, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AddMeasurementModal() {
  const { ui, toggleAddMeasurement, addMeasurement, updateMeasurement, setEditingMeasurement, activeChildId, children, measurements } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeChild = children.find(c => c.id === activeChildId);
  
  const [date, setDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');

  const editingMeasurement = useMemo(() => {
    const editId = ui.growth?.editingMeasurementId;
    if (!editId) return null;
    return measurements.find(m => m.id === editId) || null;
  }, [ui.growth?.editingMeasurementId, measurements]);

  useEffect(() => {
    if (editingMeasurement) {
      setDate(editingMeasurement.date);
      setWeight(editingMeasurement.weight !== undefined ? String(editingMeasurement.weight) : '');
      setHeight(editingMeasurement.height !== undefined ? String(editingMeasurement.height) : '');
      setHead(editingMeasurement.headCircumference !== undefined ? String(editingMeasurement.headCircumference) : '');
      setBloodPressure(editingMeasurement.bloodPressure || '');
    } else {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setWeight('');
      setHeight('');
      setHead('');
      setBloodPressure('');
    }
  }, [editingMeasurement, ui.growth?.isAddMeasurementOpen]);

  // Calculate age based on birth date and measurement date
  const calculatedAge = useMemo(() => {
    if (!activeChild || !date) return '';
    const birth = new Date(activeChild.birthDate);
    const measurementDate = new Date(date);
    
    let months = (measurementDate.getFullYear() - birth.getFullYear()) * 12 + measurementDate.getMonth() - birth.getMonth();
    
    if (months < 1) {
      const diffTime = Math.abs(measurementDate.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} dias`;
    }
    
    if (months < 24) {
      return `${months} meses`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}a ${remainingMonths}m` : `${years} anos`;
  }, [activeChild, date]);

  // Check if head circumference should be shown (up to 3 years / 36 months)
  const showHeadCircumference = useMemo(() => {
    if (!activeChild || !date) return true;
    const birth = new Date(activeChild.birthDate);
    const measurementDate = new Date(date);
    const months = (measurementDate.getFullYear() - birth.getFullYear()) * 12 + measurementDate.getMonth() - birth.getMonth();
    return months <= 36;
  }, [activeChild, date]);

  // BMI Calculation
  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return '';
  }, [weight, height]);

  // Sync with URL
  const isUrlOpen = searchParams.get('modal') === 'add-measurement';
  
  useEffect(() => {
    if (isUrlOpen) {
      toggleAddMeasurement(true);
    } else {
      toggleAddMeasurement(false);
    }
  }, [isUrlOpen, toggleAddMeasurement]);

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('modal');
    setSearchParams(newParams);
    toggleAddMeasurement(false);
    setEditingMeasurement(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !weight || !height || !date) return;

    const payload = {
      childId: activeChildId,
      date,
      weight: parseFloat(weight),
      height: parseFloat(height),
      headCircumference: head ? parseFloat(head) : undefined,
      bloodPressure: bloodPressure || undefined,
      imc: bmi ? parseFloat(bmi) : undefined,
    };

    if (editingMeasurement) {
      updateMeasurement(editingMeasurement.id, payload);
    } else {
      addMeasurement({
        id: crypto.randomUUID(),
        ...payload,
      });
    }

    handleClose();
  };

  return (
    <Modal 
      isOpen={ui.growth?.isAddMeasurementOpen || false} 
      onClose={handleClose} 
      title={editingMeasurement ? "Editar Medição" : "Nova Medição"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-1 pt-1 no-scrollbar pb-6">
        {/* Child Info & Age Display */}
        <div className="bg-emerald-50/50 p-4 rounded-[1.5rem] border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                <Clock className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Idade Prevista</p>
                <h4 className="text-lg font-bold text-slate-800 leading-none">{calculatedAge || '--'}</h4>
             </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Criança</p>
            <span className="text-xs font-bold text-slate-600 block truncate max-w-[80px]">{activeChild?.name}</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Date Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Data do Registro *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Weight Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Weight className="w-3.5 h-3.5" /> Peso (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
              />
            </div>
            {/* Height Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5" /> Altura (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className={cn("grid gap-3 transition-all", showHeadCircumference ? "grid-cols-2" : "grid-cols-1")}>
            {/* Head Circumference Field */}
            {showHeadCircumference && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Perímetro (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                />
              </div>
            )}

            {/* Blood Pressure Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" /> Pressão Arterial
              </label>
              <input
                type="text"
                placeholder="80/60"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* BMI Display */}
        {bmi && (
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-brand-blue border border-blue-50 shadow-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">IMC Calculado</span>
                <p className="text-base font-bold text-brand-blue leading-none mt-1">{bmi}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Status</span>
              <p className="text-[9px] font-bold text-emerald-600 uppercase">Normal</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-100 active:scale-[0.98] transition-all mt-2"
        >
          {editingMeasurement ? "Atualizar Registro" : "Salvar Registro"}
        </button>
      </form>
    </Modal>
  );
}
