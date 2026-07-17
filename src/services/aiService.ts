import { Child, Measurement, Vaccine, ChildMilestone, Exam, FoodLog } from '../types';
import { MILESTONES_DATA } from '../data/milestones';
import { PREMIUM_MILESTONES_DATA } from '../data/premiumMilestones';
import { GoogleGenAI } from "@google/genai";

export const ARTICLE_GENERATOR_PROMPT = `
Você é a "Dra. Flávia", a Pediatra Virtual e o "Cérebro" do aplicativo RotinaPed.
Sua tarefa é escrever um artigo educativo e acolhedor para a Biblioteca Médica do aplicativo.

O RotinaPed é um assistente completo para mães e pais, focado em:
- Controle de Vacinas (SUS e Particular)
- Acompanhamento de Crescimento (Peso, Altura, IMC)
- Marcos de Desenvolvimento Infantil
- Registro de Alimentação e Introdução Alimentar
- Central de Exames e Lembretes Médicos

DIRETRIZES DO ARTIGO:
1. Tom: Educativo, carinhoso, empático e baseado em evidências científicas (SBP/OMS).
2. Formato: O artigo deve ser escrito em HTML simples (usando tags <h3> para subtítulos, <strong> para negrito, <ul>/<li> para listas).
3. Estilo: Use emoticons de forma estratégica e moderada (apenas 1 ou 2 por seção importante) para tornar a leitura leve, mas mantendo a autoridade médica.
4. Conteúdo: Desenvolva o tema profundamente, trazendo dicas práticas e quando os pais devem se preocupar (sinais de alerta).
5. Público: Mães e pais que buscam orientações seguras e práticas para o dia a dia.

Retorne APENAS o código HTML do corpo do artigo, sem tags <html>, <body> ou Markdown code blocks.
`;

export async function generateArticleContent(title: string, summary: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chave de API não encontrada.');

  const aiClient = new GoogleGenAI({ apiKey });

  const prompt = `
    TÍTULO DO ARTIGO: ${title}
    RESUMO DO TEMA: ${summary}

    Por favor, escreva o conteúdo completo deste artigo seguindo as diretrizes da Dra. Flávia e do RotinaPed.
  `;

  const response = await (aiClient as any).models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: ARTICLE_GENERATOR_PROMPT,
      temperature: 0.7,
    },
  });

  return response.text || "";
}

export const AI_PED_SYSTEM_PROMPT = `
Você é a "Dra. Flávia", a Pediatra Virtual e o "Cérebro" do aplicativo RotinaPed.
Como o cérebro integrado do app, você é totalmente consciente das funcionalidades, telas, menus e do corpo de dados registrados para a criança. Seu tom é acolhedor, empático, didático e altamente qualificado tecnicamente, seguindo rigorosamente as diretrizes da Sociedade Brasileira de Pediatria (SBP) e da OMS.

O seu objetivo principal é dar orientações às mães/pais baseando-se estritamente no "Dossiê do Filho" fornecido pelas variáveis do aplicativo e, se necessário, orientar os usuários a navegarem no próprio aplicativo para registrar ou consultar dados adicionais.

DIRETRIZES DE ORIENTAÇÃO DO APLICATIVO (O seu "Corpo"):
Caso o usuário precise registrar, consultar ou editar algo, você deve instruir o usuário de forma precisa a acessar os menus ou guias do RotinaPed:
- Na barra de navegação inferior (Menus Principais):
  * **Início** (ícone Home): Dá uma visão geral do dia, dicas rápidas, resumos e alertas automáticos de próximas vacinas.
  * **Vacinas** (ícone Seringa): Contém a caderneta completa do SUS e da rede particular. Permite ler e importar a caderneta física via foto, verificar doses pendentes e registrar novas vacinas aplicadas.
  * **Crescimento** (ícone Régua): Onde estão os gráficos de Peso, Altura, Perímetro Cefálico e IMC (Índice de Massa Corporal). Clique no botão "+ Adicionar Medição" para registrar uma nova medição.
  * **Marcos** (ícone Bebê): Onde os pais acompanham o desenvolvimento motor, cognitivo, de linguagem e social por idade. Eles podem marcar quais marcos a criança já conquistou!
  * **Mais** (ícone Grade/LayoutGrid): Abre os recursos extras de controle.
- Subtelas localizadas no menu **Mais** (Menu adicional):
  * **Alimentação e Nutrição** (ícone Garfo/Faca - Utensils): Registro detalhado de introdução alimentar e refeições (papinhas amassadas, sólidos, fórmula, peito), além do checklist de habilidades (como aceitar pedaços, usar pinça, mastigar bem). *Nota: os logs de amamentação mais simples foram incorporados aqui como histórico nutricional geral.*
  * **Lembretes e Rotina** (ícone Sino - Bell): Perfeito para agendar consultas, lembrete de vitaminas (como Ferro e Vitamina D) ou remédios pontuais.
  * **Central de Exames** (ícone Pasta - FolderOpen): Local para agrupar exames por categorias (laboratoriais, imagens, triagens), registrar datas, resultados e até acompanhar a pressão arterial.
  * **Biblioteca Médica** (ícone Livro - BookOpen): Artigos confiáveis de pediatras sobre febre, lavagem nasal, sono, alimentação e cuidados.
  * **Gerenciar Perfis** (ícone Usuário - UserCircle): Onde os pais podem cadastrar novos filhos ou alternar a criança ativa no sistema.
  * **Canais da Comunidade** (ícone Usuários - Users): Sala de conversas com outras mães e pais, separada por tópicos infantis.

REGRAS DE CONDUTA CONTEXTUAL:
1. Faça uso inteligente dos dados fornecidos no "Dossiê do Filho". Cite-os diretamente! Exemplo: "Notei que a última pesagem do(a) [Nome] foi em [Data] pesando [Peso]. Isso é excelente..." ou "Identifiquei que a vacina BCG já está registrada como aplicada em [Data]".
2. Caso o usuário peça orientações sobre alimentação, desenvolvimento ou vacinas, mostre que você sabe quais dados estão salvos e dê sugestões complementares. Se ele ainda não tiver medido o peso ou a altura recentemente (ou registrado refeições nos últimos 30 dias), recomende que ele o faça clicando nas telas respectivas do aplicativo!
3. Se houver qualquer dúvida médica sobre termos difíceis ou vacinas urgentes, explique de forma carinhosa, baseada em ciência, sem usar termos exagerados ou pseudociência.
4. **Segurança em Primeiro Lugar:** Se houver menção a sinais de perigo (febre acima de 38.5°C persistente, prostração, vômitos em jato, falta de ar, afogamento), use avisos claros e recomende que procurem assistência médica imediatamente ou pronto-socorro. Nunca prescreva dosagens ou receitas de medicamentos controlados.
`;

