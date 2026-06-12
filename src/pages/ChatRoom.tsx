import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  ArrowLeft, 
  MoreVertical, 
  Send, 
  Smile,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CHANNELS } from '../data/community';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  avatar?: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'JEAN',
    text: 'Oi, meninas!',
    timestamp: '18:52',
    isMe: false,
    avatar: 'https://i.pravatar.cc/150?u=jean'
  },
  {
    id: '2',
    sender: 'MÃE DO ARTHUR',
    text: 'Olá! Como estão as vacinas por aí? Alguém sabe se no posto central tem a da gripe?',
    timestamp: '18:53',
    isMe: false,
    avatar: 'https://i.pravatar.cc/150?u=arthur'
  },
  {
    id: '3',
    sender: 'VOCÊ',
    text: 'Oi! No posto do bairro Cruzeiro eu vi que chegou ontem.',
    timestamp: '18:55',
    isMe: true
  }
];

export default function ChatRoom() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { children, activeChildId } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);
  const isGirl = activeChild?.gender === 'female';
  
  const channel = CHANNELS.find(c => c.id === channelId);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulation of an active community
  useEffect(() => {
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout, t4: NodeJS.Timeout;

    if (messages.length === MOCK_MESSAGES.length) {
      t1 = setTimeout(() => {
        setTypingUser('MÃE DA ALICE');
        
        t2 = setTimeout(() => {
          setTypingUser(null);
          setMessages(prev => {
            if (prev.some(m => m.id === 'auto-1')) return prev;
            return [...prev, {
              id: 'auto-1',
              sender: 'MÃE DA ALICE',
              text: 'Verdade! Eu fui lá hoje cedo e tinha acabado de chegar o lote novo.',
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              isMe: false,
              avatar: 'https://i.pravatar.cc/150?u=alice'
            }];
          });

          t3 = setTimeout(() => {
            setTypingUser('CAMILA');
            t4 = setTimeout(() => {
              setTypingUser(null);
              setMessages(prev => {
                if (prev.some(m => m.id === 'auto-2')) return prev;
                return [...prev, {
                  id: 'auto-2',
                  sender: 'CAMILA',
                  text: 'Meninas, aproveitando... Alguém sabe se precisa levar o cartão do SUS ou só o CPF serve? 😊',
                  timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  isMe: false,
                  avatar: 'https://i.pravatar.cc/150?u=camila'
                }];
              });
            }, 4000);
          }, 3000);
        }, 3000);
      }, 2000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        setTypingUser(null);
      };
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender: 'VOCÊ',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  if (!channel) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Custom Header */}
      <header className="bg-white px-6 pt-12 pb-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/community')}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{channel.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{channel.online} mães online</span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages List */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              {!msg.isMe && (
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msg.sender}</span>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src={msg.avatar || `https://ui-avatars.com/api/?name=${msg.sender}&background=random`} 
                      alt={msg.sender}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className={cn(
                  "px-4 py-3 rounded-3xl shadow-sm text-sm font-medium leading-relaxed",
                  msg.isMe 
                    ? (isGirl ? "bg-pink-500 text-white rounded-br-none" : "bg-brand-blue text-white rounded-br-none")
                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                )}>
                  {msg.text}
                </div>
              </div>
              
              <span className="text-[9px] font-bold text-slate-300 mt-1.5 px-1">
                {msg.timestamp}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {typingUser && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 ml-10"
          >
            <div className="flex gap-1 bg-slate-100 px-3 py-2 rounded-2xl rounded-bl-none">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {typingUser} ESTÁ DIGITANDO...
            </span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white px-6 py-4 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <button className="text-slate-300 hover:text-slate-400 transition-colors">
            <Smile className="w-6 h-6" />
          </button>
          
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex items-center">
            <input 
              type="text"
              placeholder="Escreva algo para as mães..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100",
              isGirl 
                ? "bg-pink-500 shadow-pink-100" 
                : "bg-slate-200 text-slate-400 shadow-none hover:bg-brand-blue hover:text-white"
            )}
          >
            <Send className={cn("w-5 h-5", !newMessage.trim() && !isGirl && "text-slate-400")} />
          </button>
        </div>
      </footer>
    </div>
  );
}
