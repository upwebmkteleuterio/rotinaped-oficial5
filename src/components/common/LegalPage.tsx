import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Baby, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CONTACT_EMAIL = 'contato@rotinaped.com.br';
export const SITE_URL = 'rotinaped.com.br';
export const LAST_UPDATE = '18 de agosto de 2026';

const PUBLIC_LINKS = [
  { to: '/politica', label: 'Política de Privacidade' },
  { to: '/termos', label: 'Termos de Uso' },
  { to: '/excluir-conta', label: 'Exclusão de Conta' },
];

interface LegalPageProps {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Layout compartilhado das páginas públicas (acessíveis sem login). */
export function LegalPage({ badge, title, subtitle, children }: LegalPageProps) {
  const { pathname } = useLocation();
  const otherLinks = PUBLIC_LINKS.filter((link) => link.to !== pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1b6392] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao app
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1b6392] rounded-lg flex items-center justify-center">
              <Baby className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              Rotina<span className="text-[#1b6392]">Ped</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-10 space-y-8"
        >
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              {badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
          </div>

          {children}
        </motion.div>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold">
          {otherLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[#1b6392] hover:underline underline-offset-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <footer className="text-center text-[10px] text-slate-400 py-8">
          <p>
            © {new Date().getFullYear()} RotinaPed. Proteção de dados garantida de acordo com a
            LGPD.
          </p>
        </footer>
      </main>
    </div>
  );
}

interface SectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

export function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1b6392] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3 sm:pl-12">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ContactLink({ subject }: { subject?: string }) {
  const href = subject
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CONTACT_EMAIL}`;

  return (
    <a href={href} className="font-bold text-[#1b6392] hover:underline underline-offset-2">
      {CONTACT_EMAIL}
    </a>
  );
}
