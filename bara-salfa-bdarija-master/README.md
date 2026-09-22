# 🕵️ برا السالفة بالدارجة

> A Moroccan Darija social deduction party game — one player is the outsider who doesn't know the secret word.

---

## What Is This Game?

**برا السالفة بالدارجة** ("Outside the Story, in Darija") is a Moroccan Arabic dialect take on the classic social deduction genre (think *Spyfall* or *The Outsider*). One randomly chosen player — **برا السالفة** (the outsider) — only knows the category. Everyone else knows the secret word. Through questions and clues, the group tries to unmask the outsider, while the outsider bluffs their way through and tries to deduce the word.

Fully in **Darija**, playable on a **single phone**, no install needed.

---

## How to Play

### Setup
1. Enter **3–8 player names**
2. Choose a **category** (or random)
3. Each player privately checks their role by passing the phone — hold the screen to reveal

### Roles
| Role | What you see | Goal |
|------|-------------|------|
| **فالسالفة** (Regular) | Category + Secret Word | Give clues without being too obvious — catch the outsider |
| **برا السالفة** (Outsider) | Category only | Blend in, guess the word from clues |

### Round Flow
1. **Pass & Reveal** — phone goes around, each player holds the screen to privately see their role
2. **Discussion** — players ask each other questions and give clues (minimum 1 question per player, 3–4 minute timer)
3. **Vote** — each player secretly votes for who they think is the outsider (no self-votes)
4. **Tie-break** — if votes are tied, a second vote is held between the tied players
5. **Bonus Guess** — the outsider always gets a last chance: pick the secret word from up to 5 choices for a bonus point
6. **Results** — scores revealed, then move to the scoreboard

### Scoring
| Action | Points |
|--------|--------|
| Regular player votes for the correct outsider | +1 |
| Outsider correctly guesses the secret word | +1 |
| Hybrid mode: completing a secret mission | +1 |

A full game is **5 rounds**. Scores accumulate across all rounds.

---

## Game Modes

### 🎯 Classic
The standard mode. One outsider, one secret word, pure deduction and bluffing.

### 🔥 Hybrid *(coming soon)*
Adds two layers of chaos:
- **Chaos Cards** — a random rule twists how everyone must speak or act that round
- **Secret Missions** — each regular player gets a hidden challenge to complete during discussion

---

## Categories

| # | Category | Words | Description |
|---|----------|-------|-------------|
| 1 | 🔥 GEN Z | 20 | Social media, youth slang (كراش, ستوري, بلوك…) |
| 2 | 🇲🇦 الحومة | 20 | Moroccan neighborhood life (مول الحانوت, الزنقة, أتاي…) |
| 3 | 🍲 الماكلة | 20 | Moroccan food (حريرة, طاجين, كسكس, بريوات…) |
| 4 | 🏠 الحياة اليومية | 20 | Daily life (النعاس, الويفي, المصروف, السفر…) |
| 5 | 🎓 المدرسة | 20 | School & university (امتحان, الغش, سوتنانس…) |
| 6 | 🐾 الحيوانات | 49 | Animals from pets to ocean creatures |
| 7 | ⚽ كرة القدم | 50 | Football players — Moroccan stars & global legends |
| 8 | 🔧 المهن | 30 | Professions in Darija (بناي, مول الطاكسي, يوتيوبر…) |

> **Football mode** is special: the secret "word" is a player's name. The outsider must identify which player everyone is hinting at without ever seeing the name.

---

## Chaos Cards (22 cards — Hybrid Mode)

Chaos cards apply to the **entire round**, including the outsider.

| Card | Rule |
|------|------|
| 🔢 3 كلمات بالضبط | Every clue must be exactly 3 words — no more, no less |
| ⏱️ 5 ثواني | You have only 5 seconds to give your clue |
| 🫠 الكلمة الغريبة | Each player must slip in an unrelated word naturally |
| 🤐 جملة وحدة فقط | No more than one complete sentence per clue |
| ❌ ممنوع نعم ولا لا | Saying "yes" or "no" gives the opponents a free clue |
| ⚖️ المحكمة | Each player has 10 seconds to defend their clue |
| 🔄 الجولة الثانية | After everyone goes once, a second round of clues (4+ players) |
| 🧑‍⚖️ المحامي | Each player must justify why they gave that specific clue |
| ✍️ التبرير | Before voting, state your reason in one sentence |
| 🔃 السؤال المقلوب | Answer every question with a question |
| 🤜 دافع على جارك | Each player must defend their neighbor once (4+ players) |
| 📡 المذيع | Everyone speaks like a formal news anchor |
| 👨‍🏫 الأستاذ | Everyone explains like a classroom teacher |
| 🚕 الطاكسي | Every clue must include a taxi or road comparison |
| 🏘️ الحومة | Every answer must reference the neighborhood or alley |
| ☕ القهوة | Speak like people waiting at a café |
| 🚫 بدون «أنا» | The word "أنا" (I) is banned for the entire round |
| 🇲🇦 التشبيه المغربي | Every clue must reference Moroccan culture |
| 🔙 الترتيب المقلوب | Start from the last player, not the first (4+ players) |
| 🙈 بدون أسماء | No player names — use "the one next to me", "the one before me" |
| 🐾 الحيوان | Each player picks an animal and makes its sound before every answer |
| 👑 الزعيم | First speaker is the leader — everyone must agree or say "مع الاحترام" |

---

## Secret Missions (20 missions — Hybrid Mode)

Each regular player receives a hidden mission to complete during discussion. The group votes at the end of the round on whether the mission was completed (+1 point if yes).

Examples:
- Defend another player at least once
- Ask two players "why did you say that?"
- Use the phrase "على حساب" in your answer
- Be the last player to give a clue
- Say "السالفة كبيرة" naturally at any point
- Give your clue in exactly 3 words
- Make a comparison involving a taxi
- Use an authentic Darija proverb

---

## Technical Details

- **Single HTML file** — no server, no install, no dependencies
- **Vanilla JavaScript** — zero frameworks
- **Mobile-first** — designed for phones (max-width 460px), RTL Arabic layout
- **Font** — [Cairo](https://fonts.google.com/specimen/Cairo) via Google Fonts
- **Works offline** after first load (except font)
- **Accessibility** — keyboard navigable, focus management, `prefers-reduced-motion` respected
- Built-in unit test suite (runs on load, results in browser console)

### Anti-cheat & UX
- Hold-to-reveal mechanic — screen hides automatically when finger lifts
- Screen hides if the browser tab goes to background during reveal
- Each player votes privately (phone passed per person)
- Outsider is never picked 3 times in a row

---

## Running the Game

Open `index.html` in any modern browser. No build step required.

```bash
# Clone and open
git clone https://github.com/walidchajari/bara-salfa-bdarija.git
cd bara-salfa-bdarija
open index.html   # macOS
# or just drag index.html into your browser
```

---

## Project Structure

```
bara-salfa-bdarija/
├── index.html              # Entire game — HTML + CSS + JS in one file
├── assets/
│   └── data/
│       └── categories.json # Category and word list reference (JSON format)
└── web_version/
    └── index.html          # Alternate/experimental web build
```

---

## Contributing

Word suggestions, new categories, translations, or bug reports are welcome via [Issues](https://github.com/walidchajari/bara-salfa-bdarija/issues) or Pull Requests.

---

## License

MIT — free to use, remix, and share.
