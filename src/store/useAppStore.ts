import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Child, Measurement, Vaccine, ChildMilestone, Exam, LibraryArticle, Reminder, MilkLog, AppNotification, DailyTip, FoodLog } from '../types';

interface AppState {
  children: Child[];
  activeChildId: string | null;
  measurements: Measurement[];
  vaccines: Vaccine[];
  childMilestones: ChildMilestone[];
  exams: Exam[];
  libraryArticles: LibraryArticle[];
  reminders: Reminder[];
  milkLogs: MilkLog[];
  foodLogs: FoodLog[];
  foodChecklist: Record<string, { acceptsPieces: boolean; usesPincer: boolean; takesToMouth: boolean; chewsWell: boolean; }>;
  notifications: AppNotification[];
  dailyTips: DailyTip[];
  aiChatHistory: Record<string, { id: string; text: string; sender: 'user' | 'ai'; timestamp: string; }[]>;
  
  // Modals / UI State per screen
  ui: {
    dashboard: {
      isAddModalOpen: boolean;
    };
    growth: {
      activeTab: 'weight' | 'height' | 'imc' | 'head';
      isAddMeasurementOpen: boolean;
      editingMeasurementId: string | null;
    };
    milestones: {
      selectedPeriod: number;
    };
    exams: {
      isAddModalOpen: boolean;
    };
    notifications: {
      isOpen: boolean;
    };
  };

