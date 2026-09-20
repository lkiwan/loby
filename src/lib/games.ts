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
    desc: 'مهمة، بوليس، طبيب … خلي النية على الحاكم. شكون كيديها الليلة؟',
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
    keyArt: '/images/paint-followers.jpeg',
    players: '3–15',
    tag: 'رسم + تخمين',
    desc: 'كل واحد كيرسم، والمحتال كيخمم. واش غادي نجيبدوها؟',
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
    desc: 'جاسوس أو جوج كيتلبطو بين الدراري. خرجوهم قبل ما يكمل الوقت!',
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
    desc: 'ديڤلض منها! كلمة كتسبق، صحابها خاصهم يخدعو الطوار ويهربو منها.',
    cost: 20,
  },
];

export const MAFIA_ART = '/images/mafia.png';