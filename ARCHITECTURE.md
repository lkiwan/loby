# DARJA ARCADE Lobby — System Architecture (A→Z)

## 1. Stack overview

| Layer | Tech |
|---|---|
| Framework | Next.js **16.3.5** (App Router, Turbopack), React **19.2.8** |
| Auth | next-auth **4.24** (Credentials, **JWT** sessions) |
| Database | PostgreSQL via **Prisma 5** (`@prisma/client`) |
| Cache / tokens | **Redis** (`ioredis` v6) |
| Passwords | `bcryptjs` (bcrypt, 10 rounds) |
| Styling | Tailwind **v4** + custom fonts (Lalezar / Cairo / Archivo Black "grit") |
| Games | 4 external Vercel apps, embedded in iframes behind a token gate |

```
┌────────────┐   HTTPS   ┌────────────────────────┐        ┌──────────────┐
│  Browser   │ ────────► │  Next.js (this lobby)  │ ─────► │  PostgreSQL  │
│ (mobile)   │           │  ├ pages               │        │  (Prisma)    │
└────────────┘           │  ├ /api/*              │        └──────────────┘
   ▲  iframe hosts       │  ├ proxy.ts (gate)     │ ─────► ┌──────────────┐
   │  games              │  └ lib/redis.ts        │        │  Redis       │
└────────────────────┘  └────────────────────────┘        │ (game tokens) │
  external .vercel.app                                    └──────────────┘
```

## 2. Folder layout (`src/`)

```
src/
├── proxy.ts                  Node middleware — gates /games/* by token
├── app/
│   ├── layout.tsx            Root layout: fonts, metadata, Providers wrap
│   ├── globals.css           Design system (cork, poster, hazard, buttons…)
│   ├── page.tsx              LOBBY (hero, ticker, corkboard, ad modal, toast)
│   ├── login/page.tsx        signIn('credentials')
│   ├── register/page.tsx     POST /api/auth/register → success → /login
│   ├── games/[gameId]/page.tsx   Fullscreen iframe of the game (token-guarded)
│   └── api/
│       ├── auth/[...nextauth]/route.ts   NextAuth handler + authOptions export
│       ├── auth/register/route.ts        Create user (bcrypt, 100 coins)
│       ├── games/unlock/route.ts         Coins-deduct OR ad-check → game token
│       ├── games/verify-token/route.ts   Validate + burn token (used by proxy)
│       └── ads/postback/route.ts         External ad-network webhook
├── components/  Providers, AuthShell, GameCard(+GameArt), Star
├── lib/         prisma.ts (singleton), redis.ts, games.ts (game catalog)
└── types/next-auth.d.ts      Session.user typed {id, username, coins}
```

## 3. Data model

```prisma
model User {
  id        String   @id @default(cuid())
  username  String?  @unique
  password  String?            // bcrypt hash
  coins     Int      @default(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

One table. **Coins** are the whole economy. No tables for games/ad-watches — all
game/session state lives in Redis (ephemeral, TTL'd).

## 4. Redis — the "one-time ticket" system

`src/lib/redis.ts`

- `game_token:{uuid}` → JSON `{userId, gameId, createdAt}`, **TTL 60s**, set on every unlock
- `ad_completed:{userId}:{gameId}` → same token, **TTL 120s**, written by the ad postback

The heart of the gate: entering a game requires a fresh, unburned token.

## 5. Auth flow (register → login → session)

1. **Register**: `POST /api/auth/register` — check username uniqueness → `bcrypt.hash(pw, 10)` → create User with `coins: 100` → `201`. UI shows success, then redirects to `/login`.
2. **Login**: `signIn('credentials', { redirect:false })` → `authorize()` looks up user, `bcrypt.compare`, returns `{id, username, coins}`.
3. **JWT session**: `jwt` callback copies `id/username/coins` to the token; `session` callback exposes them. `trigger === 'update'` lets the client patch `token.coins` (live coin updates after paying).
4. `SessionProvider` wraps the whole app; the lobby gates rendering on `status === 'loading'` until the session resolves.

## 6. Play flows (from UI click to game)

### A — Pay with coins

```
user clicks "العب بالعملات"
  └─ requireAuth() (not authed → /login)
  └─ client checks coins >= game.cost   (UI: 15/10/10/20)
  └─ POST /api/games/unlock {gameId, paymentMethod:"coins"}
       ├─ getServerSession → 401 if missing
       ├─ read User; require coins >= COST        (API charges flat 10)
       ├─ prisma.user.update coins -= COST        (read-then-write, not atomic)
       ├─ generateGameToken(userId, gameId)       (Redis key, TTL 60s)
       └─ 200 { redirectUrl:"/games/{id}?token=…", remainingCoins }
  └─ client: session.update({coins})
  └─ router.replace(redirectUrl) → proxy
