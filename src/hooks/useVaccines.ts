import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Vaccine, VaccineScheduleItem } from '../types';
import { PNI_SCHEDULE } from '../data/vaccineSchedule';

export function useVaccines() {
  const { 
    children, 
    activeChildId, 
    vaccines, 
    addVaccine, 
    updateVaccine, 
    deleteVaccine,
    updateChild
  } = useAppStore();

  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  
  const activeChildCycle = useMemo(() => {
    if (!activeChild) return 'baby';
    if (activeChild.profileType && activeChild.profileType !== 'child') {
      return activeChild.profileType;
    }
    const birthDate = new Date(activeChild.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    
    if (ageInMonths <= 12) return 'baby';
    if (ageInMonths <= 120) return 'child'; // 10 years
    return 'adolescent';
  }, [activeChild]);
  const childVaccines = useMemo(() => 
    vaccines.filter(v => v.childId === activeChildId),
    [vaccines, activeChildId]
  );

  const upcomingVaccines = useMemo(() => 
    childVaccines
      .filter(v => v.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [childVaccines]
  );
  
  const historyVaccines = useMemo(() => 
    childVaccines
      .filter(v => v.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [childVaccines]
  );

  const nextVaccine = useMemo(() => {
    if (upcomingVaccines.length > 0) return upcomingVaccines[0];
    
    // If no upcoming, find the next one in the schedule based on age
    if (!activeChild) return null;
    
    const birthDate = new Date(activeChild.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    
    const nextInSchedule = PNI_SCHEDULE.find(item => {
      // Exclude if ignored by child
      if (activeChild?.ignoredVaccines?.includes(item.id)) return false;
      
      // Filter based on preferred facility
      const preferred = activeChild?.preferredFacilityType || 'BOTH';
      if (preferred === 'SUS' && item.facilityType === 'PRIVATE') return false;
      if (preferred === 'PRIVATE' && item.facilityType === 'SUS') return false;

      // Find vaccines for current or future age that haven't been completed
      const vaccineCompleted = vaccines.some(v => {
        if (v.childId !== activeChildId || v.status !== 'completed') return false;
        const vName = v.name.toLowerCase().trim();
        const sName = item.name.toLowerCase().trim();
        const nameMatch = vName.includes(sName) || sName.includes(vName);
        if (!nameMatch) return false;
        if (!item.dose) return true;
        const vDose = v.dose?.toLowerCase().trim() || '';
        const sDose = item.dose.toLowerCase().trim();
        return vDose.includes(sDose) || sDose.includes(vDose) || vName.includes(sDose);
      });
      return item.category === activeChildCycle && !vaccineCompleted;
    });

    if (nextInSchedule) {
      // Create a "virtual" vaccine object for display
      const predictedDate = new Date(birthDate);
      predictedDate.setMonth(predictedDate.getMonth() + (nextInSchedule.ageInMonths || 0));
      
      return {
        id: `virtual-${nextInSchedule.id}`,
        childId: activeChild.id,
        name: nextInSchedule.name,
        date: predictedDate.toISOString().split('T')[0],
        status: 'pending',
        dose: nextInSchedule.dose,
        facilityType: nextInSchedule.facilityType === 'PRIVATE' ? 'PRIVATE' : 'SUS'
      } as Vaccine;
    }

    return null;
  }, [upcomingVaccines, activeChild, vaccines, activeChildId]);

  const otherUpcoming = upcomingVaccines.slice(1);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [scheduleItem, setScheduleItem] = useState<VaccineScheduleItem | null>(null);

  const openEditModal = (vaccine: Vaccine) => {
    setEditingVaccine(vaccine);
    setScheduleItem(null);
    setIsManual(false);
    setIsFormOpen(true);
  };

  const openCreateFromSchedule = (item: VaccineScheduleItem) => {
    setScheduleItem(item);
    setEditingVaccine(null);
    setIsManual(false);
    setIsFormOpen(true);
  };

  const openManualModal = () => {
    setScheduleItem(null);
    setEditingVaccine(null);
    setIsManual(true);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVaccine(null);
    setScheduleItem(null);
    setIsManual(false);
  };

  const isCompleted = (vaccineName: string, dose?: string) => {
    return vaccines.some(v => {
      if (v.childId !== activeChildId || v.status !== 'completed') return false;
      const vName = v.name.toLowerCase().trim();
      const sName = vaccineName.toLowerCase().trim();
      const nameMatch = vName.includes(sName) || sName.includes(vName);
      if (!nameMatch) return false;
      if (!dose) return true;
      
      const vDose = v.dose?.toLowerCase().trim() || '';
      const sDose = dose.toLowerCase().trim();
      return vDose.includes(sDose) || sDose.includes(vDose) || vName.includes(sDose);
    });
  };

  const toggleIgnoreVaccine = (itemId: string) => {
    if (!activeChild) return;
    const currentIgnored = activeChild.ignoredVaccines || [];
    const isAlreadyIgnored = currentIgnored.includes(itemId);
    
    const nextIgnored = isAlreadyIgnored
      ? currentIgnored.filter(id => id !== itemId)
      : [...currentIgnored, itemId];
      
    updateChild(activeChild.id, {
      ignoredVaccines: nextIgnored
    });
  };

  const setPreferredFacilityType = (type: 'SUS' | 'PRIVATE' | 'BOTH') => {
    if (!activeChild) return;
    updateChild(activeChild.id, {
      preferredFacilityType: type
    });
  };

  return {
    activeChild,
    activeChildCycle,
    activeChildId,
    upcomingVaccines,
    historyVaccines,
    nextVaccine,
    otherUpcoming,
    isFormOpen,
    isManual,
    editingVaccine,
    scheduleItem,
    openEditModal,
    openCreateFromSchedule,
    openManualModal,
    closeForm,
    addVaccine,
    updateVaccine,
    deleteVaccine,
    isCompleted,
    toggleIgnoreVaccine,
    setPreferredFacilityType
  };
}
