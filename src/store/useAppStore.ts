import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Child, Measurement, Vaccine, ChildMilestone, Exam, LibraryCategory, LibraryArticle, Reminder, MilkLog, AppNotification, DailyTip, FoodLog } from '../types';

// MAPPER FUNCTIONS: SNAKE_CASE (POSTGRES) TO CAMELCASE (TYPESCRIPT)

const mapDbToChild = (db: any): Child => ({
  id: db.id,
  name: db.name,
  birthDate: db.birth_date,
  photoUrl: db.photo_url || undefined,
  gender: db.gender,
  profileType: db.profile_type || undefined,
  deliveryType: db.delivery_type || undefined,
  gestationalWeeks: db.gestational_weeks || undefined,
  gestationalDays: db.gestational_days || undefined,
  birthWeight: db.birth_weight ? Number(db.birth_weight) : undefined,
  birthHeight: db.birth_height ? Number(db.birth_height) : undefined,
  apgar1min: db.apgar_1min || undefined,
  apgar5min: db.apgar_5min || undefined,
  feedingType: db.feeding_type || undefined,
  allergies: db.allergies || undefined,
  observations: db.observations || undefined,
  pediatricianName: db.pediatrician_name || undefined,
  pediatricianPhone: db.pediatrician_phone || undefined,
  bloodType: db.blood_type || undefined,
  documentId: db.document_id || undefined,
  preferredFacilityType: db.preferred_facility_type || undefined,
  ignoredVaccines: db.ignored_vaccines || [],
});

const mapChildToDb = (ts: Partial<Child>, userId: string) => ({
  user_id: userId,
  name: ts.name,
  birth_date: ts.birthDate,
  photo_url: ts.photoUrl,
  gender: ts.gender,
  profile_type: ts.profileType,
  delivery_type: ts.deliveryType,
  gestational_weeks: ts.gestationalWeeks,
  gestational_days: ts.gestationalDays,
  birth_weight: ts.birthWeight,
  birth_height: ts.birthHeight,
  apgar_1min: ts.apgar1min,
  apgar_5min: ts.apgar5min,
  feeding_type: ts.feedingType,
  allergies: ts.allergies,
  observations: ts.observations,
  pediatrician_name: ts.pediatricianName,
  pediatrician_phone: ts.pediatricianPhone,
  blood_type: ts.bloodType,
  document_id: ts.documentId,
  preferred_facility_type: ts.preferredFacilityType,
  ignored_vaccines: ts.ignoredVaccines,
});

const mapDbToMeasurement = (db: any): Measurement => ({
  id: db.id,
  childId: db.child_id,
  date: db.date,
  weight: db.weight ? Number(db.weight) : undefined,
  height: db.height ? Number(db.height) : undefined,
  imc: db.imc ? Number(db.imc) : undefined,
  headCircumference: db.head_circumference ? Number(db.head_circumference) : undefined,
  bloodPressure: db.blood_pressure || undefined,
  isBirth: db.is_birth || false,
});

const mapMeasurementToDb = (ts: Partial<Measurement>, userId: string) => ({
  user_id: userId,
  child_id: ts.childId,
  date: ts.date,
  weight: ts.weight,
  height: ts.height,
  imc: ts.imc,
  head_circumference: ts.headCircumference,
  blood_pressure: ts.bloodPressure,
  is_birth: ts.isBirth,
});

const mapDbToVaccine = (db: any): Vaccine => ({
  id: db.id,
  childId: db.child_id,
  name: db.name,
  dose: db.dose || undefined,
  date: db.date,
  status: db.status as 'pending' | 'completed',
  lotNumber: db.lot_number || undefined,
  location: db.location || undefined,
  photoUrl: db.photo_url || undefined,
  description: db.description || undefined,
  facilityType: db.facility_type as 'SUS' | 'PRIVATE' | undefined,
});

const mapVaccineToDb = (ts: Partial<Vaccine>, userId: string) => ({
  user_id: userId,
  child_id: ts.childId,
  name: ts.name,
  dose: ts.dose,
  date: ts.date,
  status: ts.status,
  lot_number: ts.lotNumber,
  location: ts.location,
  photo_url: ts.photoUrl,
  description: ts.description,
  facility_type: ts.facilityType,
});

const mapDbToMilestone = (db: any): ChildMilestone => ({
  id: db.id,
  childId: db.child_id,
  milestoneItemId: db.milestone_item_id,
  completed: db.completed || false,
  completionDate: db.completion_date || undefined,
});

const mapMilestoneToDb = (ts: Partial<ChildMilestone>, userId: string) => ({
  user_id: userId,
  child_id: ts.childId,
  milestone_item_id: ts.milestoneItemId,
  completed: ts.completed,
  completion_date: ts.completionDate,
});

