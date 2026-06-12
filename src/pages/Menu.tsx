import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/UI';
import { 
  FolderOpen, 
  BookOpen, 
  Bell, 
  UserCircle, 
  ChevronRight, 
  ShieldCheck, 
  MessageCircle, 
  Settings,
  LogOut,
  HelpCircle,
  Utensils,
  Users,
  Sparkles
} from 'lucide-react';
import CustomAIIcon from '../components/common/CustomAIIcon';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

export default function Menu() {
  const navigate = useNavigate();
  const { children, activeChildId, reset } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId) || children[0];

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair? Seus dados locais serão apagados.')) {
      reset();
      navigate('/profiles');
    }
  };

  const profileType = activeChild?.profileType || 'child';

  const menuItems = [
    { 
      label: 'Gerenciamento',
      items: [
        { id: 'profiles', label: 'Gerenciar Perfis', icon: UserCircle, color: 'text-blue-500', bg: 'bg-blue-50', path: '/profiles' },
        { id: 'milk', label: 'Alimentação e Nutrição', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50', path: '/milk' },
        { id: 'reminders', label: 'Lembretes e Rotina', icon: Bell, color: 'text-rose-500', bg: 'bg-rose-50', path: '/reminders' },
      ]
    },
    {
      label: 'Comunidade & IA',
      items: [
        { id: 'ai-support', label: 'Dúvida com IA', icon: CustomAIIcon, color: 'text-brand-blue', bg: 'bg-blue-50', path: '/ai-support' },
        { id: 'community', label: 'Canais da Comunidade', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/community' },
      ]
    },
    {
      label: 'Conteúdo',
      items: [
        { id: 'exams', label: 'Central de Exames', icon: FolderOpen, color: 'text-amber-500', bg: 'bg-amber-50', path: '/exams' },
        { id: 'library', label: 'Biblioteca Médica', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/library' },
      ]
    },
    {
      label: 'Suporte',
      items: [
        { id: 'help', label: 'Central de Ajuda', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-50', path: '/support' },
        { id: 'contact', label: 'Falar com Suporte', icon: MessageCircle, color: 'text-brand-blue', bg: 'bg-blue-50', path: '/support' },
      ]
    }
  ];

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <main className="px-6 py-8 space-y-8">
        <section className="mb-2">
           <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Mais</h1>
           <p className="text-slate-400 text-sm font-medium mt-1">Configurações e recursos extras.</p>
        </section>

        {/* Menu Sections */}
        {menuItems.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">
              {section.label}
            </h3>
            <div className="grid gap-3">
              {section.items.map((item) => (
                <motion.div 
                  key={item.id} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    className="bg-white border border-slate-50 p-5 flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", item.bg, item.color)}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-700 tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {/* Support Banner */}
        <section className="pt-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-2xl font-bold text-white leading-tight">Privacidade<br />e Segurança</h3>
                <p className="text-slate-400 text-xs font-medium mt-2 leading-relaxed">Seus dados e de seu filho estão protegidos de acordo com a LGPD e protocolos médicos.</p>
             </div>
             <Settings className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
          </Card>
        </section>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full py-6 flex items-center justify-center gap-2 text-rose-500 font-bold text-sm uppercase tracking-widest active:opacity-50 transition-opacity"
        >
           <LogOut className="w-5 h-5" /> Sair da Conta
        </button>
      </main>
    </div>
  );
}