  // Actions
  addChild: (child: Child) => void;
  updateChild: (id: string, child: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  setActiveChild: (id: string) => void;
  addMeasurement: (measurement: Measurement) => void;
  updateMeasurement: (id: string, measurement: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
  addVaccine: (vaccine: Vaccine) => void;
  updateVaccine: (id: string, vaccine: Partial<Vaccine>) => void;
  deleteVaccine: (id: string) => void;
  addExam: (exam: Exam) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleAddExam: (open: boolean) => void;
  addReminder: (reminder: Reminder) => void;
  addMilkLog: (log: MilkLog) => void;
  deleteMilkLog: (id: string) => void;
  addFoodLog: (log: FoodLog) => void;
  deleteFoodLog: (id: string) => void;
  updateFoodLog: (id: string, log: Partial<FoodLog>) => void;
  updateFoodChecklist: (childId: string, checklist: Partial<{ acceptsPieces: boolean; usesPincer: boolean; takesToMouth: boolean; chewsWell: boolean; }>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  setGrowthTab: (tab: AppState['ui']['growth']['activeTab']) => void;
  toggleAddMeasurement: (open: boolean) => void;
  setEditingMeasurement: (id: string | null) => void;
  toggleMilestone: (childId: string, milestoneItemId: string) => void;
  setSelectedPeriod: (period: number) => void;
  markNotificationAsRead: (id: string) => void;
  toggleNotifications: (open: boolean) => void;
  addVaccinesBatch: (vaccines: Vaccine[]) => void;
  addAiMessage: (childId: string, message: { id: string; text: string; sender: 'user' | 'ai'; timestamp: string; }) => void;
  reset: () => void;
}

// Storage abstraction for later Supabase migration
const storageWrapper = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => localStorage.setItem(name, value),
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      children: [
        { 
          id: 'theo-id', 
          name: 'Theo', 
          birthDate: '2025-10-01', 
          gender: 'male', 
          birthWeight: 3500, 
          birthHeight: 50, 
          photoUrl: 'https://img.freepik.com/fotos-gratis/menino-sorridente-retrato-do-rosto-de-perto_53876-153276.jpg' 
        },
        { 
          id: 'alice-id', 
          name: 'Alice', 
          birthDate: '2025-09-15', 
          gender: 'female', 
          birthWeight: 3200, 
          birthHeight: 49, 
          photoUrl: 'https://f.i.uol.com.br/fotografia/2017/12/12/15131107815a303cfd361af_1513110781_1x1_md.jpg' 
        },
      ],
      activeChildId: 'theo-id',
      measurements: [
        { id: '1', childId: 'theo-id', date: '2025-10-01', weight: 3.5, height: 50, isBirth: true, imc: 14.0 },
        { id: '2', childId: 'theo-id', date: '2026-04-15', weight: 8.4, height: 71, imc: 16.7 },
        { id: 'a1', childId: 'alice-id', date: '2025-09-15', weight: 3.2, height: 49, isBirth: true, imc: 13.3 },
        { id: 'a2', childId: 'alice-id', date: '2026-04-10', weight: 7.8, height: 69, imc: 16.4 },
      ],
      vaccines: [
        { 
          id: 'v1', 
          childId: 'theo-id', 
          name: 'Pentavalente', 
          dose: 'Reforço',
          date: '2026-04-20', 
          status: 'pending' 
        },
        { 
          id: 'v2', 
          childId: 'alice-id', 
          name: 'Meningocócica ACWY', 
          date: '2026-05-15', 
          status: 'pending' 
        },
        { 
          id: 'v3', 
          childId: 'theo-id', 
          name: 'BCG', 
          date: '2024-08-12', 
          status: 'completed' 
        },
      ],
      childMilestones: [
        { id: 'cm1', childId: 'theo-id', milestoneItemId: '6m-1', completed: true },
        { id: 'cm2', childId: 'theo-id', milestoneItemId: '6m-2', completed: true },
        { id: 'cm3', childId: 'theo-id', milestoneItemId: '6m-3', completed: true },
      ],
      exams: [
        { 
          id: 'e1', 
          childId: 'theo-id', 
          name: 'Hemograma Completo', 
          category: 'laboratoriais', 
          date: '2023-10-12', 
          status: 'completed',
          laboratory: 'LABORATÓRIO SÃO LUCAS',
          patientName: 'THEO SILVA',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: 'pdf'
        },
        { 
          id: 'e2', 
          childId: 'theo-id', 
          name: 'Vitamina D (25-OH)', 
          category: 'laboratoriais', 
          date: '2023-10-05', 
          status: 'analyzing',
          laboratory: 'CENTRO DE DIAGNÓSTICO',
          resultDate: '2023-10-20'
        },
        { 
          id: 'e3', 
          childId: 'theo-id', 
          name: 'Raio-X de Tórax', 
          category: 'imagens', 
          date: '2023-09-28', 
          status: 'completed',
          laboratory: 'HOSPITAL INFANTIL',
          fileUrl: 'https://picsum.photos/seed/xray/600/800',
          fileType: 'image'
        }
      ],
      libraryArticles: [
        {
          id: 'a1',
          title: 'Cuidados com a Febre: Guia Rápido',
          summary: 'Saiba quando medicar e os sinais de alerta que exigem atenção médica imediata.',
          category: 'febre',
          content: '### O que é a febre?\nA febre é um sinal de que o corpo está lutando contra uma infecção. Não é uma doença em si, mas um sintoma.\n\n### Quando medicar?\n- Temperatura acima de **37.8°C**.\n- Se a criança estiver muito prostrada ou irritada.\n- Sempre siga a orientação do seu pediatra quanto à dosagem.\n\n### Sinais de Alerta (Vá ao Pronto Socorro):\n1. Febre em bebês menores de 3 meses.\n2. Dificuldade para respirar.\n3. Manchas vermelhas na pele.\n4. Pescoço rígido.',
          imageUrl: 'https://picsum.photos/seed/fever/800/600',
          authoritativeSources: ['SBP', 'SBIm'],
          isFeatured: true
        },
        {
          id: 'a2',
          title: 'Guia de Lavagem Nasal',
          summary: 'Passo a passo seguro para higienização nasal em bebês e crianças.',
          category: 'lavagem_nasal',
          content: '### Por que fazer?\nManter as vias aéreas limpas reduz riscos de otite, sinusite e melhora o sono e a alimentação.\n\n### Passo a passo:\n1. Utilize **soro fisiológico** em temperatura ambiente ou levemente morno.\n2. Posicione a criança sentada ou levemente inclinada para frente.\n3. Aplique com seringa ou frasco apropriado sem pressão excessiva.\n\n### Dica de Ouro:\nInicie sempre pelo lado que parece mais "limpo" para facilitar o fluxo.',
          imageUrl: 'https://picsum.photos/seed/nose/800/600',
          authoritativeSources: ['SBP']
        },
        {
          id: 'a3',
          title: 'Introdução Alimentar',
          summary: 'Primeiras papinhas e método BLW: como começar com segurança.',
          category: 'alimentacao',
          content: '### Quando começar?\nAos **6 meses**, quando o bebê apresenta sinais de prontidão (sentar sem apoio, interesse por comida, perda do reflexo de extrusão).\n\n### O que oferecer?\n- Legumes, frutas, cereais, tubérculos, ovos e carnes.\n- Evite açúcar, mel e sal até os 2 anos.\n\n### Métodos:\n- **Tradicional:** Papinhas oferecidas na colher.\n- **BLW:** Pedaços inteiros para o bebê pegar sozinho.',
          imageUrl: 'https://sacadademae.com.br/wp-content/uploads/2018/06/shutterstock_430230868.jpg',
          authoritativeSources: ['SBP', 'OMS']
        },
        {
          id: 'a4',
          title: 'Sono e Higiene do Sono',
          summary: 'Dicas práticas para estabelecer uma rotina saudável e melhorar as noites da família.',
          category: 'sono',
          content: '### A importância do sono\nO sono é fundamental para o desenvolvimento cerebral e crescimento físico (liberação do GH).\n\n### Higiene do Sono:\n- **Ambiente:** Escuro, silencioso e com temperatura agradável.\n- **Rotina:** Atividades calmas antes de dormir (banho morno, massagem, leitura).\n- **Horários:** Tente manter uma constância nos horários de sonecas e sono noturno.\n\n### Dica:\nEvite telas (TV, Celular) pelo menos 1 hora antes do sono.',
          imageUrl: 'https://picsum.photos/seed/sleep/800/600',
          authoritativeSources: ['SBP']
        }
      ],
      reminders: [
        { id: 'rem-vaccine', type: 'vaccine', title: 'Lembrete de Vacina', description: 'Alerta com 7 dias de antecedência', time: '08:00', frequency: 'once', enabled: true },
      ],
      milkLogs: [],
      foodLogs: [],
      foodChecklist: {},
      notifications: [
        { id: 'n1', title: 'Vacina Pendente', message: 'Theo tem o reforço de Pentavalente agendado para o dia 20/04.', date: '2026-04-20', isRead: false, type: 'vaccine' },
        { id: 'n2', title: 'Vacina para Alice', message: 'Alice tem Meningocócica ACWY agendada para 15/05.', date: '2026-04-22', isRead: false, type: 'vaccine' },
        { id: 'n3', title: 'Exame Pronto!', message: 'O resultado do Hemograma do Theo já está disponível na central.', date: '2026-04-24', isRead: false, type: 'exam' },
        { id: 'n4', title: 'Dica do Dia', message: 'A introdução alimentar deve ser feita com paciência. Confira novas receitas!', date: '2026-04-24', isRead: true, type: 'tip' },
      ],
      aiChatHistory: {},
      dailyTips: [
        { id: 't1', title: 'Introdução Alimentar: Por onde começar?', description: 'Aos 6 meses, o bebê apresenta sinais de prontidão. Comece com frutas e legumes amassados.', imageUrl: 'https://sacadademae.com.br/wp-content/uploads/2018/06/shutterstock_430230868.jpg', category: 'Alimentação' },
        { id: 't2', title: 'Higiene do Sono', description: 'Um ambiente escuro e silencioso ajuda na liberação de melatonina para o bebê.', imageUrl: 'https://images.unsplash.com/photo-1520206159849-c9bc683e2101?auto=format&fit=crop&q=80&w=800', category: 'Sono' },
        { id: 't3', title: 'Segurança no Banho', description: 'Mantenha sempre uma mão no bebê e verifique a temperatura da água com o cotovelo.', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800', category: 'Segurança' },
      ],
      ui: {
        dashboard: {
          isAddModalOpen: false,
        },
        growth: {
          activeTab: 'weight',
          isAddMeasurementOpen: false,
          editingMeasurementId: null,
        },
        milestones: {
          selectedPeriod: 6,
        },
        exams: {
          isAddModalOpen: false,
        },
        notifications: {
          isOpen: false,
        },
      },

      addChild: (child) => set((state) => {
        const newMeasurements = [...state.measurements];
        if (child.birthWeight || child.birthHeight) {
          const birthWeightKg = child.birthWeight ? child.birthWeight / 1000 : undefined;
          newMeasurements.push({
            id: crypto.randomUUID(),
            childId: child.id,
            date: child.birthDate,
            weight: birthWeightKg,
            height: child.birthHeight,
            headCircumference: undefined,
            isBirth: true,
            imc: (birthWeightKg && child.birthHeight) ? parseFloat((birthWeightKg / ((child.birthHeight / 100) * (child.birthHeight / 100))).toFixed(1)) : undefined
          });
        }
        return { 
          children: [...state.children, child],
          measurements: newMeasurements
        };
      }),
      updateChild: (id, c) => set((state) => {
        const childBefore = state.children.find(child => child.id === id);
        const newChildren = state.children.map((item) => item.id === id ? { ...item, ...c } : item);
        const updatedChild = newChildren.find(child => child.id === id);
        
        if (!updatedChild) return { children: state.children };

        let newMeasurements = [...state.measurements];
        
        // Find if we have a birth measurement
        let birthMeasurementIndex = newMeasurements.findIndex(m => m.childId === id && m.isBirth);
        
        // Fallback for older data: find measurement on birth date
        if (birthMeasurementIndex === -1 && childBefore) {
          birthMeasurementIndex = newMeasurements.findIndex(m => m.childId === id && m.date === childBefore.birthDate);
        }

        if (birthMeasurementIndex !== -1) {
          // Update existing
          const m = newMeasurements[birthMeasurementIndex];
          const updatedWeightGrams = updatedChild.birthWeight;
          const updatedWeightKg = updatedWeightGrams ? updatedWeightGrams / 1000 : undefined;
          const updatedHeight = updatedChild.birthHeight;
          const updatedDate = updatedChild.birthDate;
          
          newMeasurements[birthMeasurementIndex] = {
            ...m,
            isBirth: true, // Auto-repair the flag
            weight: updatedWeightKg,
            height: updatedHeight,
            date: updatedDate,
            imc: (updatedWeightKg && updatedHeight) ? parseFloat((updatedWeightKg / ((updatedHeight / 100) * (updatedHeight / 100))).toFixed(1)) : undefined
          };
        } else if (updatedChild.birthWeight || updatedChild.birthHeight) {
          // Create if missing
          const birthWeightKg = updatedChild.birthWeight ? updatedChild.birthWeight / 1000 : undefined;
          newMeasurements.push({
            id: crypto.randomUUID(),
            childId: id,
            date: updatedChild.birthDate,
            weight: birthWeightKg,
            height: updatedChild.birthHeight,
            isBirth: true,
            imc: (birthWeightKg && updatedChild.birthHeight) ? parseFloat((birthWeightKg / ((updatedChild.birthHeight / 100) * (updatedChild.birthHeight / 100))).toFixed(1)) : undefined
          });
        }

        return {
          children: newChildren,
          measurements: newMeasurements
        };
      }),
      deleteChild: (id) => set((state) => ({
        children: state.children.filter((item) => item.id !== id),
        activeChildId: state.activeChildId === id ? (state.children.length > 1 ? state.children.find(c => c.id !== id)?.id || null : null) : state.activeChildId
      })),
      setActiveChild: (id) => set({ activeChildId: id }),
      addMeasurement: (m) => set((state) => ({ measurements: [...state.measurements, m] })),
      updateMeasurement: (id, m) => set((state) => ({
        measurements: state.measurements.map((item) => item.id === id ? { ...item, ...m } : item)
      })),
      deleteMeasurement: (id) => set((state) => ({
        measurements: state.measurements.filter((item) => item.id !== id)
      })),
      setGrowthTab: (tab) => set((state) => ({ ui: { ...state.ui, growth: { ...state.ui.growth, activeTab: tab } } })),
      toggleAddMeasurement: (open) => set((state) => ({ ui: { ...state.ui, growth: { ...state.ui.growth, isAddMeasurementOpen: open } } })),
      setEditingMeasurement: (id) => set((state) => ({ ui: { ...state.ui, growth: { ...state.ui.growth, editingMeasurementId: id } } })),
      addVaccine: (v) => set((state) => ({ vaccines: [...state.vaccines, v] })),
      updateVaccine: (id, v) => set((state) => ({
        vaccines: state.vaccines.map((item) => item.id === id ? { ...item, ...v } : item)
      })),
      deleteVaccine: (id) => set((state) => ({
        vaccines: state.vaccines.filter((item) => item.id !== id)
      })),
      addExam: (e) => set((state) => ({ exams: [...state.exams, e] })),
      updateExam: (id, e) => set((state) => ({
        exams: state.exams.map((item) => item.id === id ? { ...item, ...e } : item)
      })),
      deleteExam: (id) => set((state) => ({
        exams: state.exams.filter((item) => item.id !== id)
      })),
      toggleAddExam: (open) => set((state) => ({ ui: { ...state.ui, exams: { isAddModalOpen: open } } })),
      addReminder: (reminder) => set((state) => ({ reminders: [reminder, ...state.reminders] })),
      addMilkLog: (log) => set((state) => ({ milkLogs: [log, ...state.milkLogs] })),
      deleteMilkLog: (id) => set((state) => ({
        milkLogs: state.milkLogs.filter((item) => item.id !== id)
      })),
      addFoodLog: (log) => set((state) => ({ foodLogs: [log, ...state.foodLogs] })),
      deleteFoodLog: (id) => set((state) => ({
        foodLogs: state.foodLogs.filter((item) => item.id !== id)
      })),
      updateFoodLog: (id, updatedLog) => set((state) => ({
        foodLogs: state.foodLogs.map((item) => item.id === id ? { ...item, ...updatedLog } : item)
      })),
      updateFoodChecklist: (childId, checklist) => set((state) => ({
        foodChecklist: {
          ...state.foodChecklist,
          [childId]: {
            acceptsPieces: false,
            usesPincer: false,
            takesToMouth: false,
            chewsWell: false,
            ...(state.foodChecklist[childId] || {}),
            ...checklist,
          }
        }
      })),
      updateReminder: (id, r) => set((state) => ({
        reminders: state.reminders.map((item) => item.id === id ? { ...item, ...r } : item)
      })),
      deleteReminder: (id) => set((state) => ({
        reminders: state.reminders.filter((item) => item.id !== id)
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
      })),
      toggleNotifications: (open) => set((state) => ({
        ui: { ...state.ui, notifications: { isOpen: open } }
      })),
      addVaccinesBatch: (newVaccines) => set((state) => ({
        vaccines: [...state.vaccines, ...newVaccines]
      })),
      addAiMessage: (childId, message) => set((state) => ({
        aiChatHistory: {
          ...state.aiChatHistory,
          [childId]: [...(state.aiChatHistory[childId] || []), message]
        }
      })),
      toggleMilestone: (childId, milestoneItemId) => set((state) => {
        const existing = state.childMilestones.find(cm => cm.childId === childId && cm.milestoneItemId === milestoneItemId);
        if (existing) {
          return {
            childMilestones: state.childMilestones.map(cm => 
              cm.id === existing.id ? { ...cm, completed: !cm.completed } : cm
            )
          };
        } else {
          return {
            childMilestones: [
              ...state.childMilestones,
              { id: crypto.randomUUID(), childId, milestoneItemId, completed: true }
            ]
          };
        }
      }),
      setSelectedPeriod: (period) => set((state) => ({
        ui: { ...state.ui, milestones: { ...state.ui.milestones, selectedPeriod: period } }
      })),
      reset: () => set({
        children: [],
        activeChildId: null,
        measurements: [],
        vaccines: [],
        childMilestones: [],
        exams: [],
        reminders: [],
        milkLogs: [],
        foodLogs: [],
        foodChecklist: {},
        aiChatHistory: {},
        notifications: [],
      }),
    }),
    {
      name: 'rotinaped-storage-v12', // Bump version 
      storage: createJSONStorage(() => storageWrapper),
    }
  )
);