const mapDbToReminder = (db: any): Reminder => ({
  id: db.id,
  type: db.type as 'vitamin_d' | 'ferro' | 'appointment' | 'vaccine' | 'medication',
  title: db.title,
  description: db.description || '',
  date: db.date || undefined,
  time: db.time,
  frequency: db.frequency as 'daily' | 'weekly' | 'custom' | 'once',
  enabled: db.enabled || false,
});

const mapReminderToDb = (ts: Partial<Reminder>, userId: string) => ({
  user_id: userId,
  type: ts.type,
  title: ts.title,
  description: ts.description,
  date: ts.date,
  time: ts.time,
  frequency: ts.frequency,
  enabled: ts.enabled,
});

const mapDbToMilkLog = (db: any): MilkLog => ({
  id: db.id,
  childId: db.child_id,
  date: db.date,
  type: db.type as 'breast' | 'bottle',
  side: db.side as 'left' | 'right' | 'both' | undefined,
  amount: db.amount ? Number(db.amount) : undefined,
  duration: db.duration ? Number(db.duration) : undefined,
  startTime: db.start_time,
});

const mapMilkLogToDb = (ts: Partial<MilkLog>, userId: string) => ({
  user_id: userId,
  child_id: ts.childId,
  date: ts.date,
  type: ts.type,
  side: ts.side,
  amount: ts.amount,
  duration: ts.duration,
  start_time: ts.startTime,
});

const mapDbToExam = (db: any): Exam => ({
  id: db.id,
  childId: db.child_id,
  name: db.name,
  category: db.category as 'laboratoriais' | 'infecciosos' | 'imagens' | 'respiratorios' | 'triagens',
  date: db.date,
  status: db.status as 'pending' | 'completed' | 'analyzing',
  laboratory: db.laboratory || undefined,
  patientName: db.patient_name || undefined,
  fileUrl: db.file_url || undefined,
  fileType: db.file_type as 'pdf' | 'image' | undefined,
  resultDate: db.result_date || undefined,
});

const mapExamToDb = (ts: Partial<Exam>, userId: string) => ({
  user_id: userId,
  child_id: ts.childId,
  name: ts.name,
  category: ts.category,
  date: ts.date,
  status: ts.status,
  laboratory: ts.laboratory,
  patient_name: ts.patientName,
  file_url: ts.fileUrl,
  file_type: ts.fileType,
  result_date: ts.resultDate,
});

const mapDbToFoodLog = (db: any): FoodLog => ({
  id: db.id,
  childId: db.child_id,
  date: db.date,
  time: db.time,
  type: db.type as 'breast' | 'bottle' | 'baby_food' | 'solid',
  amount: db.amount || '',
  acceptance: db.acceptance as 'good' | 'medium' | 'refused',
  carb: db.carb || false,
  protein: db.protein || false,
  legume: db.legume || false,
  vegetables: db.vegetables || false,
  fruit: db.fruit || false,
  fat: db.fat || false,
  meat: db.meat || false,
  beans: db.beans || false,
  egg: db.egg || false,
  hasVitaminC: db.has_vitamin_c || false,
  ultraprocessedCount: (db.ultraprocessed_count || 0) as 0 | 1 | 2,
  milkVolume: db.milk_volume ? Number(db.milk_volume) : 0,
  autonomy: db.autonomy || false,
  atTable: db.at_table || false,
  noScreens: db.no_screens || false,
});

const mapFoodLogToDb = (ts: Partial<FoodLog>, userId: string) => ({
  user_id: userId,
  child_id: ts.childId,
  date: ts.date,
  time: ts.time,
  type: ts.type,
  amount: ts.amount,
  acceptance: ts.acceptance,
  carb: ts.carb,
  protein: ts.protein,
  legume: ts.legume,
  vegetables: ts.vegetables,
  fruit: ts.fruit,
  fat: ts.fat,
  meat: ts.meat,
  beans: ts.beans,
  egg: ts.egg,
  has_not_vitamin_c: ts.hasVitaminC,
  ultraprocessed_count: ts.ultraprocessedCount,
  milk_volume: ts.milkVolume,
  autonomy: ts.autonomy,
  at_table: ts.atTable,
  no_screens: ts.noScreens,
});

const mapDbToNotification = (db: any): AppNotification => ({
  id: db.id,
  title: db.title,
  message: db.message,
  date: db.created_at,
  isRead: db.is_read,
  type: db.type as 'vaccine' | 'exam' | 'reminder' | 'tip',
});

const mapNotificationToDb = (ts: Partial<AppNotification>, userId: string) => ({
  user_id: userId,
  title: ts.title,
  message: ts.message,
  type: ts.type || 'tip',
  is_read: ts.isRead || false,
});

const mapDbToCategory = (db: any): LibraryCategory => ({
  id: db.id,
  name: db.name,
  icon: db.icon,
  color: db.color || 'blue',
  created_at: db.created_at,
});

