# PLAYM3ANA — New Frontend Design ("Zellige Nights")

Concept approved by Omar on 2026-10-05. Phone-first, RTL, 100% Darija.
Reference concept image: `media-generation-loby-new-design-0-b5600164-e386-4613-b74b-e21fa41c6882.webp`

## Design language

- **Mood:** Moroccan zellige nights — deep navy + glowing gold, festive, premium.
- **Background:** deep navy `#0B1F3A` → darker `#071426`, with a subtle gold zellige
  eight-pointed-star geometric pattern at low opacity.
- **Palette:**
  - Navy deep `#0B1F3A`, navy card `#12294D`, darkest `#071426`
  - Gold `#F5B942` / `#E8A020`
  - Teal `#2DD4BF` / light teal `#5EEAD4`, deep teal `#0E3A45`
  - Terracotta / coral `#F97066`, warm orange `#FB923C`
  - Text warm white `#FFF7E8`, muted `#B8C4D8`
- **Signature gradients:**
  - Hero card: teal `#2DD4BF` → warm orange `#FB923C`
  - Primary CTA: coral `#F97066` → gold `#F5B942`
  - Wordmark: gold → teal
- **Ornaments:** gold zellige corner flourishes on cards, eight-pointed-star medallions.
- **Typography:** heavy bold Arabic display for headlines, clean Arabic for body;
  Latin wordmark `PLAYM3ANA` in gradient caps.
- **Shape language:** big rounded cards (20–24px radius), pill buttons, soft glows.

## Screen structure (top → bottom)

1. **Status bar** — time, signal, battery (system).
2. **Header pill** (navy card, rounded): zellige medallion logo + `PLAYM3ANA`
   gradient wordmark + 🇲🇦 + notification bell with red badge (3) + round
   zellige avatar medallion.
3. **Hero card** (teal→orange gradient): `أهلا بيك يا سيد! 🪔` + sub-line
   `جلسة اللعب دايرينها دابا — جاهز تدخل مع صحابك؟` + zellige corners.
4. **Lobby-of-the-day card** (navy + gold corners): `🎉 اللوبي ديال اليوم`,
   live stats `حضور: 2,831 لاعب دابا • 14 غرفة مفتوحة`, player avatar stack,
   green `مباشر الآن` dot, gold button `دخل اللوبي`.
5. **New games row** — `✨ اللعاب الجدد اليوم`, 3 colorful cards (purple / orange /
   teal), each with icon, Darija name, player count, status chip
   (`سخون 🔥` / `كيمشي دابا` / `جديد!`).
6. **Missions card** — `🎁 مهامك اليوم`: rows with icon, title, coin reward,
   progress bar (`80%`), action chips (`دعوة`, `باقي`), checkmark state.
7. **Bottom tab bar** (deep teal pill): `الرئيسية` (active gold) / `الصحاب` /
   `اللعاب` / `حسابي`.
8. **Sticky CTA** (coral→gold gradient): `🎮 بدا لعب دابا — جلسة جديدة`.

## Games (5)

| #   | Darija name    | Latin           | Coins | Vibe for art                                |
| --- | -------------- | --------------- | ----- | ------------------------------------------- |
| 1   | مافيا د الحومة | Mafia d'lhouma  | 🪙 15 | hooded figure, detective lamp, night alley  |
| 2   | رسم كلمة       | Paint Followers | 🪙 10 | giant paintbrush, doodles, neon sketch      |
| 3   | حزر فزر        | 7azr Fazr       | 🪙 10 | magnifier, spy silhouette, question marks   |
| 4   | برا السالفة    | Bara Salfa      | 🪙 20 | whispering friend, speech bubbles, mischief |
| 5   | سول ولا دير؟   | Sowl Wla Dir    | 🪙 10 | vintage mic, purple stage light, fist       |

## Asset inventory — `new pictures/`

All generated 2026-10-05 in the Zellige Nights style. PNG, best quality.

| File                  | What                                                       | Format / size         |
| --------------------- | ---------------------------------------------------------- | --------------------- |
| `logo-playm3ana.png`  | Main app logo: zellige star medallion + PLAYM3ANA wordmark | 1600×1600 PNG         |
| `game-mafia-logo.png` | مافيا د الحومة — square game logo                          | 1600×1600 PNG         |
| `game-mafia-art.png`  | مافيا د الحومة — wide card artwork                         | 1920×1200 PNG (16:10) |
| `game-paint-logo.png` | رسم كلمة — square game logo                                | 1600×1600 PNG         |
| `game-paint-art.png`  | رسم كلمة — wide card artwork                               | 1920×1200 PNG (16:10) |
| `game-hazr-logo.png`  | حزر فزر — square game logo                                 | 1600×1600 PNG         |
| `game-hazr-art.png`   | حزر فزر — wide card artwork                                | 1920×1200 PNG (16:10) |
| `game-bara-logo.png`  | برا السالفة — square game logo                             | 1600×1600 PNG         |
| `game-bara-art.png`   | برا السالفة — wide card artwork                            | 1920×1200 PNG (16:10) |
| `game-sowl-logo.png`  | سول ولا دير؟ — square game logo                            | 1600×1600 PNG         |
| `game-sowl-art.png`   | سول ولا دير؟ — wide card artwork                           | 1920×1200 PNG (16:10) |

Usage: `*-logo.png` → avatars, tab icons, list thumbnails, favicon-ish spots.
`*-art.png` → game cards, hero banners, featured headers.
`logo-playm3ana.png` → app header, splash, login, footer.
