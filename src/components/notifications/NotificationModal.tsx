import { useAppStore } from '../../store/useAppStore';
import Modal from '../common/Modal';
import { Bell, Syringe, FileText, Lightbulb, Calendar, Check, Trash2, X } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationModal() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    ui,
    toggleNotifications
  } = useAppStore();

  const isOpen = ui.notifications.isOpen;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccine': return <Syringe className="w-5 h-5" />;
      case 'exam': return <FileText className="w-5 h-5" />;
      case 'tip': return <Lightbulb className="w-5 h-5" />;
      case 'reminder': return <Calendar className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccine': return 'bg-blue-50 text-brand-blue';
      case 'exam': return 'bg-amber-50 text-amber-600';
      case 'tip': return 'bg-emerald-50 text-emerald-600';
      case 'reminder': return 'bg-rose-50 text-rose-500';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => toggleNotifications(false)} 
      title="Notificações"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recentes</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {unreadCount} Novas
                </span>
              )}
           </div>
           {unreadCount > 0 && (
             <button
               onClick={() => markAllNotificationsAsRead()}
               className="text-[10px] font-bold text-brand-blue uppercase tracking-wider cursor-pointer"
             >
               Marcar todas como lidas
             </button>
           )}
        </div>

        {/* Container com rolagem interna e altura máxima para respeitar os limites da tela */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar pb-4">
          <AnimatePresence initial={false}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "p-5 rounded-3xl border transition-all relative group",
                    notification.isRead ? "bg-white border-slate-50 opacity-60" : "bg-blue-50/30 border-blue-100 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", getTypeColor(notification.type))}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 tracking-tight truncate">{notification.title}</h4>
                        {!notification.isRead && <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-3 block">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button 
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-brand-blue transition-colors cursor-pointer"
                    >
                       <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4 grayscale opacity-40">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Bell className="w-10 h-10" />
                </div>
                <p className="text-slate-500 font-bold">Você está em dia!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}