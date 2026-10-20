import {
  AppSettings,
  ClientProject,
  MarketingSnippet,
  Note,
  NoteColor,
  PriorityLevel,
  Publication,
  SocialNetwork,
  Task,
  TaskListType,
} from '../types';

export const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  bgLight: string;
  bgCard: string;
  borderLight: string;
  dot: string;
}> = [
  {
    id: 'yellow',
    label: 'Amarelo',
    bgLight: 'bg-[#FFF59D] dark:bg-[#423815]',
    bgCard: 'bg-[#FFF59D] dark:bg-[#3B3212] text-slate-900 dark:text-amber-50',
    borderLight: 'border-[#FDE047] dark:border-amber-700/50',
    dot: 'bg-[#FACC15]',
  },
  {
    id: 'blue',
    label: 'Azul',
    bgLight: 'bg-[#DBEAFE] dark:bg-[#172A46]',
    bgCard: 'bg-[#DBEAFE] dark:bg-[#172A46] text-slate-900 dark:text-sky-50',
    borderLight: 'border-[#93C5FD] dark:border-sky-700/50',
    dot: 'bg-[#60A5FA]',
  },
  {
    id: 'green',
    label: 'Verde',
    bgLight: 'bg-[#DCFCE7] dark:bg-[#143325]',
    bgCard: 'bg-[#DCFCE7] dark:bg-[#143325] text-slate-900 dark:text-emerald-50',
    borderLight: 'border-[#86EFAC] dark:border-emerald-700/50',
    dot: 'bg-[#4ADE80]',
  },
  {
    id: 'lavender',
    label: 'Lavanda',
    bgLight: 'bg-[#EDE9FE] dark:bg-[#291D47]',
    bgCard: 'bg-[#EDE9FE] dark:bg-[#291D47] text-slate-900 dark:text-violet-50',
    borderLight: 'border-[#C4B5FD] dark:border-violet-700/50',
    dot: 'bg-[#A78BFA]',
  },
  {
    id: 'coral',
    label: 'Coral',
    bgLight: 'bg-[#FFE4E6] dark:bg-[#431924]',
    bgCard: 'bg-[#FFE4E6] dark:bg-[#431924] text-slate-900 dark:text-rose-50',
    borderLight: 'border-[#FDA4AF] dark:border-rose-700/50',
    dot: 'bg-[#FB7185]',
  },
  {
    id: 'graphite',
    label: 'Grafite',
    bgLight: 'bg-[#E2E8F0] dark:bg-[#262F3F]',
    bgCard: 'bg-[#E2E8F0] dark:bg-[#262F3F] text-slate-900 dark:text-slate-100',
    borderLight: 'border-[#CBD5E1] dark:border-slate-600',
    dot: 'bg-[#94A3B8]',
  },
  {
    id: 'white',
    label: 'Branco',
    bgLight: 'bg-white dark:bg-[#1E293B]',
    bgCard: 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100',
    borderLight: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-white border border-slate-300',
  },
];

export const SOCIAL_NETWORKS: Array<{
  id: SocialNetwork;
  label: string;
  dotColor: string;
}> = [
  { id: 'Instagram', label: 'Instagram', dotColor: '#E11D48' },
  { id: 'Facebook', label: 'Facebook', dotColor: '#2563EB' },
  { id: 'WhatsApp', label: 'WhatsApp', dotColor: '#16A34A' },
  { id: 'TikTok', label: 'TikTok', dotColor: '#DB2777' },
  { id: 'Outra', label: 'Outra', dotColor: '#64748B' },
];

