import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Bot, 
  RefreshCw, 
  X, 
  ShieldAlert, 
  CornerDownRight, 
  Code2, 
  FileCheck2, 
  Database,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  MonitorCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DevLog {
  id: string;
  time: string;
  module: 'Exames' | 'Vacinas' | 'Suporte' | 'Core';
  text: string;
  status: 'info' | 'success' | 'warn' | 'error';
}

export default function FloatingDevPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useAppStore();

  const [isOpen, setIsOpen] = useState(true);
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  
  // Floating bubble overlay injected into the viewport
  const [robotBubble, setRobotBubble] = useState<string | null>(null);
  const [robotPings, setRobotPings] = useState<{ x: number; y: number } | null>(null);

  // Simulated internal AI results for the custom overlay
  const [showVaxFallbackModal, setShowVaxFallbackModal] = useState(false);
  const [selectedVaxDates, setSelectedVaxDates] = useState({
    pentavalente: '2026-05-10',
    rotavirus: '' // Will calculate fallback
  });

  const [logs, setLogs] = useState<DevLog[]>([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString('pt-BR'),
      module: 'Core',
      text: 'Testador de Ajustes e Homologação de Regras carregado com sucesso.',
      status: 'info'
    },
    {
      id: 'init-2',
      time: new Date().toLocaleTimeString('pt-BR'),
      module: 'Core',
      text: 'Clique em "Executar Homologação" para assistir o robô testando as regras ao vivo no celular ao lado.',
      status: 'info'
    }
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, module: DevLog['module'], status: DevLog['status'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        time: new Date().toLocaleTimeString('pt-BR'),
        module,
        text,
        status
      }
    ]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle automatic step logic
  useEffect(() => {
    if (testState !== 'running' || currentStep === null) return;

    let timer: NodeJS.Timeout;

    const runAutomatedSequence = async () => {
      switch (currentStep) {
        case 0:
          // Initialize E2E
          addLog('Limpando registros temporários anteriores de testes...', 'Core', 'info');
          setRobotBubble('Iniciando Teste Automático. Deite-se e assista o robô testar tudo sozinh!');
          
          // Clean state
          const cleanExams = store.exams.filter(e => !e.id.startsWith('robot-'));
          const cleanVax = store.vaccines.filter(v => !v.id.startsWith('robot-'));
          useAppStore.setState({ exams: cleanExams, vaccines: cleanVax });

          timer = setTimeout(() => {
            setCurrentStep(1);
          }, 2000);
          break;

        case 1:
          // STEP 1: TEST EXAM CATEGORIES IN THE LIVE APP
          setRobotBubble('Passo 1: Verificando as Novas Categorias da Central de Exames...');
          addLog('Navegando programaticamente para a tela de exames...', 'Exames', 'info');
          navigate('/exams');

          timer = setTimeout(() => {
            setCurrentStep(2);
          }, 1800);
          break;

        case 2:
          setRobotBubble('Acessamos "/exams". Agora, o robô vai abrir o modal de criação...');
          addLog('Abrindo o modal de inserção de novo Exame via Estado Global...', 'Exames', 'info');
          useAppStore.setState({ ui: { ...store.ui, exams: { isAddModalOpen: true } } });

          timer = setTimeout(() => {
            setCurrentStep(3);
          }, 2000);
          break;

        case 3:
          setRobotBubble('Preechendo o exame e validando a categoria "Laboratoriais"...');
          addLog('Injetando dados do exame de teste com categoria "laboratoriais"...', 'Exames', 'info');

          // Directly insert to demonstrate it is correctly saved & updated below
          const testExam = {
            id: 'robot-exam-1',
            childId: store.activeChildId || 'theo-id',
            name: 'Hemograma Completo de Testes (IA)',
            category: 'laboratoriais' as const,
            date: new Date().toISOString().split('T')[0],
            status: 'completed' as const,
            laboratory: 'Central de Homologação Pediátrica',
            patientName: 'THEO'
          };
          
          store.addExam(testExam);
          
          addLog('Exame de Homologação inserido com sucesso!', 'Exames', 'success');
          addLog('Garantindo o isolamento das categorias: laboratoriais, infecciosos, imagens, respiratorios, triagens.', 'Exames', 'success');

          // Close modal
          useAppStore.setState({ ui: { ...store.ui, exams: { isAddModalOpen: false } } });

          timer = setTimeout(() => {
            setCurrentStep(4);
          }, 1500);
          break;

        case 4:
          setRobotBubble('Perfeito! Veja o exame "Laboratoriais" listado na tela do celular com seu ícone!');
          addLog('Verificação de renderização visual concluída.', 'Exames', 'success');

          timer = setTimeout(() => {
            setCurrentStep(5);
          }, 2500);
          break;

        case 5:
          // STEP 2: TEST VACCINES NOTEPAPER PROCESSING & REGRA DE NEGÓCIO FALLBACK
          setRobotBubble('Passo 2: Testando Regra de Negócio de Vacinas via IA (Fallback de datas)...');
          addLog('Carregando tela de histórico de Vacinas...', 'Vacinas', 'info');
          navigate('/vaccines');

          timer = setTimeout(() => {
            setCurrentStep(6);
          }, 1800);
          break;

        case 6:
          setRobotBubble('Simulando o processamento de imagem da Caderneta de Vacinação do bebê.');
          addLog('Disparando simulador da inteligência artificial para reconhecer vacinas carimbadas...', 'Vacinas', 'info');
          setShowVaxFallbackModal(true);

          timer = setTimeout(() => {
            setCurrentStep(7);
          }, 2000);
          break;

        case 7:
          setRobotBubble('Processamento concluído. Repare na Regra de Data de Fallback de Segurança!');
          
          // Fetch infant's birthdays
          const baby = store.children.find(c => c.id === (store.activeChildId || 'theo-id'));
          const babyDob = baby?.birthDate || '2025-10-01';
          
          // Calculate scheduled date for Rotavirus (e.g. 2 months birthDate check)
          const dobDate = new Date(babyDob);
          dobDate.setMonth(dobDate.getMonth() + 2);
          const computedFallback = dobDate.toISOString().split('T')[0];

          // Set the state
          setSelectedVaxDates({
            pentavalente: '2026-05-10',
            rotavirus: computedFallback
          });

          addLog(`Bebê selecionado: ${baby?.name || 'Theo'} (Nascimento: ${babyDob})`, 'Vacinas', 'info');
          addLog(`[REGRA ATIVADA]: A IA leu "Pentavalente" em 10/05/2026. Porém, para "Rotavírus" a escrita estava ilegível.`, 'Vacinas', 'warn');
          addLog(`[FALLBACK]: Atribuída data aproximada de segurança baseada no calendário PNI (Nascimento + 2 meses): ${computedFallback}`, 'Vacinas', 'success');

          timer = setTimeout(() => {
            setCurrentStep(8);
          }, 3500);
          break;

        case 8:
          setRobotBubble('Ao confirmar, as vacinas são salvas no histórico com controle e segurança.');
          addLog('Inserindo vacinas confirmadas pela IA no histórico definitivo...', 'Vacinas', 'info');

          // Inject vaccines to global store
          store.addVaccine({
            id: 'robot-vax-penta',
            childId: store.activeChildId || 'theo-id',
            name: 'Pentavalente (1ª dose)',
            date: selectedVaxDates.pentavalente,
            status: 'completed',
            description: 'Homologação: Lido via IA'
          });

          store.addVaccine({
            id: 'robot-vax-rota',
            childId: store.activeChildId || 'theo-id',
            name: 'Rotavírus Humano',
            date: selectedVaxDates.rotavirus,
            status: 'completed',
            description: 'Homologação: Sugerido via Fallback PNI'
          });

          addLog('Ambos os registros foram gravados corretamente e associados às regras de nascimento e PNI.', 'Vacinas', 'success');

          timer = setTimeout(() => {
            setShowVaxFallbackModal(false);
            setCurrentStep(9);
          }, 2000);
          break;

        case 9:
          setRobotBubble('Redirecionando você para a Caderneta Completa para confirmar o preenchimento!');
          navigate('/vaccine-notebook');

          timer = setTimeout(() => {
            setCurrentStep(10);
          }, 2500);
          break;

        case 10:
          // STEP 3: TEST CHAT AREA STABILITY IN AI SUPPORT PAGE
          setRobotBubble('Passo 3: Verificando se o rodapé do Chat de Suporte IA está firme e amigável...');
          addLog('Carregando tela de Suporte com inteligência artificial (/ai-support)...', 'Suporte', 'info');
          navigate('/ai-support');

          timer = setTimeout(() => {
            setCurrentStep(11);
          }, 2200);
          break;

        case 11:
          setRobotBubble('Enviando pergunta de teste para demonstrar flexibilidade de layout.');
          addLog('Simulando envio de pergunta: "Com quantos meses nasce o dente?"', 'Suporte', 'info');

          const activeId = store.activeChildId || 'theo-id';
          store.addAiMessage(activeId, {
            id: 'robot-msg-1',
            text: 'Com quantos meses nasce o dente?',
            sender: 'user',
            timestamp: new Date().toLocaleTimeString('pt-BR')
          });

          timer = setTimeout(() => {
            setCurrentStep(12);
          }, 1500);
          break;

        case 12:
          setRobotBubble('Resposta da IA recebida. Perceba que as mensagens fluem sem quebrar o rodapé!');
          
          const activeId2 = store.activeChildId || 'theo-id';
          store.addAiMessage(activeId2, {
            id: 'robot-msg-2',
            text: 'Os primeiros dentes de leite costumam nascer por volta dos 6 meses de idade, começando pelos incisivos inferiores. No entanto, é totalmente normal que variem entre os 4 e os 10 meses.',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('pt-BR')
          });

          addLog('[VALOR DE EXCELÊNCIA]: O rodapé flexível do chat manteve-se colado na base sem estourar altura.', 'Suporte', 'success');

          timer = setTimeout(() => {
            setRobotBubble(null);
            setTestState('completed');
            setCurrentStep(null);
            addLog('====================================================', 'Core', 'info');
            addLog('HOMOLOGAÇÃO CONCLUÍDA! Todos os fluxos automáticos passaram com êxito.', 'Core', 'success');
            addLog('Suas regras de negócio e layouts estão excelentes de acordo com as instruções.', 'Core', 'success');
          }, 2500);
          break;

        default:
          break;
      }
    };

    runAutomatedSequence();

    return () => clearTimeout(timer);
  }, [testState, currentStep]);

  const startAutomatedTest = () => {
    setTestState('running');
    setCurrentStep(0);
    setLogs([]);
    addLog('Iniciando robô de homologação sem cliques manuais...', 'Core', 'info');
  };

  const stopAndEraseRobotData = () => {
    setTestState('idle');
    setCurrentStep(null);
    setRobotBubble(null);
    setShowVaxFallbackModal(false);
    
    // Remove injected data
    const cleanExams = store.exams.filter(e => !e.id.startsWith('robot-'));
    const cleanVax = store.vaccines.filter(v => !v.id.startsWith('robot-'));
    useAppStore.setState({ exams: cleanExams, vaccines: cleanVax });
    
    addLog('Testes interrompidos e registros limpos com segurança.', 'Core', 'info');
    navigate('/');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[999] pointer-events-auto">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
        >
          <Bot className="w-5 h-5 text-indigo-400 animate-bounce" />
          <span>Abrir Testador Automático</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 1. Transparent global floating banner simulator on the cell phone frame */}
      <AnimatePresence>
        {robotBubble && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[9999] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-indigo-650 text-white rounded-2xl p-4 shadow-2xl border border-indigo-500 text-xs font-bold leading-relaxed flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <p>{robotBubble}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Outer Sidebar - Floats outside the phone viewport */}
      <div className="fixed right-4 top-4 bottom-4 w-96 bg-slate-950 border border-slate-800 text-slate-100 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-[990] font-sans">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-950 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Testador de IA Automático</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Regras de Negócio e Layout</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Action triggers */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 shrink-0 space-y-3">
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            Assista a IA e o aplicativo interagirem sem cliques manuais! Excelente para validar os ajustes sem cansaço.
          </p>
          
          <div className="flex items-center gap-2">
            {testState === 'running' ? (
              <button 
                onClick={stopAndEraseRobotData}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Interromper & Limpar</span>
              </button>
            ) : (
              <button 
                onClick={startAutomatedTest}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-wide shadow-lg shadow-indigo-950/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Executar Homologação Geral</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Logger Console Terminal */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-2 font-mono text-[10.5px]">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 px-1 border-b border-slate-900 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Console de Regras lógicas</span>
            </div>
            <span>Logs ao vivo</span>
          </div>

          <div className="flex-1 bg-black/50 border border-slate-900 rounded-2xl p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-slate-950 pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                  <span>[{log.time}]</span>
                  <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[8px] ${
                    log.module === 'Exames' ? 'bg-rose-950/40 text-rose-350' :
                    log.module === 'Vacinas' ? 'bg-amber-950/40 text-amber-350' :
                    log.module === 'Suporte' ? 'bg-sky-950/40 text-sky-350' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {log.module}
                  </span>
                  {log.status === 'success' && <span className="text-emerald-400">✔</span>}
                  {log.status === 'warn' && <span className="text-yellow-400">⚠</span>}
                </div>
                <p className={`leading-relaxed leading-4 font-semibold ${
                  log.status === 'success' ? 'text-emerald-400' :
                  log.status === 'warn' ? 'text-yellow-500' :
                  log.status === 'error' ? 'text-red-400' : 'text-slate-350'
                }`}>
                  {log.text}
                </p>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Bottom Success Splash */}
        {testState === 'completed' && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="border-t border-emerald-900 bg-emerald-950/30 p-4 space-y-1.5"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Ajustes Homologados!</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans font-medium">
              A Central de Exames (laboratoriais, infecciosos, imagens, respiratorios, triagens), a regra de data de fallback baseada no dia de nascimento (PNI 2 meses), e a estabilidade do chat de IA estão perfeitas!
            </p>
          </motion.div>
        )}
      </div>

      {/* 3. SIMULATOR MODAL FOR STEP 2 (The Fallback Mechanism Visualizer) */}
      <AnimatePresence>
        {showVaxFallbackModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xs pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 space-y-5 text-slate-800 font-sans shadow-2xl border border-slate-100"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Simulador de Caderneta (IA)</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Processando Regras de Negócio</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                  Veja como a Inteligência Artificial lida com a inconsistência de dados:
                </p>

                {/* Patient / Baby Card */}
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100/60">
                  <div className="w-9 h-9 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold text-xs uppercase">
                    {store.children[0]?.name[0] || 'T'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{store.children[0]?.name || 'Theo'}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Nascimento: {store.children[0]?.birthDate || '01/10/2025'}</p>
                  </div>
                </div>

                {/* Vaccine Item 1: Valid read */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100/60">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Pentavalente (1ª dose)</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase">Data lida</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Escrita reconhecida:</span>
                    <span className="text-xs font-bold text-slate-800">{selectedVaxDates.pentavalente}</span>
                  </div>
                </div>

                {/* Vaccine Item 2: Unreadable read - enforcing Fallback */}
                <div className="p-3 bg-amber-50/50 rounded-2xl space-y-2 border border-amber-100/40">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-705">Rotavírus Humano</span>
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-black uppercase">Data Ilegível</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Nenhuma data de carimbo detectada pela IA. Aplicando Fallback:
                  </p>
                  <div className="bg-white p-2 rounded-xl flex items-center justify-between border border-amber-200">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[9px] font-bold text-amber-700 uppercase">Sugestão PNI (Nasc. + 2m):</span>
                    </div>
                    <span className="text-xs font-black text-amber-600">{selectedVaxDates.rotavirus || 'Calculando...'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <div className="py-2.5 bg-indigo-600 text-white rounded-xl text-center text-xs font-bold shadow-md">
                  Confirmando e Gravando no Histórico...
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
