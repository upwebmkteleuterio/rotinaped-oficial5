export interface PremiumMilestone {
  id: string;
  periods: number[]; // Months this item applies to
  category: 'geral' | 'motor' | 'cognitive' | 'language' | 'social' | 'stimulus';
  description: string;
}

export const PREMIUM_MILESTONES_DATA: PremiumMilestone[] = [
  // ================= RECÉM-NASCIDO (0–1 MÊS) =================
  { id: "p-0m-1", periods: [0, 1], category: "geral", description: "Reage a luz e som" },
  { id: "p-0m-2", periods: [0, 1], category: "geral", description: "Fixa brevemente o olhar" },
  { id: "p-0m-3", periods: [0, 1], category: "motor", description: "Reflexos (Moro, sucção)" },
  { id: "p-0m-4", periods: [0, 1], category: "motor", description: "Flexão de membros" },
  { id: "p-0m-5", periods: [0, 1], category: "motor", description: "Levanta cabeça por segundos" },
  { id: "p-0m-6", periods: [0, 1], category: "cognitive", description: "Atenção a estímulos" },
  { id: "p-0m-7", periods: [0, 1], category: "cognitive", description: "Reconhecimento sensorial inicial" },
  { id: "p-0m-8", periods: [0, 1], category: "language", description: "Choro diferenciado" },
  { id: "p-0m-9", periods: [0, 1], category: "social", description: "Acalma com colo" },
  { id: "p-0m-10", periods: [0, 1], category: "social", description: "Reconhece voz materna" },
  { id: "p-0m-11", periods: [0, 1], category: "stimulus", description: "Contato pele a pele" },
  { id: "p-0m-12", periods: [0, 1], category: "stimulus", description: "Falar suavemente" },
  { id: "p-0m-13", periods: [0, 1], category: "stimulus", description: "Olho no olho" },
  { id: "p-0m-14", periods: [0, 1], category: "stimulus", description: "Tummy time (curto e frequente)" },

  // ================= 1 MÊS =================
  { id: "p-1m-1", periods: [1], category: "geral", description: "Fixa olhar" },
  { id: "p-1m-2", periods: [1], category: "geral", description: "Segue objetos lentamente" },
  { id: "p-1m-3", periods: [1], category: "motor", description: "Sustenta brevemente a cabeça" },
  { id: "p-1m-4", periods: [1], category: "cognitive", description: "Atenção visual" },
  { id: "p-1m-5", periods: [1], category: "language", description: "Sons leves" },
  { id: "p-1m-6", periods: [1], category: "social", description: "Reconhece cuidadores" },
  { id: "p-1m-7", periods: [1], category: "stimulus", description: "Conversar" },
  { id: "p-1m-8", periods: [1], category: "stimulus", description: "Estímulos visuais lentos" },
  { id: "p-1m-9", periods: [1], category: "stimulus", description: "Rotina previsível" },

  // ================= 2 MESES =================
  { id: "p-2m-1", periods: [2], category: "geral", description: "Sorriso social" },
  { id: "p-2m-2", periods: [2], category: "geral", description: "Sons além do choro" },
  { id: "p-2m-3", periods: [2], category: "motor", description: "Levanta cabeça em prono" },
  { id: "p-2m-4", periods: [2], category: "cognitive", description: "Observa pessoas" },
  { id: "p-2m-5", periods: [2], category: "language", description: "Vocalizações" },
  { id: "p-2m-6", periods: [2], category: "social", description: "Interação com cuidadores" },
  { id: "p-2m-7", periods: [2], category: "stimulus", description: "Imitar sons" },
  { id: "p-2m-8", periods: [2], category: "stimulus", description: "Sorrir e conversar" },
  { id: "p-2m-9", periods: [2], category: "stimulus", description: "Tummy time diário" },

  // ================= 3 MESES =================
  { id: "p-3m-1", periods: [3], category: "geral", description: "Segue objetos" },
  { id: "p-3m-2", periods: [3], category: "geral", description: "Interage mais" },
  { id: "p-3m-3", periods: [3], category: "motor", description: "Controle cervical melhor" },
  { id: "p-3m-4", periods: [3], category: "cognitive", description: "Atenção sustentada" },
  { id: "p-3m-5", periods: [3], category: "language", description: "Sons variados" },
  { id: "p-3m-6", periods: [3], category: "social", description: "Responde ao estímulo" },
  { id: "p-3m-7", periods: [3], category: "stimulus", description: "Brinquedos coloridos" },
  { id: "p-3m-8", periods: [3], category: "stimulus", description: "Conversas frequentes" },

  // ================= 4 MESES =================
  { id: "p-4m-1", periods: [4], category: "geral", description: "Ri" },
  { id: "p-4m-2", periods: [4], category: "geral", description: "Segura objetos" },
  { id: "p-4m-3", periods: [4], category: "motor", description: "Sustenta cabeça firme" },
  { id: "p-4m-4", periods: [4], category: "motor", description: "Apoio em antebraço" },
  { id: "p-4m-5", periods: [4], category: "cognitive", description: "Interesse pelas mãos" },
  { id: "p-4m-6", periods: [4], category: "language", description: "Sons “ah/oo”" },
  { id: "p-4m-7", periods: [4], category: "social", description: "Busca interação" },
  { id: "p-4m-8", periods: [4], category: "stimulus", description: "Oferecer brinquedos" },
  { id: "p-4m-9", periods: [4], category: "stimulus", description: "Estímulo visual e sonoro" },

  // ================= 5 MESES =================
  { id: "p-5m-1", periods: [5], category: "geral", description: "Rola parcialmente" },
  { id: "p-5m-2", periods: [5], category: "motor", description: "Coordenação melhor" },
  { id: "p-5m-3", periods: [5], category: "cognitive", description: "Exploração oral" },
  { id: "p-5m-4", periods: [5], category: "language", description: "Balbucio inicial" },
  { id: "p-5m-5", periods: [5], category: "social", description: "Reconhece pessoas" },
  { id: "p-5m-6", periods: [5], category: "stimulus", description: "Incentivar rolar" },
  { id: "p-5m-7", periods: [5], category: "stimulus", description: "Brinquedos seguros" },

  // ================= 6 MESES =================
  { id: "p-6m-1", periods: [6], category: "geral", description: "Senta com apoio" },
  { id: "p-6m-2", periods: [6], category: "geral", description: "Rola" },
  { id: "p-6m-3", periods: [6], category: "motor", description: "Apoio em braços" },
  { id: "p-6m-4", periods: [6], category: "cognitive", description: "Explora objetos" },
  { id: "p-6m-5", periods: [6], category: "language", description: "Sons repetitivos" },
  { id: "p-6m-6", periods: [6], category: "social", description: "Ri alto" },
  { id: "p-6m-7", periods: [6], category: "stimulus", description: "Brincar sentado" },
  { id: "p-6m-8", periods: [6], category: "stimulus", description: "Introdução alimentar responsiva" },

  // ================= 7–8 MESES =================
  { id: "p-78m-1", periods: [7, 8], category: "geral", description: "Senta sem apoio" },
  { id: "p-78m-2", periods: [7, 8], category: "geral", description: "Início engatinhar" },
  { id: "p-78m-3", periods: [7, 8], category: "motor", description: "Equilíbrio" },
  { id: "p-78m-4", periods: [7, 8], category: "cognitive", description: "Permanência do objeto inicial" },
  { id: "p-78m-5", periods: [7, 8], category: "language", description: "Balbucio (“ba/da”)" },
  { id: "p-78m-6", periods: [7, 8], category: "social", description: "Ansiedade de separação" },
  { id: "p-78m-7", periods: [7, 8], category: "stimulus", description: "Brincadeiras de esconder" },
  { id: "p-78m-8", periods: [7, 8], category: "stimulus", description: "Incentivar deslocamento" },

  // ================= 9 MESES =================
  { id: "p-9m-1", periods: [9], category: "geral", description: "Senta sozinho" },
  { id: "p-9m-2", periods: [9], category: "geral", description: "Transfere objetos" },
  { id: "p-9m-3", periods: [9], category: "motor", description: "Coordenação manual" },
  { id: "p-9m-4", periods: [9], category: "cognitive", description: "Procura objetos escondidos" },
  { id: "p-9m-5", periods: [9], category: "language", description: "Balbucio repetitivo" },
  { id: "p-9m-6", periods: [9], category: "social", description: "Estranha pessoas" },
  { id: "p-9m-7", periods: [9], category: "stimulus", description: "“Cadê-achou”" },
  { id: "p-9m-8", periods: [9], category: "stimulus", description: "Estímulo motor ativo" },

  // ================= 10–11 MESES =================
  { id: "p-1011m-1", periods: [10, 11], category: "geral", description: "Engatinha" },
  { id: "p-1011m-2", periods: [10, 11], category: "geral", description: "Fica em pé com apoio" },
  { id: "p-1011m-3", periods: [10, 11], category: "motor", description: "Transição postural" },
  { id: "p-1011m-4", periods: [10, 11], category: "cognitive", description: "Imitação" },
  { id: "p-1011m-5", periods: [10, 11], category: "language", description: "Sons com intenção" },
  { id: "p-1011m-6", periods: [10, 11], category: "social", description: "Responde ao nome" },
  { id: "p-1011m-7", periods: [10, 11], category: "stimulus", description: "Brincar de imitação" },
  { id: "p-1011m-8", periods: [10, 11], category: "stimulus", description: "Estímulo à mobilidade" },

  // ================= 12 MESES =================
  { id: "p-12m-1", periods: [12], category: "geral", description: "Fica em pé / inicia marcha" },
  { id: "p-12m-2", periods: [12], category: "geral", description: "Aponta" },
  { id: "p-12m-3", periods: [12], category: "motor", description: "Pinça fina" },
  { id: "p-12m-4", periods: [12], category: "cognitive", description: "Permanência do objeto" },
  { id: "p-12m-5", periods: [12], category: "language", description: "1–2 palavras" },
  { id: "p-12m-6", periods: [12], category: "social", description: "Interação ativa" },
  { id: "p-12m-7", periods: [12], category: "stimulus", description: "Nomear objetos" },
  { id: "p-12m-8", periods: [12], category: "stimulus", description: "Incentivar andar" },

  // ================= 13–15 MESES =================
  { id: "p-1315m-1", periods: [13, 14, 15], category: "geral", description: "Anda sozinho" },
  { id: "p-1315m-2", periods: [13, 14, 15], category: "geral", description: "Aponta" },
  { id: "p-1315m-3", periods: [13, 14, 15], category: "motor", description: "Coordenação" },
  { id: "p-1315m-4", periods: [13, 14, 15], category: "cognitive", description: "Uso funcional de objetos" },
  { id: "p-1315m-5", periods: [13, 14, 15], category: "language", description: "3+ palavras" },
  { id: "p-1315m-6", periods: [13, 14, 15], category: "social", description: "Imitação" },
  { id: "p-1315m-7", periods: [13, 14, 15], category: "stimulus", description: "Brincadeiras funcionais" },
  { id: "p-1315m-8", periods: [13, 14, 15], category: "stimulus", description: "Incentivar autonomia" },

  // ================= 16–18 MESES =================
  { id: "p-1618m-1", periods: [16, 17, 18], category: "geral", description: "Corre" },
  { id: "p-1618m-2", periods: [16, 17, 18], category: "geral", description: "Usa colher" },
  { id: "p-1618m-3", periods: [16, 17, 18], category: "motor", description: "Equilíbrio" },
  { id: "p-1618m-4", periods: [16, 17, 18], category: "cognitive", description: "Faz-de-conta" },
  { id: "p-1618m-5", periods: [16, 17, 18], category: "language", description: "Expansão vocabular" },
  { id: "p-1618m-6", periods: [16, 17, 18], category: "social", description: "Interação social" },
  { id: "p-1618m-7", periods: [16, 17, 18], category: "stimulus", description: "Brincadeiras simbólicas" },
  { id: "p-1618m-8", periods: [16, 17, 18], category: "stimulus", description: "Nomear ações" },

  // ================= 19–21 MESES =================
  { id: "p-1921m-1", periods: [19, 20, 21], category: "geral", description: "Combina palavras" },
  { id: "p-1921m-2", periods: [19, 20, 21], category: "motor", description: "Coordenação melhor" },
  { id: "p-1921m-3", periods: [19, 20, 21], category: "cognitive", description: "Imitação complexa" },
  { id: "p-1921m-4", periods: [19, 20, 21], category: "language", description: "Vocabulário crescente" },
  { id: "p-1921m-5", periods: [19, 20, 21], category: "social", description: "Aponta para compartilhar" },
  { id: "p-1921m-6", periods: [19, 20, 21], category: "stimulus", description: "Conversas simples" },
  { id: "p-1921m-7", periods: [19, 20, 21], category: "stimulus", description: "Perguntas" },

  // ================= 22–24 MESES =================
  { id: "p-2224m-1", periods: [22, 23, 24], category: "geral", description: "Frases de 2 palavras" },
  { id: "p-2224m-2", periods: [22, 23, 24], category: "geral", description: "Corre e chuta" },
  { id: "p-2224m-3", periods: [22, 23, 24], category: "motor", description: "Coordenação global" },
  { id: "p-2224m-4", periods: [22, 23, 24], category: "cognitive", description: "Resolução de problemas simples" },
  { id: "p-2224m-5", periods: [22, 23, 24], category: "language", description: "Nomeia objetos" },
  { id: "p-2224m-6", periods: [22, 23, 24], category: "social", description: "Imita adultos" },
  { id: "p-2224m-7", periods: [22, 23, 24], category: "stimulus", description: "Leitura diária" },
  { id: "p-2224m-8", periods: [22, 23, 24], category: "stimulus", description: "Brincadeiras ativas" },
  { id: "p-2224m-9", periods: [22, 23, 24], category: "stimulus", description: "Nomear emoções" },

  // ================= 30 MESES (2a6m) =================
  { id: "p-30m-1", periods: [30], category: "cognitive", description: "Resolve problemas simples" },
  { id: "p-30m-2", periods: [30], category: "cognitive", description: "Brinca de faz-de-conta" },
  { id: "p-30m-3", periods: [30], category: "language", description: "~50 palavras" },
  { id: "p-30m-4", periods: [30], category: "language", description: "Frases com ação (“quer água”)" },
  { id: "p-30m-5", periods: [30], category: "motor", description: "Corre melhor" },
  { id: "p-30m-6", periods: [30], category: "motor", description: "Sobe em móveis" },
  { id: "p-30m-7", periods: [30], category: "social", description: "Brinca ao lado de outras crianças" },
  { id: "p-30m-8", periods: [30], category: "stimulus", description: "Pergunte “o que é isso?”" },
  { id: "p-30m-9", periods: [30], category: "stimulus", description: "Brincadeiras simbólicas" },
  { id: "p-30m-10", periods: [30], category: "stimulus", description: "Dar pequenas escolhas" },
  { id: "p-30m-11", periods: [30], category: "stimulus", description: "Incentivar autonomia" },

  // ================= 36 MESES (3 ANOS) =================
  { id: "p-36m-1", periods: [36], category: "cognitive", description: "Entende regras simples" },
  { id: "p-36m-2", periods: [36], category: "cognitive", description: "Brinca de faz-de-conta elaborado" },
  { id: "p-36m-3", periods: [36], category: "language", description: "Frases completas" },
  { id: "p-36m-4", periods: [36], category: "language", description: "Conversa simples" },
  { id: "p-36m-5", periods: [36], category: "motor", description: "Sobe escadas alternando pés" },
  { id: "p-36m-6", periods: [36], category: "motor", description: "Corre com coordenação" },
  { id: "p-36m-7", periods: [36], category: "social", description: "Brinca com outras crianças" },
  { id: "p-36m-8", periods: [36], category: "social", description: "Imita adultos" },
  { id: "p-36m-9", periods: [36], category: "stimulus", description: "Contar histórias" },
  { id: "p-36m-10", periods: [36], category: "stimulus", description: "Jogos simples (memória, encaixe)" },
  { id: "p-36m-11", periods: [36], category: "stimulus", description: "Brincadeiras em grupo" },
  { id: "p-36m-12", periods: [36], category: "stimulus", description: "Nomear emoções" },

  // ================= 42 MESES (3a6m) =================
  { id: "p-42m-1", periods: [42], category: "cognitive", description: "Sequência de ideias simples" },
  { id: "p-42m-2", periods: [42], category: "cognitive", description: "Reconhece cores" },
  { id: "p-42m-3", periods: [42], category: "language", description: "Faz perguntas (“por quê?”)" },
  { id: "p-42m-4", periods: [42], category: "language", description: "Conta pequenas histórias" },
  { id: "p-42m-5", periods: [42], category: "motor", description: "Pula com os dois pés" },
  { id: "p-42m-6", periods: [42], category: "motor", description: "Melhor equilíbrio" },
  { id: "p-42m-7", periods: [42], category: "social", description: "Interage mais" },
  { id: "p-42m-8", periods: [42], category: "social", description: "Começa a cooperar" },
  { id: "p-42m-9", periods: [42], category: "stimulus", description: "Jogos de sequência" },
  { id: "p-42m-10", periods: [42], category: "stimulus", description: "Perguntas abertas" },
  { id: "p-42m-11", periods: [42], category: "stimulus", description: "Desenho e pintura" },
  { id: "p-42m-12", periods: [42], category: "stimulus", description: "Brincadeiras com regras" },

  // ================= 48 MESES (4 ANOS) =================
  { id: "p-48m-1", periods: [48], category: "cognitive", description: "Imagina histórias" },
  { id: "p-48m-2", periods: [48], category: "cognitive", description: "Organiza ideias" },
  { id: "p-48m-3", periods: [48], category: "language", description: "Fala clara" },
  { id: "p-48m-4", periods: [48], category: "language", description: "Conta histórias completas" },
  { id: "p-48m-5", periods: [48], category: "motor", description: "Pula em um pé" },
  { id: "p-48m-6", periods: [48], category: "motor", description: "Coordenação refinada" },
  { id: "p-48m-7", periods: [48], category: "social", description: "Brinca cooperativamente" },
  { id: "p-48m-8", periods: [48], category: "social", description: "Expressa sentimentos" },
  { id: "p-48m-9", periods: [48], category: "stimulus", description: "Teatro/brincadeira simbólica" },
  { id: "p-48m-10", periods: [48], category: "stimulus", description: "Conversas mais profundas" },
  { id: "p-48m-11", periods: [48], category: "stimulus", description: "Atividades motoras (pular, correr)" },
  { id: "p-48m-12", periods: [48], category: "stimulus", description: "Jogos com regras" }
];