export interface DossierData {
  measurements: Measurement[];
  vaccines: Vaccine[];
  milestones: ChildMilestone[];
  exams: Exam[];
  foodLogs: FoodLog[];
  foodChecklist?: Record<string, { acceptsPieces: boolean; usesPincer: boolean; takesToMouth: boolean; chewsWell: boolean; }>;
}

export function generateChildDossier(child: Child, data: DossierData) {
  const childMeasurements = data.measurements.filter(m => m.childId === child.id);
  const childVaccines = data.vaccines.filter(v => v.childId === child.id);
  const childExams = data.exams.filter(e => e.childId === child.id);
  const childFood = data.foodLogs.filter(f => f.childId === child.id);

  // Calcula idade exata em meses e anos para o dossiê da IA
  const birth = new Date(child.birthDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  const years = Math.floor(monthsDiff / 12);
  const remainingMonths = monthsDiff % 12;
  const idadeFormatada = years > 0 
    ? `${years} ano(s) e ${remainingMonths} mês(es)` 
    : `${remainingMonths} mês(es)`;

  // Histórico completo de medições de crescimento (até as últimas 15 registros para não exceder limites de contexto)
  const historicoCrescimento = [...childMeasurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-15)
    .map(m => ({
      data: m.date,
      peso: m.weight ? `${m.weight}kg` : 'mudar no futuro/não informado',
      altura: m.height ? `${m.height}cm` : 'não informado',
      perimetro_cefalico: m.headCircumference ? `${m.headCircumference}cm` : 'não informado',
      imc: m.imc ? m.imc.toFixed(1) : 'não calculado',
      pressao_arterial: m.bloodPressure || 'não registrada',
      ao_nascer: m.isBirth ? 'Sim' : 'Não'
    }));

  // Histórico completo de Vacinação: Aplicadas vs Pendentes
  const vacinasAplicadas = childVaccines
    .filter(v => v.status === 'completed')
    .map(v => ({
      nome: v.name,
      dose: v.dose || 'Dose Única',
      data_aplicacao: v.date,
      local_sugerido: v.facilityType || 'SUS/Particular'
    }));

  const vacinasPendentes = childVaccines
    .filter(v => v.status === 'pending')
    .map(v => ({
      nome: v.name,
      dose: v.dose || 'Dose recomendada',
      local_sugerido: v.facilityType || 'SUS/Particular'
    }));

  // Últimos 20 Marcos de Desenvolvimento Registrados (concluídos e pendentes com descrições das tabelas)
  const childMilestones = data.milestones.filter(m => m.childId === child.id);
  const mapeamentoMarcos = childMilestones
    .map(cm => {
      const itemMetadados = MILESTONES_DATA.find(item => item.id === cm.milestoneItemId) 
        || PREMIUM_MILESTONES_DATA.find(item => item.id === cm.milestoneItemId);
      
      const pMonths = itemMetadados 
        ? ('periodMonths' in itemMetadados ? itemMetadados.periodMonths : itemMetadados.periods?.[0] || 0)
        : 0;

      return {
        descricao: itemMetadados?.description || 'Marco de Desenvolvimento',
        categoria: itemMetadados?.category || 'geral',
        periodo_meses: pMonths,
        concluido: cm.completed ? 'Sim' : 'Pendente',
        data_conclusao: cm.completionDate || '-'
      };
    })
    .sort((a, b) => {
      if (a.concluido === 'Sim' && b.concluido === '-') return -1;
      if (a.concluido === '-' && b.concluido === 'Sim') return 1;
      return b.periodo_meses - a.periodo_meses;
    })
    .slice(0, 20);

  // Informações de Alimentação e Nutrição dos últimos 30 dias (limitado a 30 entradas recentes por segurança de contexto)
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  
  const registrosAlimentacao30Dias = [...childFood]
    .filter(f => {
      const dataLog = new Date(f.date);
      return dataLog >= trintaDiasAtras;
    })
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
    .slice(0, 30)
    .map(f => ({
      data: f.date,
      hora: f.time,
      tipo_refeicao: f.type === 'breast' ? 'Peito' : f.type === 'bottle' ? 'Mamadeira/Fórmula' : f.type === 'baby_food' ? 'Papinha Amassada' : 'Alimentos Sólidos',
      quantidade_ou_volume: f.milkVolume ? `${f.milkVolume}ml` : (f.amount || 'normal'),
      aceitacao: f.acceptance === 'good' ? 'Boa aceitação' : f.acceptance === 'medium' ? 'Aceitação regular' : 'Recusou o alimento',
      detalhes_nutrientes: {
         carboidratos: f.carb ? 'Sim' : 'Não',
         proteina: f.protein ? 'Sim' : 'Não',
         leguminosas: f.legume ? 'Sim' : 'Não',
         vegetais: f.vegetables ? 'Sim' : 'Não',
         frutas: f.fruit ? 'Sim' : 'Não',
         gorduras_boas: f.fat ? 'Sim' : 'Não',
         carnes: f.meat ? 'Sim' : 'Não',
         feijao: f.beans ? 'Sim' : 'Não',
         ovos: f.egg ? 'Sim' : 'Não',
         vitamina_c: f.hasVitaminC ? 'Sim' : 'Não'
      },
      tempo_telinhas_usado: f.noScreens ? 'Livre de telas' : 'Com telinhas ligadas',
      espectador_na_mesa: f.atTable ? 'Comeu na mesa' : 'Fora da mesa',
      autonomia_estimulada: f.autonomy ? 'Estimulado autonomia/BLW' : 'Alimentado por cuidador',
      contagem_ultraprocessados: f.ultraprocessedCount
    }));

  // Checklist de introdução alimentar da criança ativa
  const checklistAlimentar = data.foodChecklist && data.foodChecklist[child.id]
    ? {
        aceita_pedacos: data.foodChecklist[child.id].acceptsPieces ? 'Sim' : 'Ainda não',
        faz_movimento_pinça: data.foodChecklist[child.id].usesPincer ? 'Sim' : 'Ainda não',
        leva_alimento_a_boca: data.foodChecklist[child.id].takesToMouth ? 'Sim' : 'Ainda não',
        mastiga_bem: data.foodChecklist[child.id].chewsWell ? 'Sim' : 'Ainda não'
      }
    : 'Nenhuma informação registrada no checklist de marcos alimentares';

  // Histórico completo de exames registrados
  const historicoExames = childExams.map(e => ({
    nome: e.name,
    categoria: e.category,
    data_coleta: e.date,
    data_resultado: e.resultDate || 'Não informado',
    status: e.status || 'Pendente',
    notas_pais: (e as any).notes || 'Nenhuma nota registrada'
  }));

  return {
    bio: {
      nome: child.name,
      idade_meses: monthsDiff,
      idade_formatada: idadeFormatada,
      data_nascimento: child.birthDate,
      genero: child.gender === 'male' ? 'Menino' : 'Menina',
      peso_nascimento: child.birthWeight ? `${child.birthWeight}g` : 'Não informado',
      altura_nascimento: child.birthHeight ? `${child.birthHeight}cm` : 'Não informado',
      alergias_conhecidas: child.allergies || 'Nenhuma alergia médica registrada',
      observacoes_diagnostico_saude: child.observations || 'Nenhuma'
    },
    crescimento_recente: historicoCrescimento,
    vacinas: {
      todas_as_aplicadas: vacinasAplicadas,
      todas_as_pendentes: vacinasPendentes
    },
    exames: historicoExames,
    marcos_recentes: mapeamentoMarcos,
    alimentacao_nutricao: {
      checklist_habilidades: checklistAlimentar,
      logs_ultimos_30_dias: registrosAlimentacao30Dias
    }
  };
}
