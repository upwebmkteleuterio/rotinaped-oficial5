import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldAlert, 
  Database, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Terminal, 
  X, 
  Maximize2, 
  RefreshCw,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ProbeLog {
  id: string;
  timestamp: string;
  type: 'query' | 'auth' | 'rls' | 'system';
  message: string;
  status: 'info' | 'success' | 'warn' | 'error';
  rawPayload?: any;
}

interface DataBridgeProbeProps {
  uiCount: number;
}

export default function DataBridgeProbe({ uiCount }: DataBridgeProbeProps) {
  const { user, role } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'logs' | 'mismatch'>('scan');
  
  // Status Checks
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'ok' | 'failed'>('checking');
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [rlsBlocked, setRlsBlocked] = useState<'checking' | 'yes' | 'no'>('checking');
  const [castingIssue, setCastingIssue] = useState<boolean>(false);
  const [diagnosticReason, setDiagnosticReason] = useState<string | null>(null);

  const [logs, setLogs] = useState<ProbeLog[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      type: 'system',
      message: 'Sonda de Integridade Data-Bridge carregada com sucesso.',
      status: 'info'
    }
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: ProbeLog['type'], status: ProbeLog['status'] = 'info', payload?: any) => {
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        type,
        message,
        status,
        rawPayload: payload
      }
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  // Execute Deep Scan
  const executeDeepScan = async () => {
    if (!user) return;
    setConnectionStatus('checking');
    setRlsBlocked('checking');
    setCastingIssue(false);
    setDiagnosticReason(null);

    addLog('Iniciando Varredura Profunda (Deep Scan)...', 'system', 'info');
    
    // Test 1: Active Connection Check & Metadata
    addLog(`Inspecionando JWT do Usuário logado: ${user.email}`, 'auth', 'info', {
      id: user.id,
      email: user.email,
      jwt_role: role,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    });

    if (role !== 'admin') {
      addLog('[AVISO]: O JWT não possui a tag "admin". As regras de RLS do banco vão bloquear acessos globais!', 'auth', 'warn');
    } else {
      addLog('[SUCESSO]: Papel "admin" autenticado e validado no JWT.', 'auth', 'success');
    }

    // Test 2: RLS Validation / Database Count
    try {
      addLog('Executando Consulta Direta na tabela public.profiles...', 'query', 'info');
      const { data, count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (error) {
        throw error;
      }

      setConnectionStatus('ok');
      const actualCount = count || data?.length || 0;
      setDbCount(actualCount);
      addLog(`Consulta concluída com sucesso! Banco retornou: ${actualCount} registros.`, 'query', 'success', data);

      // Verify RLS lock
      if (actualCount === 1 && role === 'admin') {
        setRlsBlocked('yes');
        setDiagnosticReason('Acesso limitado por RLS (Erro de Ponte: RLS restringe leitura global mesmo sendo admin)');
        addLog('[FALHA CRÍTICA RLS]: O banco retornou apenas 1 registro (você mesmo). RLS está bloqueando a leitura global de perfis!', 'rls', 'error');
      } else {
        setRlsBlocked('no');
        addLog('[SUCESSO RLS]: RLS livre. Banco de dados retornou múltiplos registros.', 'rls', 'success');
      }

    } catch (err: any) {
      setConnectionStatus('failed');
      addLog(`Erro de Conexão ou Permissão no banco: ${err.message}`, 'query', 'error', err);
      
      if (err.message?.includes('JWT') || err.message?.includes('permission denied')) {
        setDiagnosticReason('Erro de Permissão (Politica RLS bloqueando o select do Admin)');
      } else if (err.message?.includes('type') || err.message?.includes('uuid')) {
        setCastingIssue(true);
        setDiagnosticReason('Falha de Tipagem / Casting no PostgreSQL');
      } else {
        setDiagnosticReason(err.message || 'Erro de conexão/offline');
      }
    }
  };

  useEffect(() => {
    executeDeepScan();
  }, [uiCount, user, role]);

  const handleCopyLogs = () => {
    const formattedLogs = logs.map(l => 
      `[${l.timestamp}] [${l.type.toUpperCase()}] [${l.status.toUpperCase()}] ${l.message} ${l.rawPayload ? '\nPayload: ' + JSON.stringify(l.rawPayload, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(formattedLogs);
    alert('Diagnóstico copiado! Envie esses dados para a IA analisar.');
  };

  const isPonteQuebrada = dbCount !== null && dbCount > 0 && uiCount === 0;

  return (
    <div className="space-y-4 shrink-0 font-sans">
      {/* 1. Integrity Banner (Topo da Tela) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isPonteQuebrada 
          ? 'bg-rose-50 border-rose-200 text-rose-800' 
          : connectionStatus === 'failed' 
            ? 'bg-amber-50 border-amber-200 text-amber-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              isPonteQuebrada ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {isPonteQuebrada ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">Sonda de Integridade Data-Bridge</span>
                {isPonteQuebrada && (
                  <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase animate-bounce">
                    Ponte Quebrada!
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-0.5 opacity-90">
                {isPonteQuebrada 
                  ? 'ALERTA: Há registros salvos no banco, mas a tela está exibindo 0 usuários (Skeletons infinitos).' 
                  : connectionStatus === 'failed' 
                    ? 'Conexão offline ou permissão de banco de dados negada.' 
                    : 'A ponte de fluxo de dados entre o Banco de Dados e a UI está estável.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Terminal className="w-4 h-4" /> Inspect logs
            </button>
            <button 
              onClick={executeDeepScan}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              title="Recarregar Sonda"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Diagnostic indicators grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-black/5 text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Conexão:</span>
            <span className={connectionStatus === 'ok' ? 'text-emerald-600' : 'text-rose-600'}>
              {connectionStatus === 'ok' ? '● Ativa' : connectionStatus === 'failed' ? '● Erro' : '● Verificando'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>JWT Role:</span>
            <span className={role === 'admin' ? 'text-emerald-600' : 'text-amber-600'}>
              {role || 'Nenhum'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Registros Banco:</span>
            <span className="text-slate-800 font-extrabold">{dbCount !== null ? dbCount : '...'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Registros na UI:</span>
            <span className="text-slate-800 font-extrabold">{uiCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Floating Inspector Drawer/Modal (Log Monitor) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[100]" onClick={() => setIsOpen(false)} />
            
            <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100 font-mono">
              {/* Header */}
              <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">Monitor de Diagnóstico SBP</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="bg-slate-950/50 px-6 py-2 border-b border-slate-800 flex gap-2 shrink-0">
                {[
                  { id: 'scan', label: 'Diagnóstico' },
                  { id: 'logs', label: 'Logs do Banco' },
                  { id: 'mismatch', label: 'Mismatch Report' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-left text-xs custom-scrollbar">
                
                {/* TAB 1: DIAGNOSTIC REPORT */}
                {activeTab === 'scan' && (
                  <div className="space-y-4 font-sans">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="text-white font-bold text-sm">Resumo da Varredura</h4>
                      <p className="text-slate-400">
                        O motor cruzou dados em 3 pontos de verificação.
                      </p>
                    </div>

                    {/* Status Box */}
                    <div className={`p-4 rounded-xl border ${
                      diagnosticReason ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    }`}>
                      <h5 className="font-bold text-white text-xs mb-1">Resultado do Diagnóstico</h5>
                      <p className="text-xs leading-relaxed">
                        {diagnosticReason 
                          ? `Erro Detectado: ${diagnosticReason}.`
                          : 'Ponte de integridade de fluxo de dados operando com 100% de sucesso.'}
                      </p>
                      {diagnosticReason?.includes('RLS') && (
                        <p className="text-[11px] text-rose-400/80 mt-2 italic leading-relaxed">
                          * Dica do Desenvolvedor Sênior: Se o status do RLS estiver bloqueando dados globais mesmo você sendo admin, isso significa que você alterou o cargo de "client" para "admin" recentemente no banco de dados, mas o token ativo no seu navegador ainda não foi renovado. Faça LogOut do aplicativo e entre novamente para renovar o token e aplicar o crachá de admin de forma definitiva!
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase font-black pl-1 block">Filtros Ativos na UI</span>
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Plataforma:</span>
                          <span className="text-white font-bold">Vite / React 19 (Web-PC)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Filtro Ativo:</span>
                          <span className="text-white font-bold">Todos os usuários (profiles)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EXECUTION LOGS */}
                {activeTab === 'logs' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                      <span>Linhas de Log</span>
                      <button onClick={handleCopyLogs} className="flex items-center gap-1 hover:text-white transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Copiar Tudo
                      </button>
                    </div>

                    <div className="space-y-3 font-mono text-[10.5px]">
                      {logs.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">[{log.timestamp}]</span>
                              <span className="text-indigo-400 uppercase font-bold text-[9px]">[{log.type}]</span>
                            </div>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                alert('Linha de log copiada!');
                              }}
                              className="text-slate-500 hover:text-white"
                              title="Copiar linha"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className={cn(
                            "font-semibold",
                            log.status === 'success' ? 'text-emerald-400' :
                            log.status === 'warn' ? 'text-yellow-500' :
                            log.status === 'error' ? 'text-rose-500' : 'text-slate-350'
                          )}>
                            {log.message}
                          </p>
                          {log.rawPayload && (
                            <pre className="p-2 bg-black/40 rounded text-[9px] text-slate-400 overflow-x-auto">
                              {JSON.stringify(log.rawPayload, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}

                {/* TAB 3: MISMATCH REPORT */}
                {activeTab === 'mismatch' && (
                  <div className="space-y-4 font-sans">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <h4 className="text-white font-bold">Relatório de Divergência</h4>
                      <p className="text-slate-400 text-xs">
                        Compara se o número de linhas recebido pelo banco de dados coincide com a quantidade renderizada na interface (UI).
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Registrado no Banco</span>
                        <span className="text-3xl font-extrabold text-white">{dbCount !== null ? dbCount : '...'}</span>
                      </div>
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Renderizado na UI</span>
                        <span className="text-3xl font-extrabold text-white">{uiCount}</span>
                      </div>
                    </div>

                    {isPonteQuebrada && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-left space-y-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-5 h-5 text-rose-500" />
                          <span>Divergência Crítica Detectada!</span>
                        </div>
                        <p className="text-xs leading-relaxed">
                          O banco de dados reporta que existem {dbCount} registros de usuários, mas a interface permanece com 0. Isso prova que o fluxo de dados foi interrompido (geralmente por politicas RLS ativas bloqueando o Select ou cache de login antigo).
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-950 border-t border-slate-850 shrink-0">
                <button 
                  onClick={handleCopyLogs}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Copy className="w-4 h-4" /> Copiar Relatório de Diagnóstico Completo
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}