const mapDbToArticle = (db: any, categories: LibraryCategory[]): LibraryArticle => {
  const categoryObj = categories.find(c => c.id === db.category_id);
  return {
    id: db.id,
    title: db.title,
    summary: db.summary,
    category: categoryObj || db.category_id || '',
    categoryId: db.category_id,
    content: db.content,
    imageUrl: db.image_url || undefined,
    authoritativeSources: db.authoritative_sources || [],
    isFeatured: db.is_featured || false,
    createdAt: db.created_at,
  };
};

interface AppState {
  simulatedUserId: string | null;
  simulatedUserEmail: string | null;
  setSimulatedUser: (id: string | null, email: string | null) => Promise<void>;
  children: Child[];
  activeChildId: string | null;
  measurements: Measurement[];
  vaccines: Vaccine[];
  childMilestones: ChildMilestone[];
  exams: Exam[];
  libraryCategories: LibraryCategory[];
  libraryArticles: LibraryArticle[];
  reminders: Reminder[];
  milkLogs: MilkLog[];
  foodLogs: FoodLog[];
  foodChecklist: Record<string, { acceptsPieces: boolean; usesPincer: boolean; takesToMouth: boolean; chewsWell: boolean; }>;
  notifications: AppNotification[];
  dailyTips: DailyTip[];
  aiChatHistory: Record<string, { id: string; text: string; sender: 'user' | 'ai'; timestamp: string; }[]>;
  hasLoadedData: boolean;
  
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
  loadAllData: () => Promise<void>;
  addChild: (child: Child) => Promise<void>;
  updateChild: (id: string, child: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  setActiveChild: (id: string) => void;
  addMeasurement: (measurement: Measurement) => Promise<void>;
  updateMeasurement: (id: string, measurement: Partial<Measurement>) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  addVaccine: (vaccine: Vaccine) => Promise<void>;
  updateVaccine: (id: string, vaccine: Partial<Vaccine>) => Promise<void>;
  deleteVaccine: (id: string) => Promise<void>;
  addExam: (exam: Exam) => Promise<void>;
  updateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  toggleAddExam: (open: boolean) => void;
  addReminder: (reminder: Reminder) => Promise<void>;
  addMilkLog: (log: MilkLog) => Promise<void>;
  deleteMilkLog: (id: string) => Promise<void>;
  addFoodLog: (log: FoodLog) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
  updateFoodLog: (id: string, log: Partial<FoodLog>) => Promise<void>;
  updateFoodChecklist: (childId: string, checklist: Partial<{ acceptsPieces: boolean; usesPincer: boolean; takesToMouth: boolean; chewsWell: boolean; }>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  setGrowthTab: (tab: AppState['ui']['growth']['activeTab']) => void;
  toggleAddMeasurement: (open: boolean) => void;
  setEditingMeasurement: (id: string | null) => void;
  toggleMilestone: (childId: string, milestoneItemId: string) => Promise<void>;
  setSelectedPeriod: (period: number) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notification: Partial<AppNotification>, userId: string) => Promise<void>;
  toggleNotifications: (open: boolean) => void;
  addVaccinesBatch: (vaccines: Vaccine[]) => Promise<void>;
  addAiMessage: (childId: string, message: { id: string; text: string; sender: 'user' | 'ai'; timestamp: string; }) => void;
  reset: () => void;
}

// Storage wrapper for Zustand
const storageWrapper = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => localStorage.setItem(name, value),
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      simulatedUserId: null,
      simulatedUserEmail: null,
      children: [],
      activeChildId: null,
      measurements: [],
      vaccines: [],
      childMilestones: [],
      exams: [],
      libraryCategories: [],
      libraryArticles: [],
      reminders: [],
      milkLogs: [],
      foodLogs: [],
      foodChecklist: {},
      aiChatHistory: {},
      hasLoadedData: false,
      notifications: [],
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

      setSimulatedUser: async (id, email) => {
        set({ simulatedUserId: id, simulatedUserEmail: email, activeChildId: null });
        await get().loadAllData();
      },

      loadAllData: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const targetUserId = get().simulatedUserId || session.user.id;

          let childrenQuery = supabase.from('children').select('*').order('created_at', { ascending: true });
          let measurementsQuery = supabase.from('measurements').select('*').order('date', { ascending: true });
          let vaccinesQuery = supabase.from('vaccines').select('*').order('date', { ascending: true });
          let milestonesQuery = supabase.from('child_milestones').select('*');
          let remindersQuery = supabase.from('reminders').select('*').order('created_at', { ascending: false });
          let milkLogsQuery = supabase.from('milk_logs').select('*').order('date', { ascending: false });
          let foodLogsQuery = supabase.from('food_logs').select('*').order('date', { ascending: false });
          let examsQuery = supabase.from('exams').select('*').order('date', { ascending: false });
          let notificationsQuery = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
          let categoriesQuery = supabase.from('library_categories').select('*').order('name', { ascending: true });
          let articlesQuery = supabase.from('library_articles').select('*').order('created_at', { ascending: false });

