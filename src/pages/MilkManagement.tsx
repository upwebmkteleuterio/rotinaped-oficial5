import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import HeaderWithChild from '../components/layout/HeaderWithChild';
import { Card } from '../components/common/UI';
import { 
  Plus, 
  History, 
  Trash2, 
  Clock, 
  Utensils, 
  Baby, 
  Sparkles,
  Check,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Apple,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  UserCheck,
  Zap,
  Volume2,
  X,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { FoodLog } from '../types';

export default function MilkManagement() {
  const { foodLogs, foodChecklist, activeChildId, children, addFoodLog, deleteFoodLog, updateFoodLog, updateFoodChecklist } = useAppStore();
  
  const activeChild = children.find(c => c.id === activeChildId);
  const isGirl = activeChild?.gender === 'female';
  
  // Premium Emulation Toggle so users can see both modalities clearly
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Expandable Guideline state
  const [expandedGuideline, setExpandedGuideline] = useState<string | null>(null);

  // States for edit and delete actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingFoodLogId, setEditingFoodLogId] = useState<string | null>(null);

  // Form states
  const [mealTime, setMealTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [mealType, setMealType] = useState<'breast' | 'bottle' | 'baby_food' | 'solid'>('solid');
  const [acceptance, setAcceptance] = useState<'good' | 'medium' | 'refused'>('good');
  const [amount, setAmount] = useState<string>('media');

  // Groups checklist
  const [carb, setCarb] = useState(false);
  const [protein, setProtein] = useState(false);
  const [legume, setLegume] = useState(false);
  const [vegetables, setVegetables] = useState(false);
  const [fruit, setFruit] = useState(false);
  const [fat, setFat] = useState(false);

  // Iron sources
  const [meat, setMeat] = useState(false);
  const [beans, setBeans] = useState(false);
  const [egg, setEgg] = useState(false);
  const [hasVitaminC, setHasVitaminC] = useState(false);

  // Quality NOVA count
  const [ultraprocessedCount, setUltraprocessedCount] = useState<0 | 1 | 2>(0);

  // Milk volume
  const [milkVolume, setMilkVolume] = useState<number>(350);

  // Behaviors
  const [autonomy, setAutonomy] = useState(false);
  const [atTable, setAtTable] = useState(false);
  const [noScreens, setNoScreens] = useState(false);

  // Calculate child age in months
  const childAgeInMonths = useMemo(() => {
    if (!activeChild?.birthDate) return 0;
    const birth = new Date(activeChild.birthDate);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    if (today.getDate() < birth.getDate()) {
      months--;
    }
    return Math.max(0, months);
  }, [activeChild]);

  // Automatic Dietary Phase detection based on child age (SBP Guidelines)
  const currentDietPhase = useMemo(() => {
    if (childAgeInMonths < 6) {
      return {
        title: "Aleitamento Exclusivo",
        ageRange: "0-6 meses",
        desc: "O aleitamento materno ou fórmula de forma exclusiva é a recomendação ideal até o 6º mês de vida. Não há necessidade de água, sucos ou chás.",
        color: "text-blue-600 bg-blue-50 border-blue-100"
      };
    } else if (childAgeInMonths >= 6 && childAgeInMonths < 12) {
      return {
        title: "Introdução Alimentar",
        ageRange: "6-12 meses",
        desc: "Sinais de prontidão ativos! Início de frutas picadas/amassadas e papas principais texturizadas. Evite liquidificar a comida; amassar de forma rústica incentiva a deglutição.",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100"
      };
    } else if (childAgeInMonths >= 12 && childAgeInMonths < 24) {
      return {
        title: "Transição Alimentar",
        ageRange: "1-2 anos",
        desc: "A criança passa a compartilhar de forma gradual da refeição base da casa. O volume de leite tende a se estabilizar entre 300ml e 500ml diários.",
        color: "text-amber-600 bg-amber-50 border-amber-100"
      };
    } else {
      return {
        title: "Alimentação da Família",
        ageRange: "2 anos+",
        desc: "A criança já participa integralmente da dinâmica de refeições da família. Reforço em evitar ultraprocessados, excesso de sal e açúcares refinados.",
        color: "text-indigo-600 bg-indigo-50 border-indigo-100"
      };
    }
  }, [childAgeInMonths]);

  // Compatibility Guard: Profile should be 'child' or undefined (defaults to child)
  const isCompatibleProfile = useMemo(() => {
    if (!activeChild) return true; // default safe
    return !activeChild.profileType || activeChild.profileType === 'child';
  }, [activeChild]);

  // Child evolutionary checklist from store
  const childChecklist = useMemo(() => {
    return foodChecklist[activeChildId || ''] || {
      acceptsPieces: false,
      usesPincer: false,
      takesToMouth: false,
      chewsWell: false
    };
  }, [foodChecklist, activeChildId]);

  // Calculate real-time score for the entered inputs or a target record
  const calculateScoreValue = (data: Partial<FoodLog>) => {
    let varietyScore = 0;
    let ironScore = 0;
    let qualityScore = 0;
    let milkScore = 0;
    let behaviorScore = 0;

    // 1. Variedade (Max 20 pts)
    let groupCount = 0;
    if (data.carb) groupCount++;
    if (data.protein) groupCount++;
    if (data.legume) groupCount++;
    if (data.vegetables) groupCount++;
    if (data.fruit) groupCount++;
    if (data.fat) groupCount++;
    varietyScore = Math.min(groupCount * 4, 20);

    // 2. Ferro (Max 20 pts)
    if (data.meat) {
      ironScore += 20;
    } else if (data.beans || data.egg) {
      ironScore += 10;
    }
    if (data.hasVitaminC && ironScore > 0) {
      ironScore += 5; // vit C bonus
    }
    ironScore = Math.min(ironScore, 20);

    // 3. Qualidade (Max 20 pts)
    if (data.ultraprocessedCount === 0) {
      qualityScore = 20;
    } else if (data.ultraprocessedCount === 1) {
      qualityScore = 10;
    } else {
      qualityScore = 0;
    }

    // 4. Leite por idade (Max 20 pts)
    if (childAgeInMonths < 12) {
      milkScore = 20; // naturally optimal breastfeeding age
    } else {
      const vol = data.milkVolume || 0;
      if (vol >= 300 && vol <= 500) {
        milkScore = 20;
      } else if (vol > 500) {
        milkScore = 10; // penalty for excess milk intake
      } else if (vol < 200) {
        milkScore = 15; // light penalty for too low
      }
    }

    // 5. Comportamento (Max 20 pts)
    if (data.autonomy) behaviorScore += 10;
    if (data.atTable) behaviorScore += 5;
    if (data.noScreens) behaviorScore += 5;

    // AGE ADAPTATION WEIGHTING
    let finalScore = varietyScore + ironScore + qualityScore + milkScore + behaviorScore;

    if (childAgeInMonths < 6) {
      // exclusive breastfeeding/formula makes solids irrelevant
      return {
        total: 100,
        variety: 0,
        iron: 0,
        quality: 20,
        milk: 80,
        behavior: 0
      };
    }

    return {
      total: Math.min(Math.max(finalScore, 0), 100),
      variety: varietyScore,
      iron: ironScore,
      quality: qualityScore,
      milk: milkScore,
      behavior: behaviorScore
    };
  };

  // Score description mapping
  const getScoreClassification = (score: number) => {
    if (score >= 80) {
      return {
        variant: 'green' as const,
        label: 'Adequado 🟢',
        title: 'Alimentação Adequada para a Idade',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        iconColor: 'text-emerald-500',
        phrase: 'Muito bem! Variedade, hábitos e comportamento à mesa de alta qualidade. Continue incentivando novos sabores e evite ultraprocessados.',
        insight: 'Excelente padrão geral! Fique atento às porções diárias de ferro para manter o desenvolvimento neurológico acelerado.'
      };
    } else if (score >= 50) {
      return {
        variant: 'yellow' as const,
        label: 'Atenção 🟡',
        title: 'Pontos de Atenção na Alimentação',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        iconColor: 'text-amber-500',
        phrase: 'Atenção: existem pequenos ajustes recomendados no cardápio ou rotina. Tente oferecer maior variedade e evite distrações por telas.',
        insight: 'Hoje faltou uma fonte primária de ferro combinada. Tente incluir feijão, espinafre ou carne com algumas gotas de laranja amanhã.'
      };
    } else {
      return {
        variant: 'red' as const,
        label: 'Risco Nutricional 🔴',
        title: 'Alerta de Risco Nutricional',
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-500/10 border-rose-500/30',
        iconColor: 'text-rose-500',
        phrase: 'Risco identificado: alimentação com baixa variedade, hábitos desregulados ou uso de telas. Adequações são importantes.',
        insight: 'Sinais de carência ou rotina estressante. Procure orientação do pediatra e tente estabelecer rotina rígida sem telas antes ou durante o prato.'
      };
    }
  };

  // Today's specific food log
  const activeChildDayLogs = useMemo(() => {
    return foodLogs.filter(log => log.childId === activeChildId && log.date === selectedDate);
  }, [foodLogs, activeChildId, selectedDate]);

  // Merge daily logs to run scoring on the aggregated state of the day
  const aggregatedDayLog = useMemo(() => {
    const emptyLog: Partial<FoodLog> = {
      carb: false, protein: false, legume: false, vegetables: false, fruit: false, fat: false,
      meat: false, beans: false, egg: false, hasVitaminC: false,
      ultraprocessedCount: 0,
      milkVolume: 0,
      autonomy: false, atTable: false, noScreens: false
    };

    if (activeChildDayLogs.length === 0) return emptyLog;

    // Merge logic
    let ultraMax: 0 | 1 | 2 = 0;
    let milkVolSum = 0;
    activeChildDayLogs.forEach(log => {
      if (log.carb) emptyLog.carb = true;
      if (log.protein) emptyLog.protein = true;
      if (log.legume) emptyLog.legume = true;
      if (log.vegetables) emptyLog.vegetables = true;
      if (log.fruit) emptyLog.fruit = true;
      if (log.fat) emptyLog.fat = true;
      if (log.meat) emptyLog.meat = true;
      if (log.beans) emptyLog.beans = true;
      if (log.egg) emptyLog.egg = true;
      if (log.hasVitaminC) emptyLog.hasVitaminC = true;
      if (log.autonomy) emptyLog.autonomy = true;
      if (log.atTable) emptyLog.atTable = true;
      if (log.noScreens) emptyLog.noScreens = true;
      if (log.ultraprocessedCount > ultraMax) ultraMax = log.ultraprocessedCount;
      milkVolSum += log.milkVolume || 0;
    });

    emptyLog.ultraprocessedCount = ultraMax;
    emptyLog.milkVolume = milkVolSum || 350; // default standard if not computed

    return emptyLog;
  }, [activeChildDayLogs]);

  const realTimeScore = useMemo(() => {
    return calculateScoreValue(aggregatedDayLog);
  }, [aggregatedDayLog, childAgeInMonths]);

  const scoreDetails = useMemo(() => {
    return getScoreClassification(realTimeScore.total);
  }, [realTimeScore.total]);

  // Real-time calculation for the last 7 days of logs
  const weeklyChartData = useMemo(() => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];

      const dayLogs = foodLogs.filter(log => log.childId === activeChildId && log.date === dateStr);

      let scoreVal = 0;
      if (dayLogs.length > 0) {
        const emptyLog: Partial<FoodLog> = {
          carb: false, protein: false, legume: false, vegetables: false, fruit: false, fat: false,
          meat: false, beans: false, egg: false, hasVitaminC: false,
          ultraprocessedCount: 0,
          milkVolume: 0,
          autonomy: false, atTable: false, noScreens: false
        };
        let ultraMax: 0 | 1 | 2 = 0;
        let milkVolSum = 0;
        dayLogs.forEach(log => {
          if (log.carb) emptyLog.carb = true;
          if (log.protein) emptyLog.protein = true;
          if (log.legume) emptyLog.legume = true;
          if (log.vegetables) emptyLog.vegetables = true;
          if (log.fruit) emptyLog.fruit = true;
          if (log.fat) emptyLog.fat = true;
          if (log.meat) emptyLog.meat = true;
          if (log.beans) emptyLog.beans = true;
          if (log.egg) emptyLog.egg = true;
          if (log.hasVitaminC) emptyLog.hasVitaminC = true;
          if (log.autonomy) emptyLog.autonomy = true;
          if (log.atTable) emptyLog.atTable = true;
          if (log.noScreens) emptyLog.noScreens = true;
          if (log.ultraprocessedCount > ultraMax) ultraMax = log.ultraprocessedCount;
          milkVolSum += log.milkVolume || 0;
        });
        emptyLog.ultraprocessedCount = ultraMax;
        emptyLog.milkVolume = milkVolSum || 350;

        scoreVal = calculateScoreValue(emptyLog).total;
      }

      return {
        day: dayName,
        score: scoreVal,
        hasLogs: dayLogs.length > 0
      };
    });
  }, [foodLogs, activeChildId, childAgeInMonths]);

  const weeklyAverage = useMemo(() => {
    const loggedDays = weeklyChartData.filter(d => d.hasLogs);
    if (loggedDays.length === 0) return 0;
    const sum = loggedDays.reduce((acc, d) => acc + d.score, 0);
    return Math.round(sum / loggedDays.length);
  }, [weeklyChartData]);

  // Food history list with multi-day support, limited to 3 days if not premium
  const historyDays = useMemo(() => {
    const dates = Array.from(new Set(foodLogs.filter(log => log.childId === activeChildId).map(log => log.date)))
      .sort((a, b) => b.localeCompare(a));
    
    // Limit to 3 days if free
    if (!isPremium) {
      return dates.slice(0, 3);
    }
    return dates;
  }, [foodLogs, activeChildId, isPremium]);

  // Handler to open modal for a new meal
  const handleOpenAddModal = () => {
    setEditingFoodLogId(null);
    setMealTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setMealType('solid');
    setAcceptance('good');
    setAmount('media');
    setCarb(false);
    setProtein(false);
    setLegume(false);
    setVegetables(false);
    setFruit(false);
    setFat(false);
    setMeat(false);
    setBeans(false);
    setEgg(false);
    setHasVitaminC(false);
    setUltraprocessedCount(0);
    setMilkVolume(350);
    setAutonomy(false);
    setAtTable(false);
    setNoScreens(false);
    setIsAddModalOpen(true);
  };

  // Handler to edit an existing meal log
  const handleEditClick = (log: FoodLog) => {
    setEditingFoodLogId(log.id);
    setSelectedDate(log.date);
    setMealTime(log.time);
    setMealType(log.type);
    setAcceptance(log.acceptance as any);
    setAmount(log.amount);
    setCarb(log.carb || false);
    setProtein(log.protein || false);
    setLegume(log.legume || false);
    setVegetables(log.vegetables || false);
    setFruit(log.fruit || false);
    setFat(log.fat || false);
    setMeat(log.meat || false);
    setBeans(log.beans || false);
    setEgg(log.egg || false);
    setHasVitaminC(log.hasVitaminC || false);
    setUltraprocessedCount(log.ultraprocessedCount || 0);
    setMilkVolume(log.milkVolume || 350);
    setAutonomy(log.autonomy || false);
    setAtTable(log.atTable || false);
    setNoScreens(log.noScreens || false);
    setIsAddModalOpen(true);
  };

  // Handler to save meal log
  const handleSaveMeal = () => {
    if (!activeChildId) return;

    const payload: Omit<FoodLog, 'id' | 'childId'> = {
      date: selectedDate,
      time: mealTime,
      type: mealType,
      amount,
      acceptance,
      carb,
      protein,
      legume,
      vegetables,
      fruit,
      fat,
      meat,
      beans,
      egg,
      hasVitaminC,
      ultraprocessedCount,
      milkVolume: mealType === 'bottle' ? milkVolume : 0,
      autonomy,
      atTable,
      noScreens
    };

    if (editingFoodLogId) {
      updateFoodLog(editingFoodLogId, payload);
    } else {
      const newLog: FoodLog = {
        id: crypto.randomUUID(),
        childId: activeChildId,
        ...payload
      };
      addFoodLog(newLog);
    }

    // Toast or notification simulation - switch to dashboard automatically to celebrate
    setActiveTab('dashboard');
    setIsAddModalOpen(false);
    setEditingFoodLogId(null);
    
    // Reset specific states
    setCarb(false);
    setProtein(false);
    setLegume(false);
    setVegetables(false);
    setFruit(false);
    setFat(false);
    setMeat(false);
    setBeans(false);
    setEgg(false);
    setHasVitaminC(false);
    setAutonomy(false);
    setAtTable(false);
    setNoScreens(false);
    setUltraprocessedCount(0);
  };

  // SBP Practical Guidelines Database
  const guidelines = [
    {
      id: "intro",
      title: "Introdução Alimentar Segura",
      content: "A transição aos sólidos começa rigorosamente no sexto mês de vida. Ofereça alimentos amassados de forma rústica com garfo, nunca batidos no liquidificador ou passados na peneira. Deixar que o bebê experimente texturas acelera muito o desenvolvimento motor oral.",
      tag: "Sociedade Brasileira de Pediatria",
      icon: Apple,
      bgColor: 'bg-emerald-50'
    },
    {
      id: "choke",
      title: "Engasgo Real x Reflexo de Gag",
      content: "Crucial saber diferenciar! O reflexo de Gag é um mecanismo fisiológico de segurança do bebê ao sentir pedaços maiores na parte distal da língua. O bebê fará som de ânsia mas continuará ativo, corado e tossindo. O engasgo verdadeiro é **silencioso e obstrutivo**, impedindo a fala ou o choro (requer manobra de Heimlich imediata).",
      tag: "Segurança Urgente SBP",
      icon: AlertTriangle,
      bgColor: 'bg-rose-50'
    },
    {
      id: "prohibited",
      title: "Alimentos Totalmente Proibidos (< 2 anos)",
      content: "Evite mel de abelha (risco grave de botulismo infantil), açúcares de qualquer modalidade (inclusive mascavo, de coco), sucos artificiais, embutidos (salsicha, presunto, nuggets) e alimentos redondos inteiros (como uvas ou tomate cereja sem cortar longitudinalmente pelo risco de asfixia).",
      tag: "Restrições Críticas",
      icon: Info,
      bgColor: 'bg-amber-50'
    },
    {
      id: "iron",
      title: "Ferro, Alergênicos e Suplementação de Vitaminas",
      content: "A partir dos 6 meses as reservas de ferro naturais do recém-nascido diminuem, exigindo inclusão diária de proteínas animais e leguminosas. Alergênicos comuns (como ovo inteiro, trigo, peixes) devem ser introduzidos logo no sexto mês para incentivar a tolerância imunoológica, sob orientação médica.",
      tag: "Nutrientes Vitais",
      icon: SpotToFit, // Let's use Info or BookOpen instead
      bgColor: 'bg-blue-50'
    }
  ];

  // Safeguard view for pregnant or elderly profile types:
  if (!isCompatibleProfile) {
    return (
      <div className="pb-24 bg-slate-50 min-h-screen">
        <HeaderWithChild title="Alimentação" />
        <main className="px-6 py-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <Utensils className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Regência de Perfil</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              O diário de alimentação e cálculo de Score Nutricional SBP é uma funcionalidade exclusiva para o acompanhamento infantil.
            </p>
          </div>
          <Card className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl max-w-sm text-amber-700 text-xs font-semibold leading-relaxed">
            Seu perfil atual ({activeChild?.name}) está configurado com outra categoria de público. Altere para o perfil de uma criança para liberar este diário.
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-28 bg-slate-50 min-h-screen font-sans">
      <HeaderWithChild title="Alimentação e Nutrição" />

      {/* Modern Emulation Badge to showcase both modalities beautifully */}
      <div className="px-6 pt-4">
        <div className="bg-slate-800 text-white rounded-2xl p-3 flex items-center justify-between border border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Modulador de Teste Premium</span>
              <p className="text-[10px] text-slate-300 font-medium">Controle a assinatura para avaliar as UXs</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setIsPremium(!isPremium)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm",
              isPremium 
                ? "bg-amber-500 text-slate-900 border border-amber-300"
                : "bg-slate-700 text-slate-300 border border-slate-600"
            )}
          >
            {isPremium ? "👑 Premium Ativo" : "🆓 Gratuito (Liberar)"}
          </button>
        </div>
      </div>

      <main className="px-6 py-4 space-y-6">
        
        {/* Child Profile Mini Hero and Phase Detector */}
        <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
            <Utensils className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1 text-left space-y-1">
             <div className="flex items-center gap-2">
               <h3 className="font-extrabold text-slate-800">{activeChild?.name || "Criança"}</h3>
               <span className="text-[10px] font-bold text-slate-400">• {childAgeInMonths} {childAgeInMonths === 1 ? 'mês' : 'meses'}</span>
             </div>
             <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Fase Atual Recomendada:</p>
             <div className="pt-0.5">
                <span className={cn("text-xs font-black px-3 py-1.5 rounded-full border shadow-sm inline-block uppercase leading-none mt-1", currentDietPhase.color)}>
                  ⚡ {currentDietPhase.title}
                </span>
             </div>
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed pt-2">
               {currentDietPhase.desc}
             </p>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-full">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5",
              activeTab === 'dashboard' ? (isGirl ? "bg-white text-pink-500 shadow-sm" : "bg-white text-brand-blue shadow-sm") : "text-slate-500 hover:text-slate-700"
            )}
          >
            Painel Nutricional <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </button>
          <button 
            onClick={() => setActiveTab('checklist')}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all",
              activeTab === 'checklist' ? (isGirl ? "bg-white text-pink-500 shadow-sm" : "bg-white text-brand-blue shadow-sm") : "text-slate-500 hover:text-slate-700"
            )}
          >
            Evolução
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboardTab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              
              {/* Daily Interactive score indicator */}
              <Card className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block">Índice Nutricional Diário</span>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{realTimeScore.total} <span className="text-sm font-bold text-slate-400">/ 100</span></h2>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm",
                    scoreDetails.bgColor, scoreDetails.textColor
                  )}>
                    {scoreDetails.label}
                  </span>
                </div>

                {/* Score Dial Simulator visual progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex gap-0.5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      realTimeScore.total >= 80 ? 'bg-emerald-500' : realTimeScore.total >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                    )}
                    style={{ width: `${realTimeScore.total}%` }}
                  />
                </div>

                {/* Pedatric classification advice message */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-800">{scoreDetails.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{scoreDetails.phrase}</p>
                </div>

                {/* Intelligent SBP Insights Box based on state (Premium vs Free logic) */}
                <div className={cn(
                  "p-4 rounded-2xl border relative overflow-hidden",
                  isPremium ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 fill-amber-500 animate-pulse" />
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700">Insight SBP Recomendado</span>
                      <p className="text-xs font-bold text-slate-800">Cálculo de Necessidades</p>
                      
                      {isPremium ? (
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          {scoreDetails.insight}
                        </p>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] text-slate-400 font-medium blur-[2px] leading-relaxed select-none">
                            Faltou ferro hoje. Tente oferecer gemas de ovos moles amassadas ou raspas de carne vermelha cozidas no limão para absorção máxima.
                          </p>
                          <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs inline-flex items-center gap-1">
                            🔐 Premium Exclusivo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[8px] font-black text-slate-300 text-center uppercase tracking-widest">
                  ⚠️ Este score é uma ferramenta educativa e não substitui avaliação médica.
                </p>
              </Card>

              {/* 7-Day History or Premium Locking */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block pl-1">Evolução dos Últimos Dias</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-500 select-none">
                    {isPremium ? "Gráfico Ativo" : "Histórico de 3 dias"}
                  </span>
                </div>

                {!isPremium ? (
                  /* Free historical limits presentation with nice promotional banner */
                  <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
                    <div className="relative z-10 space-y-1 text-left">
                      <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Acesso Limitado</span>
                      <h4 className="text-lg font-black tracking-tight leading-tight">Desbloqueie Histórico de 30 Dias e Relatórios PDF</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                        Gere PDFs resumidos com consumo de ingredientes, aceitação, amamentação e alergias pronto para passar por WhatsApp para seu pediatra!
                      </p>
                      
                      <div className="pt-3 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">Anuidade sugerida</span>
                          <span className="text-sm font-extrabold text-amber-300">R$ 14,90/mês</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setIsPremium(true)}
                          className="bg-amber-500 text-slate-900 border border-amber-300 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                        >
                          Assinar Premium <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <Award className="absolute -right-6 -bottom-6 w-28 h-28 text-slate-800/20 rotate-12" />
                  </Card>
                ) : (
                  /* Premium visual chart simulation or list */
                  <Card className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Médias Semanais (Gráfico Pediatria)</span>
                    
                    <div className="flex items-end justify-between h-24 px-2 pt-4">
                      {weeklyChartData.map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="text-[9px] font-extrabold text-slate-500">{bar.score}</div>
                          <div className="w-5 bg-slate-100 rounded-lg h-14 relative overflow-hidden">
                            <div 
                              className={cn(
                                "absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-300",
                                bar.score >= 80 ? 'bg-emerald-400' : bar.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                              )}
                              style={{ height: `${bar.score}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-black uppercase text-slate-400">{bar.day}</span>
                        </div>
                      ))}
                    </div>

                    <div className={cn(
                      "p-3 rounded-xl border flex items-center justify-between",
                      weeklyAverage >= 80
                        ? "bg-emerald-50 border-emerald-100 text-emerald-850"
                        : weeklyAverage >= 50
                          ? "bg-amber-50 border-amber-100 text-amber-850"
                          : "bg-rose-50 border-rose-100 text-rose-850"
                    )}>
                      <span className="text-[10px] font-bold text-slate-700">Média Alimentar de 7 Dias:</span>
                      <span className="text-xs font-black">
                        {weeklyAverage >= 80 
                          ? `🟢 ${weeklyAverage} / 100 Adequada` 
                          : weeklyAverage >= 50 
                            ? `🟡 ${weeklyAverage} / 100 Regular` 
                            : `🔴 ${weeklyAverage} / 100 Risco`}
                      </span>
                    </div>
                  </Card>
                )}

                {/* List of food logs on the chosen day */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block pl-1">Histórico do Dia ({formatDate(selectedDate)})</span>
                  
                  {activeChildDayLogs.length === 0 ? (
                    <div className="bg-white p-8 rounded-[2rem] text-center border-dashed border border-slate-200">
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed">Nenhum alimento registrado na data selecionada acima.</p>
                    </div>
                  ) : (
                    activeChildDayLogs.map((log) => {
                      return (
                        <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between relative">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                              <Utensils className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-extrabold text-slate-800 capitalize">
                                {log.type === 'breast' ? 'Amamentação de Peito' : log.type === 'bottle' ? 'Fórmula / Mamadeira' : log.type === 'baby_food' ? 'Papinha Amassada' : 'Alimento Sólido'}
                              </p>
                              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                                <Clock className="w-3 h-3" /> {log.time} • Qtd: {log.amount} • Aceites: {log.acceptance === 'good' ? 'Boa' : log.acceptance === 'medium' ? 'Regular' : 'Recusou'}
                              </div>
                            </div>
                          </div>

                          <div className="relative shrink-0 ml-4">
                            {confirmDeleteId === log.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1.5 rounded-xl shrink-0">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFoodLog(log.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 bg-rose-500 text-white font-black text-[9px] uppercase rounded-lg shadow-sm hover:bg-rose-600 active:scale-95 transition-all"
                                >
                                  Sim
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 bg-white border border-slate-200 text-slate-500 font-bold text-[9px] uppercase rounded-lg shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === log.id ? null : log.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                {activeMenuId === log.id && (
                                  <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(log);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                                    >
                                      <Edit2 className={cn("w-3.5 h-3.5", isGirl ? "text-pink-500" : "text-brand-blue")} />
                                      Editar
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(log.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      Excluir
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* SBP Scientific Guidelines Expandable Accordions */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block pl-1">Guia SBP de Alimentação Segura</span>
                
                <div className="space-y-2">
                  {guidelines.map(guide => {
                    const isExpanded = expandedGuideline === guide.id;
                    const GuideIcon = guide.icon;

                    return (
                      <Card 
                        key={guide.id}
                        className="bg-white border-none shadow-xs p-4 rounded-2xl overflow-hidden cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setExpandedGuideline(isExpanded ? null : guide.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", guide.bgColor)}>
                              <GuideIcon className="w-4 h-4 text-slate-700" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <h5 className="text-xs font-extrabold text-slate-800">{guide.title}</h5>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{guide.tag}</span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-2"
                            >
                              {guide.content}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="checklistTab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 text-left"
            >
              
              {/* Neuropsychomotor integration and developmental checklist */}
              <Card className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-5">
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-black uppercase text-orange-500 tracking-widest">Evolução Motora Oral</span>
                  <h4 className="text-lg font-black text-slate-800 leading-tight">Marcos de Prontidão e Mastigação</h4>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    A evolução da introdução alimentar está diretamente ligada ao progresso dos reflexos de pinça e músculos maxilares do bebê.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'acceptsPieces', label: 'Já aceita texturas em pedaços?', desc: 'O bebê não engasga de forma recorrente com pequenas frações consistentes, lidando bem sem purê macio.' },
                    { key: 'usesPincer', label: 'Utiliza movimento de pinça?', desc: 'Consegue pegar pedaços pequenos de legumes ou frutas usando o polegar e indicador de forma firme.' },
                    { key: 'takesToMouth', label: 'Leva colher ou alimento à boca sozinho?', desc: 'Iniciativas ativas de autogestão de alimentação, demonstrando autonomia progressiva.' },
                    { key: 'chewsWell', label: 'Mastiga bem e move a língua lateralmente?', desc: 'Usa as gengivas para triturar os pedaços de comida fazendo o movimento rotatório correto.' },
                  ].map((item, idx) => {
                    const isChecked = childChecklist[item.key as keyof typeof childChecklist] || false;

                    return (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (activeChildId) {
                            updateFoodChecklist(activeChildId, { [item.key]: !isChecked });
                          }
                        }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                          isChecked 
                            ? (isGirl ? "bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/30 text-pink-900" : "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/30 text-blue-900")
                            : "bg-slate-50 hover:bg-slate-100/50 border-slate-100 text-slate-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center border shrink-0 mt-0.5 text-xs font-bold",
                          isChecked 
                            ? (isGirl ? "bg-pink-500 border-pink-500 text-white" : "bg-brand-blue border-brand-blue text-white")
                            : "bg-white border-slate-350 text-transparent"
                        )}>
                          ✓
                        </div>
                        <div className="space-y-0.5 text-left">
                           <span className="text-xs font-black">{item.label}</span>
                           <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Smart alarms based on pediatrician advice (locked behind premium visuals) */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block pl-1">Alertas Inteligentes de Risco</span>

                <div className="space-y-2">
                  
                  {/* Alert 1: Excess milk volume */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50/50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                          Sinal de Atenção SBP
                        </span>
                      </div>
                      <h5 className="text-xs font-extrabold text-slate-800">Consumo excessivo de leite (&gt;500ml após 1 ano)</h5>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Ingestão superior a 500ml/dia após 12 meses diminui drasticamente o apetite para sólidos, sendo o principal causador oculto de anemia ferropriva na infância.
                      </p>
                    </div>
                  </div>

                  {/* Alert 2: Speech connection delay */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50/50 border border-rose-100 px-1.5 py-0.5 rounded-md">
                          Alerta Neuropsicomotor
                        </span>
                      </div>
                      <h5 className="text-xs font-extrabold text-slate-800">Criança não fala pequenas frases após 2 anos</h5>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        A falta de mastigação muscular adequada (papinhas liquidificadas prolongadas) debilita a tonicidade do maxilar, atrasando a musculatura necessária para a dicção e fala.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Botão de + Flutuante */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={handleOpenAddModal}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95",
            isGirl ? "bg-pink-500 shadow-pink-200" : "bg-brand-blue shadow-blue-200"
          )}
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Modal de Registro de Alimentação */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            {/* Overlay Click-out */}
            <div className="absolute inset-0" onClick={() => setIsAddModalOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-50 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] z-10 border border-white"
            >
              {/* Header */}
              <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    {editingFoodLogId ? "Editar Refeição" : "Nova Refeição"}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-left flex-1 pb-10">
                
                {/* Reference Date and Time Picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Data</label>
                     <input 
                       type="date"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                       className="w-full bg-transparent border-none text-xs font-extrabold text-slate-700 focus:ring-0 p-0 outline-none"
                     />
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                     <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Horário</label>
                     <input 
                       type="time"
                       value={mealTime}
                       onChange={(e) => setMealTime(e.target.value)}
                       className="w-full bg-transparent border-none text-xs font-extrabold text-slate-700 focus:ring-0 p-0 outline-none"
                     />
                  </div>
                </div>

                {/* Meal Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Tipo de Refeição</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'baby_food', label: 'Papinha', desc: 'Amassado' },
                      { id: 'solid', label: 'Sólido', desc: 'Pedaços' },
                      { id: 'breast', label: 'Peito', desc: 'Ame.' },
                      { id: 'bottle', label: 'Fórmula', desc: 'Mamadeira' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMealType(t.id as any)}
                        className={cn(
                          "py-3 rounded-2xl flex flex-col items-center justify-center transition-all border border-slate-100 shadow-xs",
                          mealType === t.id 
                            ? (isGirl ? "bg-pink-500 text-white border-pink-500" : "bg-brand-blue text-white border-brand-blue")
                            : "bg-white text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-xs font-black">{t.label}</span>
                        <span className="text-[8px] opacity-75 mt-0.5 font-bold uppercase">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fast Acceptability and Portion amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Aceitação do Prato</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'good', label: 'Muito Boa' },
                        { id: 'medium', label: 'Razoável' },
                        { id: 'refused', label: 'Recusou' },
                      ].map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAcceptance(option.id as any)}
                          className={cn(
                            "w-full py-2.5 rounded-xl text-xs font-bold transition-all border text-center",
                            acceptance === option.id 
                              ? (isGirl ? "bg-pink-50 border-pink-500 text-pink-600" : "bg-blue-50 border-brand-blue text-brand-blue")
                              : "bg-slate-50 border-transparent text-slate-500"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quantidade</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'pouca', label: 'Pouca' },
                        { id: 'media', label: 'Média' },
                        { id: 'muita', label: 'Generosa' },
                      ].map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAmount(option.id)}
                          className={cn(
                            "w-full py-2.5 rounded-xl text-xs font-bold transition-all border text-center",
                            amount === option.id 
                              ? (isGirl ? "bg-pink-50 border-pink-500 text-pink-600" : "bg-blue-50 border-brand-blue text-brand-blue")
                              : "bg-slate-50 border-transparent text-slate-500"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rich Scoring Pillars Input parameters */}
                {mealType !== 'breast' && (
                  <Card className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    
                    {/* Pillar 1: Variedade (0-20pts) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          🥦 1. Grupos Consumidos
                        </span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-500">
                          Max 20 pontos
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Carboidratos (Arroz, Batata)', state: carb, set: setCarb },
                          { label: 'Proteína Animal (Frango, Carne)', state: protein, set: setProtein },
                          { label: 'Leguminosa (Feijão, Lentilha)', state: legume, set: setLegume },
                          { label: 'Legumes / Folhas (Brócolis, Cenou)', state: vegetables, set: setVegetables },
                          { label: 'Frutas Frescas', state: fruit, set: setFruit },
                          { label: 'Gorduras Boas (Azeite, Abaca)', state: fat, set: setFat },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => item.set(!item.state)}
                            className={cn(
                              "p-3 rounded-2xl text-[11px] font-bold text-left border flex items-center justify-between transition-all",
                              item.state 
                                ? (isGirl ? "bg-pink-50/50 border-pink-400 text-pink-700" : "bg-blue-50/50 border-blue-400 text-blue-700")
                                : "bg-slate-50/50 border-slate-100 text-slate-500"
                            )}
                          >
                            <span className="truncate pr-1">{item.label}</span>
                            <span className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-black",
                              item.state 
                                ? (isGirl ? "bg-pink-500 border-pink-500 text-white" : "bg-brand-blue border-brand-blue text-white")
                                : "bg-transparent border-slate-300 text-transparent"
                            )}>
                              ✓
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pillar 2: Ferro (0-20pts) */}
                    <div className="space-y-3 border-t border-slate-50 pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          🥩 2. Fontes de Ferro
                        </span>
                        <span className="text-[10px] text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                          Crítico
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Carne / Frango / Peixe', state: meat, set: setMeat },
                          { label: 'Ovo ou Feijão de Caldo', state: beans, set: setBeans },
                          { label: 'Teve Vitamina C junto (Laranja, Limão)?', state: hasVitaminC, set: setHasVitaminC },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => item.set(!item.state)}
                            className={cn(
                              "p-3 rounded-2xl text-[11px] font-bold text-left border flex items-center justify-between transition-all col-span-2",
                              item.state 
                                ? (isGirl ? "bg-pink-50/50 border-pink-400 text-pink-700" : "bg-blue-50/50 border-blue-400 text-blue-700")
                                : "bg-slate-50/50 border-slate-100 text-slate-500"
                            )}
                          >
                            <span>{item.label}</span>
                            <span className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-black",
                              item.state 
                                ? (isGirl ? "bg-pink-500 border-pink-500 text-white" : "bg-brand-blue border-brand-blue text-white")
                                : "bg-transparent border-slate-300 text-transparent"
                            )}>
                              ✓
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pillar 3: Qualidade (Ultraprocessados) */}
                    <div className="space-y-3 border-t border-slate-50 pt-5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-600 block pl-0.5">🍎 3. Ultraprocessados no Dia</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 0, label: 'Nenhum' },
                          { value: 1, label: 'Apenas 1' },
                          { value: 2, label: '2 ou Mais' },
                        ].map(item => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setUltraprocessedCount(item.value as any)}
                            className={cn(
                              "py-2.5 rounded-2xl text-xs font-bold transition-all border",
                              ultraprocessedCount === item.value 
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-slate-50 border-transparent text-slate-600"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Milk Volume Slider (if Formula is selected or reference) */}
                    {mealType === 'bottle' && (
                      <div className="space-y-3 border-t border-slate-50 pt-5">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">🥛 4. Leite / Fórmula Coletados</span>
                          <span className="text-xs font-black text-slate-700">{milkVolume} ml</span>
                        </div>
                        <input 
                          type="range"
                          min="50"
                          max="800"
                          step="50"
                          value={milkVolume}
                          onChange={(e) => setMilkVolume(parseInt(e.target.value))}
                          className={cn(
                            "w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer",
                            isGirl ? "accent-pink-500" : "accent-brand-blue"
                          )}
                        />
                        <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase px-1">
                          <span>50 ml</span>
                          <span>400 ml</span>
                          <span>800 ml</span>
                        </div>
                      </div>
                    )}

                    {/* Pillar 5: Comportamento Alimentar */}
                    <div className="space-y-3 border-t border-slate-50 pt-5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-600 block pl-0.5">🍽️ 5. Comportamento e Hábitos</span>
                      <div className="space-y-2">
                        {[
                          { label: 'Comeu sentado à mesa com os demais', state: atTable, set: setAtTable },
                          { label: 'Refeição livre de telas (TV, Celular)', state: noScreens, set: setNoScreens },
                          { label: 'Exibiu autonomia (pegou comida sozinho)', state: autonomy, set: setAutonomy },
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => item.set(!item.state)}
                            className={cn(
                              "w-full p-4 rounded-2xl text-xs font-bold text-left border flex items-center justify-between transition-all",
                              item.state 
                                ? (isGirl ? "bg-pink-50/50 border-pink-400 text-pink-700" : "bg-blue-50/50 border-blue-400 text-blue-700")
                                : "bg-slate-50/50 border-slate-100 text-slate-500"
                            )}
                          >
                            <span>{item.label}</span>
                            <span className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-black",
                              item.state 
                                ? (isGirl ? "bg-pink-500 border-pink-500 text-white" : "bg-brand-blue border-brand-blue text-white")
                                : "bg-transparent border-slate-300 text-transparent"
                            )}>
                              ✓
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </Card>
                )}

              </div>

              {/* Fixed Footer */}
              <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                <button 
                  type="button"
                  onClick={handleSaveMeal}
                  className={cn(
                    "w-full py-4 rounded-[2rem] font-black shadow-lg transition-all active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2 text-white",
                    isGirl ? "bg-pink-500 shadow-pink-100" : "bg-brand-blue shadow-blue-100"
                  )}
                >
                  <Check className="w-5 h-5" /> {editingFoodLogId ? "Atualizar Refeição" : "Salvar Refeição do Bebê"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper block for undefined custom icon in libraries
function SpotToFit(props: any) {
  return <BookOpen {...props} />;
}
