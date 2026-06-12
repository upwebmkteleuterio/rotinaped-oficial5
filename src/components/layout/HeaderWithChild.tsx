import { ChevronDown, UserCircle, Bell } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import NotificationModal from '../notifications/NotificationModal';

interface HeaderWithChildProps {
  title: string;
}

export default function HeaderWithChild({ title }: HeaderWithChildProps) {
  const navigate = useNavigate();
  const { children, activeChildId, setActiveChild, notifications, toggleNotifications } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="flex flex-col gap-1 relative">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight leading-none">{title}</h1>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 active:opacity-70 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-brand-blue/20 bg-slate-100 flex items-center justify-center">
              {activeChild?.photoUrl ? (
                <img 
                  src={activeChild.photoUrl} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1">
              {activeChild?.name || 'Selecione'} <ChevronDown className="w-3 h-3" />
            </span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/20 z-50"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-14 left-0 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-[60] overflow-hidden"
                >
                  <div className="space-y-1">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setActiveChild(child.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl transition-colors",
                          activeChildId === child.id ? "bg-blue-50 text-brand-blue" : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                          {child.photoUrl ? (
                            <img src={child.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserCircle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{child.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-50">
                    <button 
                      onClick={() => {
                        navigate('/profiles');
                        setIsOpen(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-brand-blue transition-colors text-left"
                    >
                      Gerenciar Perfis
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => toggleNotifications(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-brand-blue hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </header>

      <NotificationModal />
    </>
  );
}
