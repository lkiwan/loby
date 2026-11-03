export type Game = {
  id: string;
  latinTitle: string;
  darijaTitle: string;
  emoji: string;
  starAccent: string;
  glowAccent: string;
  isMafia: boolean;
  keyArt?: string;
  logo?: string;
  /** Store Posters clean (text-free) poster art — game name is always
      rendered as HTML text over it, never baked into the image. */
  poster?: string;
  players: string;
  duration: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  tags: string[];
  tag: string;
  tagline: string;
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
    logo: '/images/image.png',
    poster: '/images/posters/mafia-clean.webp',
    players: '6+',
    duration: '25 دقيقة',
    difficulty: 'متوسط',
    tags: ['تكتيك', 'الكدوب', 'جريمة'],
    tag: 'ليل + تكتيك',
    tagline: 'كدوب، خداع، وتحقيق في الحومة!',
    desc: 'الليل يبدأ والأبرياء ينامو... المافيا تشتغل! كل واحد عنده دور — شكون فيكم يكدوب أحسن وشكون يكتاشف الحقيقة قبل فوات الأوان؟',
    cost: 25,
  },
  {
    id: 'bara-salfa',
    latinTitle: 'Bara Salfa',
    darijaTitle: 'برا السالفة',
    emoji: '🤫',
    starAccent: '#A855F7',
    glowAccent: '#7C3AED',
    isMafia: false,
    keyArt: '/images/bara-salfa.jpeg',
    logo: '/images/logo-bara-salfa.png',
    poster: '/images/posters/bara-salfa-clean.webp',
    players: '3–15',
    duration: '15 دقيقة',
    difficulty: 'متوسط',
    tags: ['أدوار', 'تحقيق', 'ضحك'],
    tag: 'أدوار + قوالب',
    tagline: 'واحد بلا كلمة — شكون هو؟',
    desc: 'عند كل واحد كلمة سرية، إلا واحد منكم ما عندو والو! خمن السالفة وتحاشى الانكشاف — السؤال الغلط يبيّنك للعالمين.',
    cost: 20,
  },
  {
    id: '7azr-fazr',
    latinTitle: '7AZR FAZR',
    darijaTitle: 'حزر فزر',
    emoji: '🔍',
    starAccent: '#F2B23D',
    glowAccent: '#059669',
    isMafia: false,
    keyArt: '/images/7azr-fazr.jpeg',
    logo: '/images/logo-7azr-fazr.png',
    poster: '/images/posters/7azr-fazr-clean.webp',
    players: '3–15',
    duration: '15 دقيقة',
    difficulty: 'متوسط',
    tags: ['ذكاء', 'مراقبة', 'تحليل'],
    tag: 'جاسوس + أسئلة',
    tagline: 'جاوب صح قبل صحابك واربح!',
    desc: 'أسئلة ذكية وإشارات خفية — شكون يلقى الجواب الصحيح قبل الآخرين؟ شحال من مرة كنت واثق وغلطت... هادي غيرها!',
    cost: 15,
  },
  {
    id: 'paint-followers',
    latinTitle: 'Paint Followers',
    darijaTitle: 'رسم كلمة',
    emoji: '🎨',
    starAccent: '#2DD4BF',
    glowAccent: '#F97066',
    isMafia: false,
    keyArt: '/images/paint-followers-2.jpeg',
    logo: '/images/logo-rasm.png',
    poster: '/images/posters/paint-followers-clean.webp',
    players: '3–15',
    duration: '15 دقيقة',
    difficulty: 'سهل',
    tags: ['رسم', 'تخمام', 'مرح'],
    tag: 'رسم + تخمام',
    tagline: 'الريشة تتكلم عيوضك!',
    desc: 'ارسم الكلمة بلا ما تتكلم وخلي صحابك يخمنو — اللي يتعرف أسرع يربح. الإبداع والضحك مضمونين للجميع!',
    cost: 15,
  },
  {
    id: 'sowl-wla-dir',
    latinTitle: 'SOWL WLA DIR?',
    darijaTitle: 'سول ولا دير؟',
    emoji: '❓',
    starAccent: '#F97066',
    glowAccent: '#F59E0B',
    isMafia: false,
    keyArt: '/images/sowl-wla-dir.png',
    logo: '/images/logo-sowl.png',
    poster: '/images/posters/sowl-wla-dir-clean.webp',
    players: '3–8',
    duration: '10 دقايق',
    difficulty: 'متوسط',
    tags: ['صراحة', 'تحدي', 'ضحك'],
    tag: 'سول + تحدي',
    tagline: 'سؤال جريء ولا تحدي مجنون؟',
    desc: 'اختار: جاوب سؤال شخصي ولا قبل التحدي! مين فيكم عنده الجرأة؟ الأسرار مكشوفة والضحك مضمون حتى آخر اللعبة.',
    cost: 15,
  },
];

export const MAFIA_ART = '/images/image.png';

export type ComingSoonGame = {
  id: string;
  latinTitle: string;
  darijaTitle: string;
  emoji: string;
  tag: string;
  desc: string;
  /** Store Posters clean (text-free) poster art. */
  poster?: string;
};

export const COMING_SOON: ComingSoonGame[] = [
  {
    id: 'trivia',
    latinTitle: 'TRIVIA D LHOUMA',
    darijaTitle: 'تريفيا د الحومة',
    emoji: '🧠',
    tag: 'معلومات + شوهة',
    desc: 'أسئلة على المغرب، الحومة، وداكشي لي كنعرفو كاملين — بلا كدوب 😂',
    poster: '/images/posters/trivia-clean.webp',
  },
  {
    id: 'karaoke',
    latinTitle: 'KARAOKE LHOUMA',
    darijaTitle: 'الكاريوكي',
    emoji: '🎤',
    tag: 'غنا + خسارة',
    desc: 'غنا بالدارجة — حتى واحد فيكم ما صوتو زوين، والجيران شاهدين 🎵',
    poster: '/images/posters/karaoke-clean.webp',
  },
];
