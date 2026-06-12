import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Sparkles, Send, Smile, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { AI_PED_SYSTEM_PROMPT, generateChildDossier } from '../services/aiService';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function AISupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    children, 
    activeChildId, 
    setActiveChild,
    measurements, 
    vaccines, 
    childMilestones, 
    exams, 
    foodLogs,
    foodChecklist,
    aiChatHistory,
    addAiMessage
  } = useAppStore();
  
  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  const isGirl = activeChild?.gender === 'female';

  const messages = aiChatHistory[activeChildId || ''] || [
    {
      id: 'welcome',
      text: `Olá, Mamãe! Sou a Dra. Flávia, a Pediatra Virtual do RotinaPed. Como posso ajudar com a saúde do(a) ${activeChild?.name} hoje?`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeChildId]);

  // Check if we came here with an exam to analyze
  useEffect(() => {
    if (!activeChildId || !activeChild) return;
    const state = location.state as { analyzeExam?: { name: string; laboratory?: string; date: string; fileType: string; } } | null;
    if (state && state.analyzeExam) {
      const exam = state.analyzeExam;
      
      // Clear location state immediately so it doesn't trigger again on reload/re-navigation
      navigate(location.pathname, { replace: true, state: {} });
      
      // Trigger automated exam analysis prompt
      const triggerExamResponse = async () => {
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const userMsg: Message = {
          id: Date.now().toString(),
          text: `Dra. Flávia, acabei de enviar o exame "${exam.name}" realizado no "${exam.laboratory || 'laboratório'}". Você pode ler e explicar o que ele é e o que os resultados significam para o(a) ${activeChild.name}?`,
          sender: 'user',
          timestamp
        };

        addAiMessage(activeChildId, userMsg);
        setIsTyping(true);

        try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            throw new Error('Chave de API não encontrada.');
          }

          const aiClient = new GoogleGenAI({ apiKey });
          
          const dossier = generateChildDossier(activeChild, {
            measurements,
            vaccines,
            milestones: childMilestones,
            exams,
            foodLogs,
            foodChecklist
          });

          const response = await aiClient.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
              { role: 'user', parts: [{ text: `DADOS DO FILHO (Dossiê): ${JSON.stringify(dossier, null, 2)}` }] },
              { role: 'user', parts: [{ text: `O USUÁRIO CARREGOU O SEGUINTE EXAME PARA VOCÊ EXPLICAR EM DETALHES: Nome do Exame: ${exam.name}, Laboratório: ${exam.laboratory || 'Não especificado'}, Tipo do Arquivo do Exame: ${exam.fileType}, Data do Exame: ${exam.date}.` }] },
              { role: 'user', parts: [{ text: `Explique detalhadamente o que este exame de laboratório costuma avaliar, qual é o seu propósito médico pediátrico de forma didática baseada na SBP e o que os resultados indicam.` }] }
            ],
            config: {
              systemInstruction: AI_PED_SYSTEM_PROMPT,
              temperature: 0.7,
            },
          });

          const aiResponseText = response.text || `Desculpe, mamãe. Tive um probleminha para processar a análise do exame "${exam.name}". Pode me perguntar novamente o que quer saber sobre ele?`;

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };

          addAiMessage(activeChildId, aiMsg);
        } catch (error) {
          console.error("AI Exam Error:", error);
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: `Mamãe, tive um probleminha técnico para realizar a leitura automatizada do exame de "${exam.name}" agora. Mas você pode me fazer perguntas sobre ele por aqui a qualquer momento!`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
          addAiMessage(activeChildId, errorMsg);
        } finally {
          setIsTyping(false);
        }
      };

      triggerExamResponse();
    }
  }, [location.state, activeChildId]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !activeChildId) return;

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp
    };

    addAiMessage(activeChildId, userMsg);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Chave de API não encontrada.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const dossier = generateChildDossier(activeChild, {
        measurements,
        vaccines,
        milestones: childMilestones,
        exams,
        foodLogs,
        foodChecklist
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `DADOS DO FILHO (Dossiê): ${JSON.stringify(dossier, null, 2)}` }] },
          { role: 'user', parts: [{ text: `PERGUNTA DA MÃE: ${currentInput}` }] }
        ],
        config: {
          systemInstruction: AI_PED_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      const aiResponseText = response.text || "Desculpe, mamãe. Tive um probleminha para processar sua dúvida. Pode tentar de novo?";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      addAiMessage(activeChildId, aiMsg);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Mamãe, tive um probleminha técnico aqui. Pode tentar perguntar de novo? Se o erro persistir, pode ser algo na minha conexão temporária.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      addAiMessage(activeChildId, errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-slate-50 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className={cn(
        "p-6 pt-10 pb-6 text-white relative transition-colors duration-500 shadow-lg shrink-0",
        isGirl ? "bg-pink-500" : "bg-brand-blue"
      )}>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Dúvida com IA</h1>
                <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">Pediatra Virtual RotinaPed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Child Switcher Wrapper */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none relative z-10">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap",
                activeChildId === child.id 
                  ? "bg-white text-slate-800 shadow-md scale-105" 
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              <div className="w-6 h-6 rounded-full border border-white/50 overflow-hidden">
                <img 
                  src={child.photoUrl || `https://ui-avatars.com/api/?name=${child.name}&background=random`} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-bold">{child.name}</span>
            </button>
          ))}
        </div>

        {/* Background Sparkles */}
        <Sparkles className="absolute -right-6 -top-6 w-32 h-32 text-white/10 rotate-12" />
      </header>

      {/* Safety Alert */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-3 shrink-0">
        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[10px] font-bold text-amber-900 leading-tight">
          Nossa IA responderá baseado nos dados do {activeChild?.name}. Em situações de urgência, busque sempre um médico presencial.
        </p>
      </div>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                message.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                message.sender === 'user' 
                  ? cn("rounded-tr-none text-white", isGirl ? "bg-pink-500" : "bg-brand-blue") 
                  : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
              )}>
                <div className="markdown-body">
                  <Markdown>{message.text}</Markdown>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-300 mt-1 px-2">
                {message.timestamp}
              </span>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start mr-auto"
            >
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-[2rem] rounded-tl-none flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="max-w-md mx-auto flex items-center gap-3 bg-slate-50 rounded-[2rem] px-4 py-1.5 border border-slate-100 focus-within:border-brand-blue/30 focus-within:bg-white transition-all shadow-inner">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Smile className="w-6 h-6" />
          </button>
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            placeholder="Tire suas dúvidas agora..."
            className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90",
              inputText.trim() && !isTyping
                ? (isGirl ? "bg-pink-500 text-white" : "bg-brand-blue text-white") 
                : "bg-slate-200 text-slate-400"
            )}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