export const NOTE_TEMPLATES: Array<{
  id: string;
  label: string;
  title: string;
  color: NoteColor;
  content: string;
  checklist: Array<{ text: string; completed: boolean }>;
  tags: string[];
}> = [
  {
    id: 'tpl-simples',
    label: 'Nota simples',
    title: '',
    color: 'yellow',
    content: '',
    checklist: [],
    tags: [],
  },
  {
    id: 'tpl-checklist',
    label: 'Checklist',
    title: 'Lista de Verificação',
    color: 'white',
    content: 'Itens prioritários para acompanhamento:',
    checklist: [
      { text: 'Definir prioridades do dia', completed: false },
      { text: 'Revisar entregas pendentes', completed: false },
      { text: 'Validar próximos passos', completed: false },
    ],
    tags: ['checklist'],
  },
  {
    id: 'tpl-roteiro',
    label: 'Roteiro de vídeo',
    title: 'Roteiro: [Tema do Vídeo]',
    color: 'yellow',
    content:
      'GANCHO (0-3s):\n- Frase de impacto inicial para prender a atenção\n\nDESENVOLVIMENTO:\n- Ponto 1:\n- Ponto 2:\n- Exemplo prático:\n\nCHAMADA PARA AÇÃO (CTA):\n- Comente / Salve / Envie no direct',
    checklist: [
      { text: 'Validar gancho dos 3 primeiros segundos', completed: false },
      { text: 'Separar B-rolls e legendas dinâmicas', completed: false },
    ],
    tags: ['roteiro', 'reels'],
  },
  {
    id: 'tpl-briefing',
    label: 'Briefing de cliente',
    title: 'Briefing de Campanha / Demanda',
    color: 'blue',
    content:
      'Objetivo principal:\nPúblico-alvo:\nMensagem-chave:\nFormato / Rede social:\nPrazo de entrega:\nReferências visuais:',
    checklist: [
      { text: 'Alinhar expectativas com o cliente', completed: false },
      { text: 'Definir cronograma de aprovação', completed: false },
    ],
    tags: ['briefing', 'cliente'],
  },
  {
    id: 'tpl-reuniao',
    label: 'Ata de reunião',
    title: 'Reunião de Alinhamento',
    color: 'green',
    content:
      'Participantes:\n\nPrincipais pontos discutidos:\n- \n- \n\nDecisões tomadas:\n- ',
    checklist: [
      { text: 'Enviar resumo e próximos passos', completed: false },
      { text: 'Agendar retorno de acompanhamento', completed: false },
    ],
    tags: ['reuniao', 'alinhamento'],
  },
  {
    id: 'tpl-campanha',
    label: 'Checklist de Lançamento',
    title: 'Checklist de Publicação / Campanha',
    color: 'lavender',
    content:
      'Conferência final dos materiais criativos, copys e links antes de programar a campanha.',
    checklist: [
      { text: 'Revisar ortografia da arte e da legenda', completed: false },
      { text: 'Testar links da bio / WhatsApp', completed: false },
      { text: 'Programar publicação no horário de pico', completed: false },
    ],
    tags: ['campanha', 'checklist'],
  },
];

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOffsetDateISO(daysOffset: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysOffset);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const INITIAL_CLIENTS: ClientProject[] = [
  {
    id: 'client-prime',
    name: 'Prime Cursos',
    color: '#D97706',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Ideias para a Semana',
    content:
      '- Gravar vídeo curto sobre novos cursos da Prime Cursos\n- Atualizar cronograma de posts da semana\n- Revisar métricas do mês passado\n- Planejar novas campanhas de engajamento',
    color: 'yellow',
    pinned: true,
    floating: false,
    floatingPos: { x: 84, y: 110 },
    checklist: [
      { id: 'ck-w1', text: 'Roteirizar Reels da semana', completed: true },
      { id: 'ck-w2', text: 'Aprovar artes com Prime Cursos', completed: false },
    ],
    links: [],
    tags: ['planejamento', 'semana'],
    attachments: [],
    clientId: 'client-prime',
    archived: false,
    deletedAt: null,
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Post-its na área de trabalho',
    content:
      'Você sabia? Clique em "Fixar na área de trabalho" dentro de qualquer nota para destacá-la como um post-it flutuante sempre visível enquanto você trabalha na Next Marketing.',
    color: 'blue',
    pinned: true,
    floating: false,
    floatingPos: { x: 390, y: 140 },
    checklist: [
      { id: 'ck-1', text: 'Testar post-it flutuante', completed: true },
      { id: 'ck-2', text: 'Experimentar Assistente de IA na nota', completed: false },
    ],
    links: [],
    tags: ['dica'],
    attachments: [],
    clientId: 'client-prime',
    archived: false,
    deletedAt: null,
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Metas do Mês',
    content:
      '1. Publicar 12 conteúdos estratégicos para Prime Cursos\n2. Aumentar retenção nos Reels e TikTok\n3. Padronizar relatórios mensais de performance',
    color: 'green',
    pinned: false,
    floating: false,
    checklist: [],
    links: [],
    tags: ['metas'],
    attachments: [],
    clientId: 'client-prime',
    archived: false,
    deletedAt: null,
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'note-4',
    title: 'Referências de Roteiros e Vídeos',
    content:
      'Anotar ganchos visuais dos primeiros 3 segundos para vídeos educativos da Prime Cursos sobre capacitação e certificações.',
    color: 'lavender',
    pinned: false,
    floating: false,
    checklist: [],
    links: [],
    tags: ['roteiros', 'vídeo'],
    attachments: [],
    clientId: 'client-prime',
    archived: false,
    deletedAt: null,
    updatedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Enviar roteiro de vídeos para Prime Cursos',
    description: 'Apresentar os temas de cursos profissionalizantes e reciclagem',
    list: 'today',
    dueDate: getTodayISO(),
    dueTime: '',
    reminder: 'none',
    repeat: 'none',
    priority: 'high',
    clientId: 'client-prime',
    completed: false,
    completedAt: null,
    pomodorosCompleted: 1,
    deletedAt: null,
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Revisar arte do carrossel no Instagram da Prime Cursos',
    description: 'Conferir alinhamento das fontes e chamada final no último slide.',
    list: 'today',
    dueDate: getTodayISO(),
    dueTime: '14:00',
    reminder: 'none',
    repeat: 'none',
    priority: 'medium',
    clientId: 'client-prime',
    completed: true,
    completedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    pomodorosCompleted: 1,
    deletedAt: null,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Apresentar relatório mensal de campanhas para Prime Cursos',
    description: 'Separar indicadores de alcance, cliques no WhatsApp e novas matrículas.',
    list: 'tomorrow',
    dueDate: getOffsetDateISO(1),
    dueTime: '15:00',
    reminder: '15m',
    repeat: 'none',
    priority: 'high',
    clientId: 'client-prime',
    completed: false,
    completedAt: null,
    pomodorosCompleted: 0,
    deletedAt: null,
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Organizar pasta de identidades visuais e ativos 2026',
    description: 'Fazer backup dos logotipos e paletas atualizadas.',
    list: 'pending',
    dueDate: getOffsetDateISO(4),
    dueTime: '',
    reminder: 'none',
    repeat: 'none',
    priority: 'low',
    clientId: 'client-prime',
    completed: false,
    completedAt: null,
    pomodorosCompleted: 0,
    deletedAt: null,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: 'Comunicado sobre novos horários de atendimento e matrículas',
    clientId: 'client-prime',
    date: getTodayISO(),
    time: '10:00',
    network: 'WhatsApp',
    stage: 'ready',
    caption:
      'Olá, alunos! Confira nossos novos horários de atendimento presencial e suporte pelo WhatsApp nesta semana na Prime Cursos.',
    hashtags: '#primecursos #cursos #atendimento',
    notes: 'Disparar na lista de transmissão de alunos.',
    attachments: [],
    referenceLinks: [],
    deletedAt: null,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pub-2',
    title: 'Carrossel: 5 Cursos em Alta para Impulsionar sua Carreira',
    clientId: 'client-prime',
    date: getOffsetDateISO(1),
    time: '18:00',
    network: 'Instagram',
    stage: 'creating',
    caption:
      'Quer se destacar no mercado este ano? Arraste para o lado e conheça 5 formações práticas da Prime Cursos para acelerar seu currículo.',
    hashtags: '#primecursos #qualificacao #carreira #cursoslivres',
    notes: 'Focar em dicas práticas para gerar salvamentos.',
    attachments: [],
    referenceLinks: [],
    deletedAt: null,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pub-3',
    title: 'Vídeo Reels: Como funciona a certificação da Prime Cursos',
    clientId: 'client-prime',
    date: getOffsetDateISO(3),
    time: '12:30',
    network: 'TikTok',
    stage: 'idea',
    caption:
      'Tire suas dúvidas em menos de 1 minuto sobre como emitir seu certificado válido em todo o Brasil na Prime Cursos!',
    hashtags: '#primecursos #certificado #cursosonline #tiktok',
    notes: 'Áudio dinâmico mostrando o passo a passo na tela.',
    attachments: [],
    referenceLinks: [],
    deletedAt: null,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  sidebarCollapsed: false,
  launchWithWindows: false,
  closeToTray: true,
  floatingTodayTasks: false,
  globalShortcuts: true,
  taskReminders: true,
  dailySummary: true,
  hideFloatingNotes: false,
  backgroundStyle: 'solid',
  customWallpaperUrl: '',
  wallpaperOverlayOpacity: 40,
  wallpaperBlur: false,
  brandLogoUrl: '',
};

export const INITIAL_SNIPPETS: MarketingSnippet[] = [
  {
    id: 'snip-1',
    title: 'Kit Hashtags — Prime Cursos (Qualificação & Carreira)',
    category: 'hashtags',
    content:
      '#primecursos #cursosonline #qualificacaoprofissional #certificado #carreira #mercadodetrabalho #curriculo #educacaoonline #aprendizado #capacitacao',
    clientId: 'client-prime',
  },
  {
    id: 'snip-2',
    title: 'Kit Hashtags — Reels & TikTok Educacional',
    category: 'hashtags',
    content:
      '#dicasdecarreira #estudos #cursosgratuitos #horascomplementares #faculdade #primeiroemprego #crescimentoprofissional #produtividade',
    clientId: 'client-prime',
  },
  {
    id: 'snip-3',
    title: 'CTAs de Alta Conversão (Instagram & Reels)',
    category: 'cta',
    content:
      '👉 Comente "CURSO" aqui embaixo que enviamos o link direto no seu Direct!\n📌 Salve este post para consultar sempre que precisar atualizar seu currículo.\n🔗 Acesse o link na bio da Prime Cursos e comece a estudar hoje mesmo!',
    clientId: 'client-prime',
  },
  {
    id: 'snip-4',
    title: 'Script de Boas-Vindas e Atendimento — WhatsApp',
    category: 'whatsapp',
    content:
      'Olá! Seja muito bem-vindo(a) à Prime Cursos! 🎓\nVi que você se interessou pelos nossos cursos online com opção de certificado válido em todo o Brasil.\nQual área você busca se aperfeiçoar hoje (Administração, Informática, Saúde, Educação ou outra)?',
    clientId: 'client-prime',
  },
  {
    id: 'snip-5',
    title: 'Links Oficiais & Utilitários — Prime Cursos / Next Marketing',
    category: 'links',
    content:
      'Site Oficial: https://www.primecursos.com.br\nCatálogo de Cursos: https://www.primecursos.com.br/cursos\nSuporte ao Aluno: https://www.primecursos.com.br/contato',
    clientId: 'client-prime',
  },
];

/**
 * Parses natural language quick task input like:
 * "Ligar para o cliente amanhã 15h !alta"
 */
export function parseSmartTaskInput(
  rawText: string,
  defaultList: TaskListType = 'today'
): {
  title: string;
  list: TaskListType;
  dueDate: string;
  dueTime: string;
  priority: PriorityLevel;
} {
  let text = rawText.trim();
  let priority: PriorityLevel = 'medium';
  let list: TaskListType = defaultList;
  let dueDate =
    defaultList === 'tomorrow'
      ? getOffsetDateISO(1)
      : defaultList === 'pending'
      ? getOffsetDateISO(3)
      : getTodayISO();
  let dueTime = '';

  // Priority parsing (!alta, !alt, !media, !med, !baixa, !bai)
  if (/\s*!(alta|alt)\b/i.test(text)) {
    priority = 'high';
    text = text.replace(/\s*!(alta|alt)\b/gi, '');
  } else if (/\s*!(media|média|med)\b/i.test(text)) {
    priority = 'medium';
    text = text.replace(/\s*!(media|média|med)\b/gi, '');
  } else if (/\s*!(baixa|bai)\b/i.test(text)) {
    priority = 'low';
    text = text.replace(/\s*!(baixa|bai)\b/gi, '');
  }

  // Date parsing (hoje / amanhã)
  if (/\b(amanhã|amanha)\b/i.test(text)) {
    list = 'tomorrow';
    dueDate = getOffsetDateISO(1);
    text = text.replace(/\b(amanhã|amanha)\b/gi, '');
  } else if (/\bhoje\b/i.test(text)) {
    list = 'today';
    dueDate = getTodayISO();
    text = text.replace(/\bhoje\b/gi, '');
  }

  // Time parsing (ex: 15h, 15h30, 15:30, às 14h)
  const timeMatch = text.match(/(?:\bàs\s+|\bas\s+|\b)(\d{1,2})(?:h(\d{2})?|:(\d{2}))\b/i);
  if (timeMatch) {
    const hours = Math.min(23, Math.max(0, parseInt(timeMatch[1], 10)));
    const minutes = timeMatch[2] || timeMatch[3] || '00';
    dueTime = `${String(hours).padStart(2, '0')}:${minutes}`;
    text = text.replace(timeMatch[0], '');
  }

  const cleanedTitle = text.replace(/\s{2,}/g, ' ').trim() || rawText.trim();

  return {
    title: cleanedTitle,
    list,
    dueDate,
    dueTime,
    priority,
  };
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

export function formatShortDayMonth(dateStr: string): { day: string; month: string; inline: string } {
  if (!dateStr) return { day: '--', month: '---', inline: '' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = months[dt.getMonth()] || 'out';
  const day = String(dt.getDate());
  return {
    day,
    month,
    inline: `${day} ${month}`,
  };
}
