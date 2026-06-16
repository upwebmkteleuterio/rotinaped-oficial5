import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  ArrowLeft, 
  MoreVertical, 
  Send,
  Users,
  Calendar,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CHANNELS } from '../data/community';
import { useCommunityChat } from '../hooks/useCommunityChat';
import { supabase } from '@/integrations/supabase/client';

export default function ChatRoom() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  
  const { children, activeChildId } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);
  const isGirl = activeChild?.gender === 'female';
  
  const channel = CHANNELS.find(c => c.id === channelId);
  
  // High-performance realtime hook for communication, presence, and typing status
  const {
    messages,
    onlineCount,
    typingUsers,
    isLoading,
    sendMessage,
    setTyping
  } = useCommunityChat(channelId || '');

  const [newMessage, setNewMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [presenceList, setPresenceList] = useState<{ userName: string; isTyping: boolean }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle typing status updates on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim() !== '') {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage('');
    setTyping(false);
  };

  // Extract presence list details when the user opens the information drawer
  const loadPresenceList = () => {
    if (!channelId) return;
    
    const roomName = `community_chat_${channelId}`;
    const activeChannel = supabase.channel(roomName);
    
    if (activeChannel) {
      const state = activeChannel.presenceState();
      const list = Object.values(state).flatMap((presences: any) => 
        presences.map((p: any) => ({
          userName: p.userName || 'Mãe Anônima',
          isTyping: p.isTyping || false
        }))
      );
      setPresenceList(list);
    }
    setShowOptions(true);
  };

  if (!channel) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
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
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 {onlineCount} {onlineCount === 1 ? 'mãe ativa' : 'mães ativas'} online
               </span>
            </div>
          </div>
        </div>
        
        {/* Active menu with three dots */}
        <button 
          onClick={loadPresenceList}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 active:scale-90 transition-all"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages List */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#1b6392] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Conectando com segurança...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#1b6392]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700">Inicie a conversa!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Nenhuma mensagem recente. Pergunte ou compartilhe suas experiências com as outras mães do canal.
              </p>
            </div>
          </div>
        ) : (
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {msg.sender_name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  {!msg.isMe && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                      <img 
                        src={msg.sender_avatar} 
                        alt={msg.sender_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=random`;
                        }}
                      />
                    </div>
                  )}
                  
                  <div className={cn(
                    "px-4 py-3 rounded-3xl shadow-sm text-sm font-medium leading-relaxed break-words",
                    msg.isMe 
                      ? (isGirl ? "bg-pink-500 text-white rounded-br-none" : "bg-brand-blue text-white rounded-br-none")
                      : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
                
                <span className="text-[9px] font-bold text-slate-300 mt-1.5 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Dynamic Typing Users Indicator - Shows real name of typing users */}
        {typingUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 ml-10"
          >
            <div className="flex gap-1 bg-slate-100 px-3 py-2 rounded-2xl rounded-bl-none">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-bold text-[#1b6392] uppercase tracking-widest leading-none">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
            </span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area (No Emoticon button, using standard mobile keyboard emoticons) */}
      <footer className="bg-white px-6 py-4 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex items-center">
            <input 
              type="text"
              placeholder="Escreva algo para as mães..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shrink-0",
              isGirl 
                ? "bg-pink-500 shadow-pink-100" 
                : "bg-brand-blue shadow-blue-100"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Animated Senior Drawer (Active Members and Auto-cleanup policy info) */}
      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOptions(false)}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-12 z-50 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Informações da Sala</h3>
                <button 
                  onClick={() => setShowOptions(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Auto-cleaning card */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50 flex gap-3">
                  <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Histórico Auto-Limpo</h4>
                    <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
                      Para garantir a privacidade e manter o espaço leve, todas as mensagens anteriores ao dia de ontem são limpas automaticamente. Apenas as mensagens de hoje e ontem ficam visíveis!
                    </p>
                  </div>
                </div>

                {/* Real-time Presence list */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Mães na Sala ({presenceList.length})
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {presenceList.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1b6392] flex items-center justify-center text-white text-xs font-black">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-700">{user.userName}</span>
                            {user.isTyping && (
                              <p className="text-[9px] text-[#1b6392] font-black uppercase tracking-widest mt-0.5 animate-pulse">
                                digitando...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ativa</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
