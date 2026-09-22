import type { Category } from '../types'

export const PLAYER_COLORS = [
  '#C8412B', // terra
  '#1F7A6B', // tea
  '#F2B23D', // saffron
  '#E85C2A', // terra2
  '#3FBA9A', // mint
  '#8B5CF6', // violet
  '#F472B6', // pink
  '#60A5FA', // blue
  '#34D399', // emerald
  '#FB923C', // orange
  '#A78BFA', // purple
  '#2DD4BF', // teal
  '#E879F9', // fuchsia
  '#F87171', // red
  '#22D3EE', // cyan
]

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 15

export const CATEGORIES: Category[] = [
  {
    id: 'animals',
    title: 'الحيوانات',
    emoji: '🦁',
    words: [
      'القط',
      'الكلب',
      'الحصان',
      'الحمار',
      'الدجاجة',
      'الأرنب',
      'السلحفاة',
      'الثعبان',
      'التمساح',
      'الزرافة',
      'الفيل',
      'القرد',
      'الدب',
      'الثعلب',
      'البطريق',
      'البومة',
      'النحلة',
      'الفراشة',
      'الحوت',
      'الدلفين',
      'القرش',
      'الجمل',
      'الغزال',
      'الكنغر',
      'الباندا',
      'الأسد',
      'النمر',
      'الذئب',
      'النسر',
      'العنكبوت',
    ],
  },
  {
    id: 'food',
    title: 'الماكلة',
    emoji: '🍲',
    words: [
      'الحريرة',
      'الطاجين',
      'الكُسْكُس',
      'المسمن',
      'البغرير',
      'البريوات',
      'الشباكية',
      'البِصّارة',
      'الطنجية',
      'الرفيسة',
      'المروزية',
      'السفنج',
      'الكحك',
      'الفشار',
      'البيتزا',
      'الساندويتش',
      'الشاي',
      'القهوة',
      'العصير',
      'الكوك',
      'البرتقال',
      'التفاح',
      'البطيخ',
      'الموز',
      'الشاورما',
    ],
  },
  {
    id: 'home',
    title: 'حوايج الدار',
    emoji: '🏠',
    words: [
      'الكرسي',
      'الطاولة',
      'التلفاز',
      'الثلاجة',
      'الفرن',
      'المفتاح',
      'الساعة',
      'المظلة',
      'الحذاء',
      'التاج',
      'القبعة',
      'النظارة',
      'المقص',
      'الغسالة',
      'السرير',
      'الوسادة',
      'البطانية',
      'النافذة',
      'الباب',
      'السلم',
      'البالون',
      'السلة',
      'الملعقة',
      'الطاس',
      'إبريق الشاي',
    ],
  },
  {
    id: 'places',
    title: 'الأماكن',
    emoji: '🏞️',
    words: [
      'الشاطئ',
      'الجبل',
      'الغابة',
      'البحر',
      'المطار',
      'المحطة',
      'الجامعة',
      'المدرسة',
      'المستشفى',
      'السوق',
      'المول',
      'الجامع',
      'الحديقة',
      'المسبح',
      'الملعب',
      'الطريق',
      'الجسر',
      'النهر',
      'البرج',
      'الصحراء',
      'الواحة',
      'المدينة',
      'الحي',
      'القرية',
      'الميناء',
    ],
  },
  {
    id: 'objects',
    title: 'حوايج خرى',
    emoji: '🎒',
    words: [
      'الهاتف',
      'اللابتوب',
      'النظارة',
      'الساعة',
      'المظلة',
      'الكتاب',
      'القلم',
      'الكرة',
      'الطائرة الورقية',
      'الصندوق',
      'السيف',
      'الدرع',
      'السفينة',
      'القطار',
      'الطائرة',
      'السيارة',
      'الدراجة',
      'الطوبيس',
      'الكاميرا',
      'الميكروفون',
      'المطرقة',
      'المفتاح',
      'القفل',
      'الشمعة',
      'المرآة',
    ],
  },
  {
    id: 'nature',
    title: 'الطبيعة',
    emoji: '🌦️',
    words: [
      'الشمس',
      'القمر',
      'النجم',
      'الغيمة',
      'المطر',
      'الثلج',
      'البرق',
      'قوس قزح',
      'الشجرة',
      'الوردة',
      'الزهرة',
      'العشب',
      'الكهف',
      'البركان',
      'الزلزال',
      'النار',
      'الماء',
      'المحيط',
      'الجزيرة',
      'الكوكب',
      'الصحراء',
      'الجبل',
      'النهر',
      'الريح',
      'الصاعقة',
    ],
  },
  {
    id: 'school',
    title: 'المدرسة',
    emoji: '📚',
    words: [
      'الأستاذ',
      'التلميذ',
      'الامتحان',
      'السبورة',
      'القلم',
      'الدفتر',
      'المحفظة',
      'المكتبة',
      'الجدول',
      'العطلة',
      'الفناء',
      'الغشاش',
      'الكرسي',
      'الطبشور',
      'المنبه',
      'الرسمة',
      'الخريطة',
      'المسطرة',
      'الحقيبة',
      'الممحاة',
    ],
  },
  {
    id: 'sports',
    title: 'الرياضة',
    emoji: '⚽',
    words: [
      'كرة القدم',
      'كرة السلة',
      'السباحة',
      'الجري',
      'التنس',
      'الملاكمة',
      'الدراجة',
      'التزلج',
      'الغوص',
      'القفز',
      'الجودو',
      'رفع الأثقال',
      'الجمناستيك',
      'كرة الطائرة',
      'كرة اليد',
      'الغولف',
      'البيسبول',
      'الكريكيت',
      'ركوب الخيل',
      'التزلج على الجليد',
    ],
  },
]

export function pickRandomCategory(): Category {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
}

export function pickWord(category: Category): string {
  return category.words[Math.floor(Math.random() * category.words.length)]
}

export function pickImposterId(
  playerIds: string[],
  lastImposterId: string | null,
): string {
  if (lastImposterId === null) {
    return playerIds[Math.floor(Math.random() * playerIds.length)]
  }
  const others = playerIds.filter((id) => id !== lastImposterId)
  return others[Math.floor(Math.random() * others.length)]
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

export function pickGuessWords(
  category: Category,
  secretWord: string,
): string[] {
  const others = category.words.filter((w) => w !== secretWord)
  const shuffled = shuffleArray(others)
  const pool = [...shuffled.slice(0, 4), secretWord]
  return shuffleArray(pool)
}
