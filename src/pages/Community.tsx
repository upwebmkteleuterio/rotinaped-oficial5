import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  Heart, 
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { CHANNELS } from '../data/community';

export default function Community() {
  const navigate = useNavigate();
  const { children, activeChildId } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);
  const isGirl = activeChild?.gender === 'female';

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
      <Header />

      <main className="px-6 py-4 space-y-6">
        <section className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Comunidade</h2>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-sm border",
              isGirl ? "bg-pink-50 border-pink-100 text-pink-500" : "bg-blue-50 border-blue-100 text-brand-blue"
            )}>
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isGirl ? "text-pink-500" : "text-brand-blue"
            )}>
              Canais Temáticos
            </h3>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Espaços de Troca
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {CHANNELS.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/community/chat/${channel.id}`)}
            >
              <Card className="flex h-32 overflow-hidden border-none shadow-sm rounded-3xl group cursor-pointer active:scale-[0.98] transition-all">
                {/* Icon Section */}
                <div className={cn(
                  "w-1/4 flex items-center justify-center text-white shrink-0",
                  channel.color
                )}>
                  <channel.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </div>

                {/* Content Section */}
                <div className="flex-1 bg-white p-5 flex flex-col justify-center relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full border mb-1",
                      isGirl ? "text-pink-500 border-pink-100 bg-pink-50/30" : "text-brand-blue border-blue-100 bg-blue-50/30"
                    )}>
                      {channel.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase">
                        {channel.online} Online
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 tracking-tight leading-none mb-1 group-hover:text-brand-blue transition-colors">
                    {channel.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {channel.description}
                  </p>
                  
                  <div className="absolute right-4 bottom-4">
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-brand-blue transition-colors" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
