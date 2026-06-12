import { Bell, ChevronDown, UserCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import NotificationModal from '../notifications/NotificationModal';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const { children, activeChildId, setActiveChild, notifications, toggleNotifications } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const activeChild = children.find(c => c.id === activeChildId) || children[0];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold text-brand-blue tracking-tight leading-none">RotinaPed</h1>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {children.slice(0, 3).map((child, i) => (
                <div key={child.id} className="w-5 h-5 rounded-full border-2 border-white overflow-hidden bg-slate-100 flex items-center justify-center">
                  {child.photoUrl ? (
                    <img src={child.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[6px] font-bold text-slate-400">{child.name[0]}</div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {children.length} {children.length === 1 ? 'Filho' : 'Filhos'} • Dashboard
            </span>
          </div>
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