          if (targetUserId) {
            childrenQuery = childrenQuery.eq('user_id', targetUserId);
            measurementsQuery = measurementsQuery.eq('user_id', targetUserId);
            vaccinesQuery = vaccinesQuery.eq('user_id', targetUserId);
            milestonesQuery = milestonesQuery.eq('user_id', targetUserId);
            remindersQuery = remindersQuery.eq('user_id', targetUserId);
            milkLogsQuery = milkLogsQuery.eq('user_id', targetUserId);
            foodLogsQuery = foodLogsQuery.eq('user_id', targetUserId);
            examsQuery = examsQuery.eq('user_id', targetUserId);
            notificationsQuery = notificationsQuery.eq('user_id', targetUserId);
          }

          // Parallel query execution
          const [
            childrenRes,
            measurementsRes,
            vaccinesRes,
            milestonesRes,
            remindersRes,
            milkLogsRes,
            foodLogsRes,
            examsRes,
            notificationsRes,
            categoriesRes,
            articlesRes
          ] = await Promise.all([
            childrenQuery,
            measurementsQuery,
            vaccinesQuery,
            milestonesQuery,
            remindersQuery,
            milkLogsQuery,
            foodLogsQuery,
            examsQuery,
            notificationsQuery,
            categoriesQuery,
            articlesQuery
          ]);

          if (childrenRes.error) throw childrenRes.error;

          const mappedChildren = (childrenRes.data || []).map(mapDbToChild);
          const mappedMeasurements = (measurementsRes.data || []).map(mapDbToMeasurement);
          const mappedVaccines = (vaccinesRes.data || []).map(mapDbToVaccine);
          const mappedMilestones = (milestonesRes.data || []).map(mapDbToMilestone);
          const mappedReminders = (remindersRes.data || []).map(mapDbToReminder);
          const mappedMilkLogs = (milkLogsRes.data || []).map(mapDbToMilkLog);
          const mappedFoodLogs = (foodLogsRes.data || []).map(mapDbToFoodLog);
          const mappedExams = (examsRes.data || []).map(mapDbToExam);
          const mappedNotifications = (notificationsRes.data || []).map(mapDbToNotification);
          const mappedCategories = (categoriesRes.data || []).map(mapDbToCategory);
          const mappedArticles = (articlesRes.data || []).map(db => mapDbToArticle(db, mappedCategories));

          // Populate the foodChecklist record from JSONB inside the children rows
          const foodChecklistRecord: Record<string, any> = {};
          (childrenRes.data || []).forEach((c: any) => {
            if (c.food_checklist) {
              foodChecklistRecord[c.id] = c.food_checklist;
            }
          });

