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
    tag: 'ليل + تكتيك',
    desc: 'جريمة وقعات، والقاتل قاعد معاكم فالطاولة 🔪 كلشي كيتشك في صاحبو — حتى فيك نتا 😅',
    cost: 15,
  },
  {
    id: 'paint-followers',
    latinTitle: 'Paint Followers',
    darijaTitle: 'ارسم كلمة',
    emoji: '🕵️',
    starAccent: '#1F7A6B',
    glowAccent: '#3FBA9A',
    isMafia: false,
    keyArt: '/images/paint-followers-2.jpeg',
    players: '3–15',
    tag: 'رسم + تخمين',
    desc: 'كل واحد كيرسم، والمحتال كيخمم. واش غادي نكشفوها؟',
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
    tag: 'جاسوس + سوالي',
    desc: 'جاسوس أو جوج كيتخبأو بين الدراري. خرجوهم قبل ما يكمل الوقت!',
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
    tag: 'أدوار + خنات عليه',
    desc: 'كلمة وحدة عارفها الجميع غير نتا — بلع، تظاهر، وجاوب حتى ما يكتاشفو الليلة 😅',
    cost: 20,
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
    darijaTitle: 'ثريفيا الحومة',
    emoji: '🧠',
    tag: 'معلومات + فضايح',
    desc: 'أسئلة عن المغرب، الحومة، والأشياء اللي كنعرفوها كلنا — بلا كذب 😂',
  },
  {
    id: 'karaoke',
    latinTitle: 'KARAOKE LHOUMA',
    darijaTitle: 'الكاريوكي',
    emoji: '🎤',
    tag: 'غنّاء + خسارة',
    desc: 'غنّاء بالدارجة — ماشي واحد فيكم صوتو مقبول، والجيران شهادين 🎵',
  },
];