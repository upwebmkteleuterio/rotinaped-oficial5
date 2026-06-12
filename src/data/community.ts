import { 
  Syringe, 
  Droplets, 
  Baby, 
  Ruler, 
  Heart, 
  Search,
  LucideIcon
} from 'lucide-react';

export interface Channel {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: string;
  online: number;
}

export const CHANNELS: Channel[] = [
  {
    id: 'vaccines',
    title: 'Dúvidas de Vacinação',
    description: 'Converse sobre reações, estoques de postos e o calendário PNI.',
    icon: Syringe,
    color: 'bg-blue-500',
    category: 'IMUNIZAÇÃO',
    online: 12
  },
  {
    id: 'feeding',
    title: 'Amamentação & Nutrição',
    description: 'Pega correta, introdução alimentar e estoque de leite materno.',
    icon: Droplets,
    color: 'bg-cyan-500',
    category: 'NUTRIÇÃO',
    online: 8
  },
  {
    id: 'milestones',
    title: 'Marcos & Conquistas',
    description: 'Troca de experiências sobre os primeiros passos e desenvolvimento.',
    icon: Baby,
    color: 'bg-emerald-500',
    category: 'DESENVOLVIMENTO',
    online: 15
  },
  {
    id: 'growth',
    title: 'Crescimento & Saúde',
    description: 'Acompanhamento de peso, altura e saúde geral do bebê.',
    icon: Ruler,
    color: 'bg-amber-500',
    category: 'SAÚDE',
    online: 6
  },
  {
    id: 'support',
    title: 'Desabafa, Mãe!',
    description: 'Espaço exclusivo para compartilhar as dores e lutas da jornada.',
    icon: Heart,
    color: 'bg-rose-500',
    category: 'APOIO EMOCIONAL',
    online: 24
  },
  {
    id: 'tips',
    title: 'Indica Aí, Mãe!',
    description: 'Recomendações de especialistas e serviços testados pela comunidade.',
    icon: Search,
    color: 'bg-indigo-500',
    category: 'RECOMENDAÇÕES',
    online: 10
  }
];
