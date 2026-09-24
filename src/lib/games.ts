export type Game = {
  id: string;
  latinTitle: string;
  darijaTitle: string;
  emoji: string;
  starAccent: string;
  glowAccent: string;
  isMafia: boolean;
  keyArt?: string;
  players: string;
  duration: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  tags: string[];
  tag: string;
  desc: string;
  cost: number;
};

export const GAMES: Game[] = [
  {
    id: 'mafia',
    latinTitle: "L'MAFIA D'LHOUMA",
    darijaTitle: 'مافيا د الحومة',
    emoji: '💀',
    starAccent: '#EAB308',
    glowAccent: '#DC2626',
    isMafia: true,
    players: '6+',
    duration: '25 دقيقة',
    difficulty: 'متوسط',
    tags: ['تكتيك', 'الكدوب', 'جريمة'],
    tag: 'ليل + تكتيك',
    desc: 'جريمة وقعات، والقاتل ڭالس معاكم فالطبلة 🔪 كلشي كيشك ف صاحبو — حتى فيك نتا 😅',
    cost: 15,
  },
  {
    id: 'paint-followers',
    latinTitle: 'Paint Followers',
    darijaTitle: 'رسم كلمة',
    emoji: '🕵️',
    starAccent: '#1F7A6B',
    glowAccent: '#3FBA9A',
    isMafia: false,
    keyArt: '/images/paint-followers-2.jpeg',
    players: '3–15',
    duration: '15 دقيقة',
    difficulty: 'سهل',
    tags: ['رسم', 'تخمام', 'مرح'],
    tag: 'رسم + تخمام',
    desc: 'كلشي كيرسم، والمحتال كيخمم. واش غنفرشوه؟',
    cost: 10,
  },
  {
    id: '7azr-fazr',
    latinTitle: '7AZR FAZR',
    darijaTitle: 'حزر فزر',
    emoji: '🔍',
    starAccent: '#F2B23D',
    glowAccent: '#E85C2A',
    isMafia: false,
    keyArt: '/images/7azr-fazr.jpeg',
    players: '3–15',
    duration: '15 دقيقة',
    difficulty: 'متوسط',
    tags: ['ذكاء', 'مراقبة', 'تحليل'],
    tag: 'جاسوس + أسئلة',
    desc: 'جاسوس ولا جوج مخبيين بين الدراري. عيقو بيهم قبل ما يسالي الوقت!',
    cost: 10,
  },
  {
    id: 'bara-salfa',
    latinTitle: 'Bara Salfa',
    darijaTitle: 'برا السالفة',
    emoji: '🤫',
    starAccent: '#C8412B',
    glowAccent: '#E85C2A',
    isMafia: false,
    keyArt: '/images/bara-salfa.jpeg',
    players: '3–15',
    duration: '15 دقيقة',
    difficulty: 'متوسط',
    tags: ['أدوار', 'تحقيق', 'ضحك'],
    tag: 'أدوار + قوالب',
    desc: 'كلمة وحدة عارفها كلشي من غيرك — سلك، متّل، وجاوب باش مايعيقوش بيك 😅',
    cost: 20,
  },
  {
    id: 'sowl-wla-dir',
    latinTitle: 'SOWL WLA DIR?',
    darijaTitle: 'سول ولا دير؟',
    emoji: '❓',
    starAccent: '#f472b6',
    glowAccent: '#a855f7',
    isMafia: false,
    keyArt: '/images/sowl-wla-dir.png',
    players: '3–8',
    duration: '10 دقايق',
    difficulty: 'متوسط',
    tags: ['صراحة', 'تحدي', 'ضحك'],
    tag: 'سول + تحدي',
    desc: 'سؤال محرج ولا تحدي جامع — الاختيار عليك، بصح فكر مزيان قبل 😈',
    cost: 10,
  },
];

export const MAFIA_ART = '/images/mafia.png';

export type ComingSoonGame = {
  id: string;
  latinTitle: string;
  darijaTitle: string;
  emoji: string;
  tag: string;
  desc: string;
};

export const COMING_SOON: ComingSoonGame[] = [
  {
    id: 'trivia',
    latinTitle: 'TRIVIA D LHOUMA',
    darijaTitle: 'تريفيا د الحومة',
    emoji: '🧠',
    tag: 'معلومات + شوهة',
    desc: 'أسئلة على المغرب، الحومة، وداكشي لي كنعرفو كاملين — بلا كدوب 😂',
  },
  {
    id: 'karaoke',
    latinTitle: 'KARAOKE LHOUMA',
    darijaTitle: 'الكاريوكي',
    emoji: '🎤',
    tag: 'غنا + خسارة',
    desc: 'غنا بالدارجة — حتى واحد فيكم ما صوتو زوين، والجيران شاهدين 🎵',
  },
];