```

### B — Watch an ad to play

```
user clicks "شاهد إعلان" → ad modal (5s mock)
  └─ POST /api/games/unlock {paymentMethod:"ad"}
       └─ read Redis ad_completed:{user}:{game}
            ├─ found → delete key, 200 + redirect (token from key)
            └─ missing → 202 {status:"pending"}   ← ad not finished yet
  └─ client polls every 2s (max 10) until 200

External ad network (real world):
  POST /api/ads/postback?secret=…&userId=…&gameId=…   ← ad-server callback
       ├─ verify secret === AD_NETWORK_WEBHOOK_SECRET (query or header)
       ├─ generateGameToken(userId, gameId)
       └─ write ad_completed:{userId}:{gameId} (TTL 120s)
```

## 7. The gate — middleware + verify (one-time access)

`src/proxy.ts`, matcher `/games/:path*`

1. No `?token=` → **403**
2. Else `fetch(/api/games/verify-token?token=…)` (internal fetch so ioredis TCP works in Node)
3. `verify-token`: `GET game_token:{token}` → **delete (burn)** → `{valid, data}`
4. Invalid/expired → **403**; valid → `NextResponse.next()` → `/games/[gameId]` loads the game in a fullscreen iframe.

Property: **a token works exactly once and for 60s**.

## 8. Routing table

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/` | GET | optional | Lobby |
| `/login` `/register` | GET | — | Auth pages |
| `/games/[gameId]` | GET | **token gate** | Hosts external game in iframe |
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth (login, session) |
| `/api/auth/register` | POST | — | Create account |
| `/api/games/unlock` | POST | session | Deduct coins / check ad → issue token |
| `/api/games/verify-token` | GET | — | Burn + validate token |
| `/api/ads/postback` | POST | secret | Ad-network callback |

## 9. Environment variables

| Var | Used for |
|---|---|
| `DATABASE_URL` | Prisma → PostgreSQL |
| `REDIS_URL` | ioredis token store |
| `NEXTAUTH_SECRET` | NextAuth JWT signing |
| `AD_NETWORK_WEBHOOK_SECRET` | Postback auth |

## 10. Frontend rendering map

- **Lobby (`src/app/page.tsx`)** — session-gated. Hero with hand-drawn squiggle, hole-punched feature tags, hazard-strip marquee, guest sticky-note, corkboard grid of 4 GameCards. Actions: `playWithCoins` / `watchAdToPlay`; per-card busy state; ad modal `idle → watching → verifying`; toast errors.
- **GameCard / GameArt (`src/components/GameCard.tsx`)** — per-game poster: `isMafia` branch (dark, blood drips) or `keyArt` branch (generated logo, `object-contain` on paper) or star-emblem fallback.
- **Auth pages** — shared `AuthShell` scene; amber (login) / teal (register) accent.
- **Game page** — fullscreen iframe + HUD top bar with exit-confirm modal; unknown gameId → themed not-found → back to lobby.

## 11. Known asymmetries / technical debt

- **Flat cost mismatch**: `unlock` charges flat `COST = 10`; lobby displays 15/10/10/20. Clicking Play on some games shows wrong math vs the sticker.
- **Race on coins**: read-then-write deduction is not atomic; parallel taps could double-spend. Prefer `updateMany({ coins: { decrement: COST } })` in a `$transaction`.
- **TTL mismatch**: token TTL 60s vs ad-key TTL 120s; a token can expire inside its ad-key window.
- **Postback is simulated**: endpoint exists and is secret-guarded, but the current flow is a 5s client timeout + polling, not a real ad network.
- **No rate limiting** on `/api/games/unlock`.
- **LCP warning** on card images (consider `loading="eager"` on above-fold art).
- **Redis env fallback**: `REDIS_URL` defaults to `redis://localhost:6379`; a missing var produced `ENETUNREACH` in dev logs.

## 12. Build / deploy

- `postinstall` → `prisma generate` (client must match `schema.prisma`)
- `dev` = Turbopack · `build` = production + type check · `start` = serve · `lint` = Flat ESLint
- Each game remains a separate Vercel app; the lobby iframes them behind the token gate.