          set({
            children: mappedChildren,
            measurements: mappedMeasurements,
            vaccines: mappedVaccines,
            childMilestones: mappedMilestones,
            reminders: mappedReminders,
            milkLogs: mappedMilkLogs,
            foodLogs: mappedFoodLogs,
            exams: mappedExams,
            notifications: mappedNotifications,
            libraryCategories: mappedCategories,
            libraryArticles: mappedArticles,
            foodChecklist: foodChecklistRecord,
            activeChildId: get().activeChildId || (mappedChildren.length > 0 ? mappedChildren[0].id : null),
            hasLoadedData: true
          });
        } catch (error) {
          console.error('[loadAllData] Error restoring user state from Supabase:', error);
          set({ hasLoadedData: true }); // even on error, we mark loading as done to unlock the app
        }
      },

      addChild: async (child) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const childId = child.id || crypto.randomUUID();
        const finalChild = { ...child, id: childId };

        // 1. Optimistic Update
        set((state) => ({
          children: [...state.children, finalChild],
          activeChildId: state.activeChildId ? state.activeChildId : childId
        }));

        // 2. Database Sync
        const dbChild = mapChildToDb(finalChild, userId);
        const { error } = await supabase.from('children').insert({ ...dbChild, id: childId });
        
        if (error) {
          console.error('Error adding child to Supabase:', error);
          // Rollback
          set((state) => ({
            children: state.children.filter(c => c.id !== childId),
            activeChildId: state.activeChildId === childId ? null : state.activeChildId
          }));
          return;
        }

        // Add Birth Measurement if requested
        if (child.birthWeight || child.birthHeight) {
          const birthWeightKg = child.birthWeight ? child.birthWeight / 1000 : undefined;
          const newM = {
            id: crypto.randomUUID(),
            childId: childId,
            date: child.birthDate,
            weight: birthWeightKg,
            height: child.birthHeight,
            headCircumference: undefined,
            isBirth: true,
            imc: (birthWeightKg && child.birthHeight) ? parseFloat((birthWeightKg / ((child.birthHeight / 100) * (child.birthHeight / 100))).toFixed(1)) : undefined
          };
          await get().addMeasurement(newM);
        }
      },

      updateChild: async (id, c) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousChildren = get().children;
        const childBefore = previousChildren.find(child => child.id === id);

        // 1. Optimistic Update
        set((state) => ({
          children: state.children.map((item) => item.id === id ? { ...item, ...c } : item)
        }));

        // 2. Database Sync
        const updatedChildObj = { ...childBefore, ...c } as Child;
        const dbChild = mapChildToDb(updatedChildObj, userId);
        const { error } = await supabase.from('children').update(dbChild).eq('id', id);

        if (error) {
          console.error('Error updating child in Supabase:', error);
          set({ children: previousChildren });
          return;
        }

        // Handle Birth Measurement Update
        const updatedChild = get().children.find(child => child.id === id);
        if (!updatedChild) return;

        let newMeasurements = [...get().measurements];
        let birthMeasurementIndex = newMeasurements.findIndex(m => m.childId === id && m.isBirth);
        if (birthMeasurementIndex === -1 && childBefore) {
          birthMeasurementIndex = newMeasurements.findIndex(m => m.childId === id && m.date === childBefore.birthDate);
        }

        if (birthMeasurementIndex !== -1) {
          const m = newMeasurements[birthMeasurementIndex];
          const updatedWeightGrams = updatedChild.birthWeight;
          const updatedWeightKg = updatedWeightGrams ? updatedWeightGrams / 1000 : undefined;
          const updatedHeight = updatedChild.birthHeight;
          const updatedDate = updatedChild.birthDate;

          const updatedM = {
            ...m,
            isBirth: true,
            weight: updatedWeightKg,
            height: updatedHeight,
            date: updatedDate,
            imc: (updatedWeightKg && updatedHeight) ? parseFloat((updatedWeightKg / ((updatedHeight / 100) * (updatedHeight / 100))).toFixed(1)) : undefined
          };
          await get().updateMeasurement(m.id, updatedM);
        } else if (updatedChild.birthWeight || updatedChild.birthHeight) {
          const birthWeightKg = updatedChild.birthWeight ? updatedChild.birthWeight / 1000 : undefined;
          const newM = {
            id: crypto.randomUUID(),
            childId: id,
            date: updatedChild.birthDate,
            weight: birthWeightKg,
            height: updatedChild.birthHeight,
            isBirth: true,
            imc: (birthWeightKg && updatedChild.birthHeight) ? parseFloat((birthWeightKg / ((updatedChild.birthHeight / 100) * (updatedChild.birthHeight / 100))).toFixed(1)) : undefined
          };
          await get().addMeasurement(newM);
        }
      },

      deleteChild: async (id) => {
        const previousChildren = get().children;
        const previousActive = get().activeChildId;

        // 1. Optimistic Update
        set((state) => ({
          children: state.children.filter((item) => item.id !== id),
          activeChildId: state.activeChildId === id ? (state.children.length > 1 ? state.children.find(c => c.id !== id)?.id || null : null) : state.activeChildId
        }));

        // 2. Database Sync
        const { error } = await supabase.from('children').delete().eq('id', id);
        if (error) {
          console.error('Error deleting child from Supabase:', error);
          set({ children: previousChildren, activeChildId: previousActive });
        }
      },

      setActiveChild: (id) => set({ activeChildId: id }),

      addMeasurement: async (m) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const measurementId = m.id || crypto.randomUUID();
        const finalMeasurement = { ...m, id: measurementId };

        // 1. Optimistic Update
        set((state) => ({ measurements: [...state.measurements, finalMeasurement] }));

        // 2. Database Sync
        const dbM = mapMeasurementToDb(finalMeasurement, userId);
        const { error } = await supabase.from('measurements').insert({ ...dbM, id: measurementId });
        
        if (error) {
          console.error('Error saving measurement to Supabase:', error);
          set((state) => ({ measurements: state.measurements.filter(item => item.id !== measurementId) }));
        }
      },

      updateMeasurement: async (id, m) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousMeasurements = get().measurements;
        const beforeObj = previousMeasurements.find(item => item.id === id);

        // 1. Optimistic Update
        set((state) => ({
          measurements: state.measurements.map((item) => item.id === id ? { ...item, ...m } : item)
        }));

        // 2. Database Sync
        const updatedM = { ...beforeObj, ...m } as Measurement;
        const dbM = mapMeasurementToDb(updatedM, userId);
        const { error } = await supabase.from('measurements').update(dbM).eq('id', id);

        if (error) {
          console.error('Error updating measurement in Supabase:', error);
          set({ measurements: previousMeasurements });
        }
      },

      deleteMeasurement: async (id) => {
        const previousMeasurements = get().measurements;

        // 1. Optimistic Update
        set((state) => ({
          measurements: state.measurements.filter((item) => item.id !== id)
        }));

        // 2. Database Sync
        const { error } = await supabase.from('measurements').delete().eq('id', id);
        if (error) {
          console.error('Error deleting measurement in Supabase:', error);
          set({ measurements: previousMeasurements });
        }
      },

      setGrowthTab: (tab) => set((state) => ({ ui: { ...state.ui, growth: { ...state.ui.growth, activeTab: tab } } })),
      toggleAddMeasurement: (open) => set((state) => ({ ui: { ...state.ui, growth: { ...state.ui.growth, isAddMeasurementOpen: open } } })),
      setEditingMeasurement: (id) => set((state) => ({ ui: { ...state.ui, growth: { ...state.ui.growth, editingMeasurementId: id } } })),

      addVaccine: async (v) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const vaccineId = v.id || crypto.randomUUID();
        const finalVaccine = { ...v, id: vaccineId };

        // 1. Optimistic Update
        set((state) => ({ vaccines: [...state.vaccines, finalVaccine] }));

        // 2. Database Sync
        const dbV = mapVaccineToDb(finalVaccine, userId);
        const { error } = await supabase.from('vaccines').insert({ ...dbV, id: vaccineId });
        
        if (error) {
          console.error('Error saving vaccine to Supabase:', error);
          set((state) => ({ vaccines: state.vaccines.filter(item => item.id !== vaccineId) }));
        }
      },

      updateVaccine: async (id, v) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousVaccines = get().vaccines;
        const beforeObj = previousVaccines.find(item => item.id === id);

        // 1. Optimistic Update
        set((state) => ({
          vaccines: state.vaccines.map((item) => item.id === id ? { ...item, ...v } : item)
        }));

        // 2. Database Sync
        const updatedV = { ...beforeObj, ...v } as Vaccine;
        const dbV = mapVaccineToDb(updatedV, userId);
        const { error } = await supabase.from('vaccines').update(dbV).eq('id', id);

        if (error) {
          console.error('Error updating vaccine in Supabase:', error);
          set({ vaccines: previousVaccines });
        }
      },

      deleteVaccine: async (id) => {
        const previousVaccines = get().vaccines;

        // 1. Optimistic Update
        set((state) => ({
          vaccines: state.vaccines.filter((item) => item.id !== id)
        }));

        // 2. Database Sync
        const { error } = await supabase.from('vaccines').delete().eq('id', id);
        if (error) {
          console.error('Error deleting vaccine in Supabase:', error);
          set({ vaccines: previousVaccines });
        }
      },

      addExam: async (e) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const examId = e.id || crypto.randomUUID();
        const finalExam = { ...e, id: examId };

        // 1. Optimistic Update
        set((state) => ({ exams: [...state.exams, finalExam] }));

        // 2. Database Sync
        const dbE = mapExamToDb(finalExam, userId);
        const { error } = await supabase.from('exams').insert({ ...dbE, id: examId });
        
        if (error) {
          console.error('Error saving exam to Supabase:', error);
          set((state) => ({ exams: state.exams.filter(item => item.id !== examId) }));
        }
      },

      updateExam: async (id, e) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousExams = get().exams;
        const beforeObj = previousExams.find(item => item.id === id);

        // 1. Optimistic Update
        set((state) => ({
          exams: state.exams.map((item) => item.id === id ? { ...item, ...e } : item)
        }));

        // 2. Database Sync
        const updatedE = { ...beforeObj, ...e } as Exam;
        const dbE = mapExamToDb(updatedE, userId);
        const { error } = await supabase.from('exams').update(dbE).eq('id', id);

        if (error) {
          console.error('Error updating exam in Supabase:', error);
          set({ exams: previousExams });
        }
      },

      deleteExam: async (id) => {
        const previousExams = get().exams;

        // 1. Optimistic Update
        set((state) => ({
          exams: state.exams.filter((item) => item.id !== id)
        }));

        // 2. Database Sync
        const { error } = await supabase.from('exams').delete().eq('id', id);
        if (error) {
          console.error('Error deleting exam in Supabase:', error);
          set({ exams: previousExams });
        }
      },

      toggleAddExam: (open) => set((state) => ({ ui: { ...state.ui, exams: { isAddModalOpen: open } } })),

      addReminder: async (reminder) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const reminderId = reminder.id || crypto.randomUUID();
        const finalReminder = { ...reminder, id: reminderId };

        // 1. Optimistic Update
        set((state) => ({ reminders: [finalReminder, ...state.reminders] }));

        // 2. Database Sync
        const dbR = mapReminderToDb(finalReminder, userId);
        const { error } = await supabase.from('reminders').insert({ ...dbR, id: reminderId });
        
        if (error) {
          console.error('Error saving reminder to Supabase:', error);
          set((state) => ({ reminders: state.reminders.filter(item => item.id !== reminderId) }));
        }
      },

      addMilkLog: async (log) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const logId = log.id || crypto.randomUUID();
        const finalLog = { ...log, id: logId };

        // 1. Optimistic Update
        set((state) => ({ milkLogs: [finalLog, ...state.milkLogs] }));

        // 2. Database Sync
        const dbLog = mapMilkLogToDb(finalLog, userId);
        const { error } = await supabase.from('milk_logs').insert({ ...dbLog, id: logId });
        
        if (error) {
          console.error('Error saving milk log to Supabase:', error);
          set((state) => ({ milkLogs: state.milkLogs.filter(item => item.id !== logId) }));
        }
      },

      deleteMilkLog: async (id) => {
        const previousMilkLogs = get().milkLogs;

        // 1. Optimistic Update
        set((state) => ({ milkLogs: state.milkLogs.filter((item) => item.id !== id) }));

        // 2. Database Sync
        const { error } = await supabase.from('milk_logs').delete().eq('id', id);
        if (error) {
          console.error('Error deleting milk log in Supabase:', error);
          set({ milkLogs: previousMilkLogs });
        }
      },

      addFoodLog: async (log) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;
        const logId = log.id || crypto.randomUUID();
        const finalLog = { ...log, id: logId };

        // 1. Optimistic Update
        set((state) => ({ foodLogs: [finalLog, ...state.foodLogs] }));

        // 2. Database Sync
        const dbLog = mapFoodLogToDb(finalLog, userId);
        const { error } = await supabase.from('food_logs').insert({ ...dbLog, id: logId });
        
        if (error) {
          console.error('Error saving food log to Supabase:', error);
          set((state) => ({ foodLogs: state.foodLogs.filter(item => item.id !== logId) }));
        }
      },

      deleteFoodLog: async (id) => {
        const previousFoodLogs = get().foodLogs;

        // 1. Optimistic Update
        set((state) => ({ foodLogs: state.foodLogs.filter((item) => item.id !== id) }));

        // 2. Database Sync
        const { error } = await supabase.from('food_logs').delete().eq('id', id);
        if (error) {
          console.error('Error deleting food log in Supabase:', error);
          set({ foodLogs: previousFoodLogs });
        }
      },

      updateFoodLog: async (id, updatedLog) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousFoodLogs = get().foodLogs;
        const beforeObj = previousFoodLogs.find(item => item.id === id);

        // 1. Optimistic Update
        set((state) => ({
          foodLogs: state.foodLogs.map((item) => item.id === id ? { ...item, ...updatedLog } : item)
        }));

        // 2. Database Sync
        const updatedLogObj = { ...beforeObj, ...updatedLog } as FoodLog;
        const dbLog = mapFoodLogToDb(updatedLogObj, userId);
        const { error } = await supabase.from('food_logs').update(dbLog).eq('id', id);

        if (error) {
          console.error('Error updating food log in Supabase:', error);
          set({ foodLogs: previousFoodLogs });
        }
      },

      updateFoodChecklist: async (childId, checklist) => {
        const previousChecklist = get().foodChecklist;
        const currentChecklist = previousChecklist[childId] || {
          acceptsPieces: false,
          usesPincer: false,
          takesToMouth: false,
          chewsWell: false,
        };

        const updatedChecklistObj = { ...currentChecklist, ...checklist };

        // 1. Optimistic Update
        set((state) => ({
          foodChecklist: {
            ...state.foodChecklist,
            [childId]: updatedChecklistObj
          }
        }));

        // 2. Database Sync (Stored as JSONB in children table)
        const { error } = await supabase
          .from('children')
          .update({ food_checklist: updatedChecklistObj })
          .eq('id', childId);

        if (error) {
          console.error('Error updating child food checklist in Supabase:', error);
          set({ foodChecklist: previousChecklist });
        }
      },

      updateReminder: async (id, r) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousReminders = get().reminders;
        const beforeObj = previousReminders.find(item => item.id === id);

        // 1. Optimistic Update
        set((state) => ({
          reminders: state.reminders.map((item) => item.id === id ? { ...item, ...r } : item)
        }));

        // 2. Database Sync
        const updatedR = { ...beforeObj, ...r } as Reminder;
        const dbR = mapReminderToDb(updatedR, userId);
        const { error } = await supabase.from('reminders').update(dbR).eq('id', id);

        if (error) {
          console.error('Error updating reminder in Supabase:', error);
          set({ reminders: previousReminders });
        }
      },

      deleteReminder: async (id) => {
        const previousReminders = get().reminders;

        // 1. Optimistic Update
        set((state) => ({ reminders: state.reminders.filter((item) => item.id !== id) }));

        // 2. Database Sync
        const { error } = await supabase.from('reminders').delete().eq('id', id);
        if (error) {
          console.error('Error deleting reminder in Supabase:', error);
          set({ reminders: previousReminders });
        }
      },

      markNotificationAsRead: async (id) => {
        // 1. Optimistic Update
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
        }));

        // 2. Database Sync
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);

        if (error) {
          console.error('Error marking notification as read in Supabase:', error);
        }
      },

      markAllNotificationsAsRead: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        // 1. Optimistic Update
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }));

        // 2. Database Sync
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (error) {
          console.error('Error marking all notifications as read in Supabase:', error);
        }
      },

      addNotification: async (notification, userId) => {
        const notificationId = crypto.randomUUID();
        const finalNotification = {
          ...notification,
          id: notificationId,
          isRead: false,
          date: new Date().toISOString()
        } as AppNotification;

        // If it's for the current active user, update local state
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = get().simulatedUserId || (session ? session.user.id : null);
        if (currentUserId === userId) {
          set((state) => ({
            notifications: [finalNotification, ...state.notifications].slice(0, 10)
          }));
        }

        // Database Sync
        const dbNotification = {
          id: notificationId,
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'tip',
          is_read: false
        };

        const { error } = await supabase.from('notifications').insert(dbNotification);
        if (error) {
          console.error('Error saving notification to Supabase:', error);
          // Rollback local state if it was added
          if (currentUserId === userId) {
            set((state) => ({
              notifications: state.notifications.filter(n => n.id !== notificationId)
            }));
          }
        }
      },
      
      toggleNotifications: (open) => set((state) => ({
        ui: { ...state.ui, notifications: { isOpen: open } }
      })),

      addVaccinesBatch: async (newVaccines) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const finalVaccines = newVaccines.map(v => ({
          ...v,
          id: v.id || crypto.randomUUID()
        }));

        // 1. Optimistic Update
        set((state) => ({ vaccines: [...state.vaccines, ...finalVaccines] }));

        // 2. Database Sync
        const dbVaccines = finalVaccines.map(v => mapVaccineToDb(v, userId));
        const { error } = await supabase.from('vaccines').insert(dbVaccines);
        
        if (error) {
          console.error('Error bulk saving vaccines to Supabase:', error);
          // Rollback
          const idsToRemove = new Set(finalVaccines.map(v => v.id));
          set((state) => ({ vaccines: state.vaccines.filter(v => !idsToRemove.has(v.id)) }));
        }
      },

      addAiMessage: (childId, message) => set((state) => ({
        aiChatHistory: {
          ...state.aiChatHistory,
          [childId]: [...(state.aiChatHistory[childId] || []), message]
        }
      })),

      toggleMilestone: async (childId, milestoneItemId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = get().simulatedUserId || session.user.id;

        const previousMilestones = get().childMilestones;
        const existing = previousMilestones.find(cm => cm.childId === childId && cm.milestoneItemId === milestoneItemId);

        if (existing) {
          const updatedCompleted = !existing.completed;
          
          // 1. Optimistic Update
          set((state) => ({
            childMilestones: state.childMilestones.map(cm =>
              cm.id === existing.id ? { ...cm, completed: updatedCompleted, completionDate: updatedCompleted ? new Date().toISOString().split('T')[0] : undefined } : cm
            )
          }));

          // 2. Database Sync
          const { error } = await supabase
            .from('child_milestones')
            .update({ completed: updatedCompleted, completion_date: updatedCompleted ? new Date().toISOString().split('T')[0] : null })
            .eq('id', existing.id);

          if (error) {
            console.error('Error updating child milestone in Supabase:', error);
            set({ childMilestones: previousMilestones });
          }
        } else {
          const id = crypto.randomUUID();
          const newMilestone: ChildMilestone = {
            id,
            childId,
            milestoneItemId,
            completed: true,
            completionDate: new Date().toISOString().split('T')[0]
          };

          // 1. Optimistic Update
          set((state) => ({ childMilestones: [...state.childMilestones, newMilestone] }));

          // 2. Database Sync
          const dbMilestone = mapMilestoneToDb(newMilestone, userId);
          const { error } = await supabase.from('child_milestones').insert({ ...dbMilestone, id });
          
          if (error) {
            console.error('Error saving child milestone to Supabase:', error);
            set((state) => ({ childMilestones: state.childMilestones.filter(cm => cm.id !== id) }));
          }
        }
      },

      setSelectedPeriod: (period) => set((state) => ({
        ui: { ...state.ui, milestones: { ...state.ui.milestones, selectedPeriod: period } }
      })),

      reset: () => set({
        simulatedUserId: null,
        simulatedUserEmail: null,
        children: [],
        activeChildId: null,
        measurements: [],
        vaccines: [],
        childMilestones: [],
        exams: [],
        libraryCategories: [],
        libraryArticles: [],
        reminders: [],
        milkLogs: [],
        foodLogs: [],
        foodChecklist: {},
        aiChatHistory: {},
        notifications: [],
        hasLoadedData: false,
      }),
    }),
    {
      name: 'rotinaped-storage-supabase-v2',
      storage: createJSONStorage(() => storageWrapper),
    }
  )
);
