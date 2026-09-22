# L'MAFIA D'LHOUMA

Pass-and-play party game for one phone in a group (العربية بالدارجة). Roles are dealt secretly, the phone passes around so each player sees only their own card, then the الحاكم runs the night/day cycle.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Zustand (state)
- Framer Motion (animations)
- lucide-react (icons)

## Game flow

1. **Setup (جمعية الحومة)** — add players, pick/randomize the الحاكم (teller), choose the number of العصابة (mafia, only that count is changeable; بوليس & طبيب fixed at 1, ولاد الحومة auto-calculated).
2. **Deal (تفريق الأدوار)** — press "شوف الكارطة" to reveal-rotate the phone.
3. **Pass & play (القلب)** — each player taps their card, checks their role, hides it, passes the phone.
4. **Unlock (فتّح لابو)** — phone comes back to the الحاكم.
5. **Night** — العصابة kill, البوليس checks, الطبيب saves, then dawn.
6. **Day / Voting** — morning report, 4-minute vote, elimination reveal.
7. Win condition: town eliminates all العصابة (ولاد الحومة win) or العصابة outnumbers town.

## Roles

| Role | label |
| --- | --- |
| EISSABA | العصابة / المافيا |
| BOULIS | البوليس / المحامي |
| TBIB | الطبيب / الدكتور |
| WLAD_LHOUMA | ولاد الحومة / المدنيين |

## Project structure

- `src/components/` — screens: home, setup (`Jem3atScreen`), deal (`DealScreen`), pass-and-play (`PassPlayScreen`), dashboard (`DashboardScreen`), game over.
- `src/game/` — Zustand store (`useMafiaGame.ts`) and types/rules (`types.ts`).
- `src/lib/utils.ts` — countdown, ellipses, sound (`buzz`), etc.
- `public/img/` — all art assets (card back, table, role logos, background wallpapers).

## Folder layout

```
mafia b darija/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ public/img/       # images used by the app
└─ src/
   ├─ components/
   ├─ game/
   └─ lib/
```

## 🔧 Start the server locally

Requirements: **Node.js** (>= 18).

```powershell
# 1) install dependencies (first time only)
npm install

# 2) start the dev server
npm run dev
```

- Dev server prints the URL — open **http://localhost:5173** in your browser.
- To play from another device on the same Wi-Fi, Vite binds to `0.0.0.0` (`host: true` in `vite.config.ts`); use the printed **Network / Local** URL (e.g. `http://<your-pc-ip>:5173`) and make sure Windows Firewall allows Node.js on port 5173.

### Build for production

```powershell
npm run build      # outputs to dist/
npm run preview    # serve the built app locally (http://localhost:4173)
```