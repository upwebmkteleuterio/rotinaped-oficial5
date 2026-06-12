import Header from '../components/layout/Header';
import { Card } from '../components/common/UI';
import { 
  MessageCircle, 
  HelpCircle, 
  ChevronRight, 
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  BookOpen,
  Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

export default function Support() {
  const navigate = useNavigate();
  const { children, activeChildId } = useAppStore();
  const activeChild = children.find(c => c.id === activeChildId);

  const faqs = [
    {
      q: 'Como alterar o perfil do meu filho?',
      a: 'Vá em Menu > Perfis dos Filhos e clique no ícone de engrenagem ao lado do nome do seu filho.'
    },
    {
      q: 'Os dados estão seguros?',
      a: 'Sim, utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD.'
    },
    {
      q: 'Como funciona o scanner de vacinas?',
      a: 'Basta tirar uma foto da caderneta física e nossa IA identificará as doses aplicadas e pendentes.'
    }
  ];

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <Header />

      <main className="px-6 py-4 space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ajuda e Suporte</h2>
        </div>

        {activeChild?.pediatricianName && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contato de Emergência</h3>
            <Card className="p-6 bg-blue-50 border-blue-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-brand-blue rounded-2xl flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 tracking-tight">{activeChild.pediatricianName}</h4>
                  <p className="text-xs text-slate-500 font-medium">Pediatra do(a) {activeChild.name}</p>
                </div>
              </div>
              {activeChild.pediatricianPhone && (
                <a 
                  href={`tel:${activeChild.pediatricianPhone.replace(/\D/g, '')}`}
                  className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </Card>
          </section>
        )}

        {/* Support Channels */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Canais de Atendimento</h3>
          <div className="grid gap-4">
            <Card className="p-6 bg-white border-none shadow-sm flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">WhatsApp Suporte</h4>
                  <p className="text-xs text-slate-400 font-medium">Resposta em até 2 horas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
            </Card>

            <Card className="p-6 bg-white border-none shadow-sm flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">E-mail</h4>
                  <p className="text-xs text-slate-400 font-medium">contato@rotinaped.com.br</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-brand-blue transition-colors" />
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Perguntas Frequentes</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="p-6 bg-white border-none shadow-sm space-y-2">
                <h4 className="font-bold text-slate-800 text-sm">{faq.q}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="pb-8">
          <Card className="bg-gradient-to-br from-brand-blue to-blue-700 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10 flex flex-col items-center text-center">
                <BookOpen className="w-10 h-10 text-white/50 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Guia do Usuário</h3>
                <p className="text-white/60 text-xs font-medium mb-6">Aprenda a tirar o máximo proveito do RotinaPed.</p>
                <button className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest border border-white/30 flex items-center gap-2">
                  Acessar <ExternalLink className="w-3.5 h-3.5" />
                </button>
             </div>
             <HelpCircle className="absolute -left-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
          </Card>
        </section>
      </main>
    </div>
  );
}
