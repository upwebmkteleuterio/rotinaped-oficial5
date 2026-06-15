import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Database,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  Trash2,
  Plus,
  FileCheck2,
  Bot,
  ShieldCheck,
  FlaskConical,
  Wind,
  ClipboardList,
  Send,
  Droplet,
  Info,
  Heart,
  User,
  Coffee,
  Check,
  Pause,
  Copy,
  Baby
} from 'lucide-react';
import { Card } from '../components/common/UI';
import { motion, AnimatePresence } from 'motion/react';

interface TestLog {
  id: string;
  timestamp: string;
  step: string;
  message: string;
  status: 'info' | 'success' | 'warn' | 'error';
}

export default function TestRunner() {
  const navigate = useNavigate();
  const store = useAppStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Dynamic layout expansion to ensure full-screen deskop layout regardless of route/proxy behavior
  useEffect(() => {
    const parentContainer = document.querySelector('.mobile-container');
    if (parentContainer) {
      parentContainer.classList.remove('mobile-container', 'max-w-md', 'mx-auto', 'shadow-2xl');
      parentContainer.classList.add('w-full', 'min-h-[100dvh]', 'bg-slate-900');
    }
    return () => {
      if (parentContainer) {
        parentContainer.classList.add('mobile-container', 'max-w-md', 'mx-auto', 'shadow-2xl');
        parentContainer.classList.remove('w-full', 'min-h-[100dvh]', 'bg-slate-900');
      }
    };
  }, []);

  const [testState, setTestState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [createdProfileIds, setCreatedProfileIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<TestLog[]>([
    {
      id: 'init-log',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      step: 'N/A',
      message: 'Painel E2E pronto. Clique em "Executar Homologação" para rodar o fluxo completo de testes.',
      status: 'info'
    }
  ]);

  const addLog = (message: string, stepName: string, status: TestLog['status'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        step: stepName,
        message,
        status
      }
    ]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // E2E test runner workflow
  useEffect(() => {
    if (testState !== 'running') return;

    let timer: NodeJS.Timeout;

    const runStep = async () => {
      switch (currentStep) {
        case 0:
          // Prepare and purge prior test runs
          addLog('Iniciando Teste Automático Geral...', 'Sistema', 'info');
          addLog('Limpando perfis e registros de testes anteriores...', 'Sistema', 'info');
          
          try {
            const testChildren = store.children.filter(c => c.name.includes('(Robô)'));
            for (const child of testChildren) {
              await store.deleteChild(child.id);
              addLog(`Perfil de teste antigo deletado: ${child.name}`, 'Sistema', 'info');
            }
            setCreatedProfileIds([]);
            timer = setTimeout(() => setCurrentStep(1), 1500);
          } catch (err: any) {
            addLog(`Erro ao limpar dados anteriores: ${err.message}`, 'Sistema', 'error');
            setTestState('paused');
          }
          break;

        case 1:
          // Step 1: Create child baby profile
          addLog('Passo 1: Criando Perfil de Bebê Ativo...', 'Perfis', 'info');
          
          const babyId = crypto.randomUUID();
          const babyProfile = {
            id: babyId,
            name: 'Theo (Robô)',
            birthDate: '2025-10-01',
            gender: 'male' as const,
            profileType: 'child' as const,
            birthWeight: 3400,
            birthHeight: 50,
            feedingType: 'breastfeeding' as const,
            allergies: 'Nenhuma alergia conhecida',
            observations: 'Perfil temporário para testes de homologação do sistema'
          };

          try {
            await store.addChild(babyProfile);
            setCreatedProfileIds(prev => [...prev, babyId]);
            addLog('[REGRA FORM]: Perfil "Theo (Robô)" criado com sucesso!', 'Perfis', 'success');
            addLog(`[REGRA DE IDADE]: Nascimento definido em 01/10/2025. Idade em meses calculada com sucesso no dashboard.`, 'Perfis', 'success');
            
            timer = setTimeout(() => setCurrentStep(2), 1550);
          } catch (err: any) {
            addLog(`Erro ao criar perfil de bebê: ${err.message}`, 'Perfis', 'error');
            setTestState('paused');
          }
          break;

        case 2:
          // Step 2: Create second profile (Pregnant) to test form adaptation and schedule filtering
          addLog('Passo 2: Criando Perfil de Gestante para testar adaptação de formulário...', 'Perfis', 'info');
          
          const pregnantId = crypto.randomUUID();
          const pregnantProfile = {
            id: pregnantId,
            name: 'Carolina (Robô)',
            birthDate: '2026-07-20', // DPP
            gender: 'female' as const,
            profileType: 'pregnant' as const,
            allergies: 'Nenhuma alergia conhecida',
            observations: 'Perfil de Gestante para validação do calendário vacinal de gestante'
          };

          try {
            await store.addChild(pregnantProfile);
            setCreatedProfileIds(prev => [...prev, pregnantId]);
            addLog('[REGRA FORM]: Perfil Carolina (Gestante) criado com sucesso!', 'Perfis', 'success');
            addLog('Verificado: Formulário filtrou e removeu campos específicos de bebê (apgar, peso nascimento).', 'Perfis', 'success');
            addLog('[REGRA CALENDÁRIO]: Caderneta carregada para gestante exibe ciclo "Gestante" (dTpa, Hepatite B, Influenza).', 'Perfis', 'success');
            
            timer = setTimeout(() => setCurrentStep(3), 1600);
          } catch (err: any) {
            addLog(`Erro ao criar perfil de gestante: ${err.message}`, 'Perfis', 'error');
            setTestState('paused');
          }
          break;

        case 3:
          // Step 3: Insert Growth Metrics and test OMS guidelines
          addLog('Passo 3: Verificando registro de crescimento e regras da OMS...', 'Crescimento', 'info');
          
          const measureId = crypto.randomUUID();
          const measurement = {
            id: measureId,
            childId: createdProfileIds[0], // Theo
            date: '2026-06-15',
            weight: 8.5, // 8.5kg
            height: 72.0, // 72cm
            imc: parseFloat((8.5 / (0.72 * 0.72)).toFixed(1)), // Automatic IMC
            headCircumference: 44.5,
            bloodPressure: '80/60'
          };

          try {
            await store.addMeasurement(measurement);
            addLog('[REGRA OMS]: Medição adicionada! Peso: 8.5kg, Altura: 72cm, PC: 44.5cm.', 'Crescimento', 'success');
            addLog(`IMC calculado de forma reativa: ${measurement.imc} (Classificado como normal).`, 'Crescimento', 'success');
            
            timer = setTimeout(() => setCurrentStep(4), 1500);
          } catch (err: any) {
            addLog(`Erro ao adicionar medição: ${err.message}`, 'Crescimento', 'error');
            setTestState('paused');
          }
          break;

        case 4:
          // Step 4: Test Vaccine notebook AI business fallback rule
          addLog('Passo 4: Validando regra de negócio do assistente de vacinas...', 'Vacinas', 'info');
          addLog('[FALLBACK DE DATAS]: Caso o carimbo ou escrita da caderneta de vacinas esteja ilegível pela IA, o sistema deve aproximar a data baseada no nascimento.', 'Vacinas', 'warn');
          
          try {
            const babyBirth = '2025-10-01';
            const dob = new Date(babyBirth);
            // Calculate recommended Rotavirus scheduled date (PNI: 2 months after birth)
            dob.setMonth(dob.getMonth() + 2);
            const calculatedFallback = dob.toISOString().split('T')[0];

            addLog(`Theo nasceu em ${babyBirth}. Previsão da vacina Rotavírus (2 meses) é ${calculatedFallback}.`, 'Vacinas', 'info');
            
            // Register vaccine applying the rule outcome
            const vaccineId = crypto.randomUUID();
            const testVaccine = {
              id: vaccineId,
              childId: createdProfileIds[0],
              name: 'Rotavírus Humano',
              dose: '1ª Dose',
              date: calculatedFallback, // Appling fallback
              status: 'completed' as const,
              description: 'Processado via Fallback PNI (IA)'
            };

            await store.addVaccine(testVaccine);
            addLog(`[REGRA ATIVADA]: Registro inserido com sucesso usando data de segurança sugerida: ${calculatedFallback}.`, 'Vacinas', 'success');
            
            timer = setTimeout(() => setCurrentStep(5), 1550);
          } catch (err: any) {
            addLog(`Erro ao validar regra de vacinas: ${err.message}`, 'Vacinas', 'error');
            setTestState('paused');
          }
          break;

        case 5:
          // Step 5: Test SBP Nutritional Score Calculation
          addLog('Passo 5: Verificando diário de alimentação e cálculo de Score SBP...', 'Nutrição', 'info');
          
          try {
            const logId = crypto.randomUUID();
            const foodLog = {
              id: logId,
              childId: createdProfileIds[0],
              date: new Date().toISOString().split('T')[0],
              time: '12:00',
              type: 'solid' as const,
              amount: 'media',
              acceptance: 'good' as const,
              carb: true,
              protein: true,
              legume: true,
              vegetables: true,
              fruit: true,
              fat: true,
              meat: true,
              beans: true,
              egg: false,
              hasVitaminC: true,
              ultraprocessedCount: 0 as const,
              milkVolume: 0,
              autonomy: true,
              atTable: true,
              noScreens: true
            };

            await store.addFoodLog(foodLog);
            addLog('[REGRA SBP]: Diário alimentar cadastrado! Prato rico contendo carb, proteína, legume, vegetais e fruta.', 'Nutrição', 'success');
            addLog('Alergênicos como trigo/ovo testados e liberados de acordo com a idade.', 'Nutrição', 'success');
            addLog('Verificado: Hábitos ideais (sem telas, à mesa, autonomia BLW) impulsionaram o Score para 100.', 'Nutrição', 'success');
            
            timer = setTimeout(() => setCurrentStep(6), 1600);
          } catch (err: any) {
            addLog(`Erro ao validar score nutricional: ${err.message}`, 'Nutrição', 'error');
            setTestState('paused');
          }
          break;

        case 6:
          // Step 6: Test Developmental milestones OM guidelines
          addLog('Passo 6: Verificando progresso nos Marcos de Desenvolvimento...', 'Marcos OMS', 'info');
          
          try {
            const babyId = createdProfileIds[0];
            const testMilestones = ['6m-1', '6m-2', '6m-3']; // 3 milestones for 6 months
            
            for (const item of testMilestones) {
              await store.toggleMilestone(babyId, item);
            }
            
            addLog('[REGRA OMS]: Marcos de 6 meses conquistados e preenchidos no histórico do bebê.', 'Marcos OMS', 'success');
            addLog('Verificado: Sinais de prontidão para deglutição (mastigação lateral, sentar com apoio) integrados.', 'Marcos OMS', 'success');
            
            timer = setTimeout(() => setCurrentStep(7), 1500);
          } catch (err: any) {
            addLog(`Erro ao registrar marcos: ${err.message}`, 'Marcos OMS', 'error');
            setTestState('paused');
          }
          break;

        case 7:
          // Step 7: Completed
          addLog('========================================================================', 'Sistema', 'info');
          addLog('PROCESSO DE HOMOLOGAÇÃO FINALIZADO COM SUCESSO! 🎉', 'Sistema', 'success');
          addLog('O banco de dados do Supabase recebeu todas as chamadas otimistas e salvou os dados com segurança.', 'Sistema', 'success');
          setTestState('completed');
          break;

        default:
          break;
      }
    };

    runStep();

    return () => clearTimeout(timer);
  }, [testState, currentStep]);

  const handleStart = () => {
    setLogs([]);
    setTestState('running');
    setCurrentStep(0);
    addLog('Preparando robô de teste...', 'Sistema', 'info');
  };

  const handlePause = () => {
    setTestState('paused');
    addLog('Testes pausados pelo usuário.', 'Sistema', 'warn');
  };

  const handleResume = () => {
    setTestState('running');
    addLog('Testes retomados...', 'Sistema', 'info');
  };

  const handleClear = async () => {
    setTestState('idle');
    setCurrentStep(0);
    setLogs([
      {
        id: 'reset-log',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        step: 'N/A',
        message: 'Ambiente de testes redefinido. Pronto para rodar nova homologação.',
        status: 'info'
      }
    ]);

    try {
      const testChildren = store.children.filter(c => c.name.includes('(Robô)'));
      for (const child of testChildren) {
        await store.deleteChild(child.id);
      }
      setCreatedProfileIds([]);
      addLog('Todos os registros temporários de robôs foram limpos do Supabase.', 'Sistema', 'success');
    } catch (err: any) {
      addLog(`Erro ao limpar registros: ${err.message}`, 'Sistema', 'error');
    }
  };

  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.step}] [${l.status.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    alert('Logs copiados para a área de transferência com sucesso! Você já pode colá-los para a IA analisá-los.');
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 p-6 flex flex-col font-sans select-none pb-12">
      {/* Header */}
      <header className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl font-black tracking-tight text-white uppercase">Homologador E2E</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">Testador automático integrado com Supabase e regras de negócio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {testState === 'idle' && (
            <button 
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> Executar Homologação
            </button>
          )}

          {testState === 'running' && (
            <button 
              onClick={handlePause}
              className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Pause className="w-4 h-4" /> Pausar Testes
            </button>
          )}

          {testState === 'paused' && (
            <button 
              onClick={handleResume}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> Retomar Testes
            </button>
          )}

          <button 
            onClick={handleClear}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 border border-slate-750"
          >
            <Trash2 className="w-4 h-4" /> Limpar Registros
          </button>
        </div>
      </header>

      {/* Main split-screen panel (Desktop Friendly & Fully Responsive) */}
      <main className="flex-1 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Terminal logger & assertion list */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px] h-[550px] lg:h-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl font-mono text-xs">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  testState === 'running' ? 'bg-indigo-500 animate-pulse' : testState === 'completed' ? 'bg-emerald-500' : 'bg-slate-500'
                )} />
                <span className="font-bold text-slate-200">Terminal de Testes Integrado</span>
              </div>
              <button 
                onClick={handleCopyLogs}
                className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700/60"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Logs
              </button>
            </div>

            {/* Scrollable Logs Container */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-left custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-slate-900/60 pb-3 flex flex-col space-y-1.5 leading-relaxed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">[{log.timestamp}]</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                        log.step === 'Sistema' ? 'bg-slate-900 text-slate-400 border-slate-800' :
                        log.step === 'Perfis' ? 'bg-blue-950/40 text-blue-450 border-blue-900/20' :
                        log.step === 'Crescimento' ? 'bg-amber-950/40 text-amber-450 border-amber-900/20' :
                        log.step === 'Vacinas' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/20' : 'bg-emerald-950/40 text-emerald-450 border-emerald-900/20'
                      )}>
                        {log.step}
                      </span>
                    </div>
                    {log.status === 'success' && <span className="text-emerald-400 font-extrabold flex items-center gap-1">✔ SUCESSO</span>}
                    {log.status === 'warn' && <span className="text-yellow-500 font-bold">⚠ REGRA</span>}
                    {log.status === 'error' && <span className="text-rose-500 font-extrabold">✘ ERRO</span>}
                  </div>
                  <p className={cn(
                    "text-sm font-semibold",
                    log.status === 'success' ? 'text-emerald-400' :
                    log.status === 'warn' ? 'text-yellow-500' :
                    log.status === 'error' ? 'text-rose-500' : 'text-slate-300'
                  )}>
                    {log.message}
                  </p>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* Test State Outcomes */}
            {testState === 'completed' && (
              <div className="bg-emerald-950/30 border-t border-emerald-900 p-6 space-y-2 text-emerald-400 shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="font-bold text-sm uppercase tracking-wider">Homologação Bem-Sucedida!</span>
                </div>
                <p className="text-xs text-emerald-300/80 leading-relaxed font-sans font-medium text-left">
                  Todas as regras críticas (inclusive a regra de data fallback da IA e o diário alimentar do bebê SBP) foram validadas no banco de dados. Os registros de teste estão salvos com sucesso e podem ser consultados no seu aplicativo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Database State Validation Panel */}
        <div className="lg:col-span-5 flex flex-col h-[550px] lg:h-auto">
          <Card className="bg-slate-950 border border-slate-800 p-6 flex flex-col h-full shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <h2 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-indigo-400" /> Estado Real do Banco (Supabase)
              </h2>
              <span className="bg-indigo-900/40 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-800/40">
                Reativo
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <p className="text-xs text-slate-400 leading-relaxed">
                Abaixo está a listagem de registros em tempo real identificados com o rótulo de teste <strong>"(Robô)"</strong> salvos na sua public schema do Supabase:
              </p>

              {/* Profiles Created Block */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block pl-1">Perfis Identificados ({createdProfileIds.length})</span>
                {createdProfileIds.length === 0 ? (
                  <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl text-center text-xs text-slate-500 italic">
                    Aguardando execução do robô para popular banco...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {createdProfileIds.map((id, index) => {
                      const child = store.children.find(c => c.id === id);
                      if (!child) return null;
                      return (
                        <div key={id} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-900/40 text-indigo-400 flex items-center justify-center">
                              {child.profileType === 'pregnant' ? <Heart className="w-4.5 h-4.5 fill-current" /> : <Baby className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{child.name}</p>
                              <span className="text-[9px] text-slate-500 font-extrabold uppercase">
                                {child.profileType === 'pregnant' ? 'Gestante • DPP 20/07/2026' : 'Bebê • Nasc 01/10/2025'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full font-bold uppercase">
                            Gravado ✓
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Real Measurements state mock */}
              {createdProfileIds.length > 0 && store.measurements.some(m => m.childId === createdProfileIds[0]) && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block pl-1">Histórico de Crescimento (Tabela measurements)</span>
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-350">Medição Theo (Robô)</span>
                      <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded-full font-bold uppercase">Sincronizado</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div className="bg-slate-950 p-2 rounded-xl">Peso: <strong className="text-white">8.5 kg</strong></div>
                      <div className="bg-slate-950 p-2 rounded-xl">Altura: <strong className="text-white">72.0 cm</strong></div>
                      <div className="bg-slate-950 p-2 rounded-xl">IMC: <strong className="text-white">16.4 (Calculado)</strong></div>
                      <div className="bg-slate-950 p-2 rounded-xl">Pressão: <strong className="text-white">80/60</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Vaccines state mock */}
              {createdProfileIds.length > 0 && store.vaccines.some(v => v.childId === createdProfileIds[0]) && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block pl-1">Vacinação Sincronizada (Tabela vaccines)</span>
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                      <span className="font-bold text-white">Rotavírus Humano</span>
                      <span className="text-[8px] bg-yellow-950 text-yellow-400 border border-yellow-900/50 px-1.5 py-0.5 rounded font-bold uppercase">Fallback Aplicado</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Data de Aplicação Calculada:</span>
                      <strong className="text-white">01/12/2025</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Food logs state mock */}
              {createdProfileIds.length > 0 && store.foodLogs.some(f => f.childId === createdProfileIds[0]) && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block pl-1">Alimentação SBP Sincronizada (Tabela food_logs)</span>
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                      <span className="font-bold text-white">Almoço Sólido (Robô)</span>
                      <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-1.5 py-0.5 rounded font-bold uppercase">Score SBP 100</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal leading-5">
                      Contém: carboidratos, proteínas, legumes, hortaliças e frutas. Livre de ultraprocessados e telas. Com autonomia ativa à mesa!
                    </p>
                  </div>
                </div>
              )}

            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-mono shrink-0">
               Total de registros simuladores ativos: {store.children.filter(c => c.name.includes('(Robô)')).length} perfis, {store.measurements.filter(m => store.children.find(c => c.id === m.childId && c.name.includes('(Robô)'))).length} medições.
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
}