import { Link, useLocation } from 'react-router-dom';
import { Home, Syringe, Ruler, Baby, LayoutGrid, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

const navItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/vaccines', icon: Syringe, label: 'Vacinas' },
  { path: '/growth', icon: Ruler, label: 'Crescimento' },
  { path: '/milestones', icon: Baby, label: 'Marcos' },
  { path: '/menu', icon: LayoutGrid, label: 'Mais' },
];

export default function Navbar() {
  const { children, activeChildId } = useAppStore();
  const location = useLocation();
  const activeChild = children.find(c => c.id === activeChildId);
  const isGirl = activeChild?.gender === 'female';
  const profileType = activeChild?.profileType || 'child';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-1 py-3 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isItemActive = (() => {
          if (item.path === '/vaccines') {
            return ['/vaccines', '/vaccine-notebook', '/all-vaccines'].includes(location.pathname);
          }
          return location.pathname === item.path;
        })();

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 px-2 py-1 rounded-2xl",
              isItemActive 
                ? (isGirl ? "text-pink-500 bg-pink-50" : "text-brand-blue bg-blue-50") 
                : "text-slate-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
