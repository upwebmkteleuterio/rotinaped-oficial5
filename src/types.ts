export interface Child {
  id: string;
  name: string;
  birthDate: string;
  photoUrl?: string;
  gender: 'male' | 'female';
  profileType?: 'child' | 'pregnant' | 'adult' | 'elderly';
  // Birth Data
  deliveryType?: string;
  gestationalWeeks?: number;
  gestationalDays?: number;
  birthWeight?: number;
  birthHeight?: number;
  apgar1min?: number;
  apgar5min?: number;
  // Health
  feedingType?: 'breastfeeding' | 'formula';
  allergies?: string;
  observations?: string;
  // Pediatrician
  pediatricianName?: string;
  pediatricianPhone?: string;
  bloodType?: string;
  documentId?: string; // CPF
  preferredFacilityType?: 'SUS' | 'PRIVATE' | 'BOTH';
  ignoredVaccines?: string[];
}

export interface Reminder {
  id: string;
  type: 'vitamin_d' | 'ferro' | 'appointment' | 'vaccine' | 'medication';
  title: string;
  description: string;
  date?: string; // YYYY-MM-DD
  time: string;
  frequency: 'daily' | 'weekly' | 'custom' | 'once';
  enabled: boolean;
}

export interface Measurement {
  id: string;
  childId: string;
  date: string;
  weight?: number; // kg
  height?: number; // cm
  imc?: number;
  headCircumference?: number; // cm
  bloodPressure?: string;
  isBirth?: boolean;
}

export interface VaccineScheduleItem {
  id: string;
  name: string;
  dose: string;
  ageInMonths: number;
  ageLabel: string;
  category: 'baby' | 'child' | 'adolescent' | 'pregnant' | 'adult' | 'elderly';
  gender?: 'male' | 'female' | 'both';
  description: string;
  prevents: string;
  facilityType?: 'SUS' | 'PRIVATE' | 'BOTH';
}

export interface Vaccine {
  id: string;
  childId: string;
  name: string;
  dose?: string;
  date: string;
  status: 'pending' | 'completed';
  lotNumber?: string;
  location?: string;
  photoUrl?: string;
  description?: string;
  facilityType?: 'SUS' | 'PRIVATE';
}

export interface MilestoneItem {
  id: string;
  periodMonths: number;
  description: string;
  category: 'social' | 'motor' | 'language' | 'cognitive';
  stimulusAdvice?: string;
}

export interface ChildMilestone {
  id: string;
  childId: string;
  milestoneItemId: string;
  completed: boolean;
  completionDate?: string;
}

export interface MilkLog {
  id: string;
  childId: string;
  date: string; // ISO String
  type: 'breast' | 'bottle';
  side?: 'left' | 'right' | 'both';
  amount?: number; // ml for bottle
  duration?: number; // minutes for breast
  startTime: string; // HH:mm
}

export interface Exam {
  id: string;
  childId: string;
  name: string;
  category: 'laboratoriais' | 'infecciosos' | 'imagens' | 'respiratorios' | 'triagens';
  date: string;
  status: 'pending' | 'completed' | 'analyzing';
  laboratory?: string;
  patientName?: string;
  fileUrl?: string;
  fileType?: 'pdf' | 'image';
  resultDate?: string;
}

export interface LibraryCategory {
  id: string;
  name: string;
  icon: string;
  color?: string;
  created_at?: string;
}

export interface LibraryArticle {
  id: string;
  title: string;
  summary: string;
  category: string | LibraryCategory;
  categoryId?: string;
  content: string;
  imageUrl?: string;
  authoritativeSources?: string[];
  isFeatured?: boolean;
  createdAt?: string;
}

export interface DailyTip {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'vaccine' | 'exam' | 'reminder' | 'tip';
}

export interface FoodLog {
  id: string;
  childId: string;
  date: string; // ISO String (like YYYY-MM-DD)
  time: string; // "HH:MM"
  type: 'breast' | 'bottle' | 'baby_food' | 'solid'; // peito, fórmula/mamadeira, papinha, sólido
  amount: 'pouca' | 'media' | 'muita' | string; 
  acceptance: 'good' | 'medium' | 'refused';
  carb: boolean;
  protein: boolean;
  legume: boolean;
  vegetables: boolean;
  fruit: boolean;
  fat: boolean;
  meat: boolean;
  beans: boolean;
  egg: boolean;
  hasVitaminC: boolean;
  ultraprocessedCount: 0 | 1 | 2; // 0: nenhum, 1: um, 2: dois ou mais
  milkVolume: number; // in ml
  autonomy: boolean;
  atTable: boolean;
  noScreens: boolean;
}

