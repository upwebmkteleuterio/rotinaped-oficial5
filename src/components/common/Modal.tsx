import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-white rounded-[2rem] z-[70] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden"
          >
            <div className="p-5 flex justify-between items-center bg-white z-10 shrink-0 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 pb-10">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
