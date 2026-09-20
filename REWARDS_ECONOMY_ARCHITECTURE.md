# DARJA ARCADE — Rewards, Gifts & Data Architecture (v1)

Companion to `ARCHITECTURE.md`. This document specifies the **economy**, the **reward
systems**, the **gifting layer**, the **data model**, and the **anti-abuse** rules.

**Assumptions** (change these and the numbers move): mobile-first, Morocco/MENA audience,
rewarded video as primary monetization, 4 external games today and more later, no IAP at
launch but the schema must not block it.

---

## 0. The one rule everything else depends on

> **The client never decides how many coins you have. The ledger does.**

Today `User.coins` is mutated with a read-then-write. That is a bug at 10 users and a
disaster at 10,000. Everything below assumes one primitive:

```
mutateBalance(userId, delta, reason, idempotencyKey) → LedgerEntry
```

Nothing else in the codebase is allowed to touch `User.coins`. Not the unlock route, not
the reward claim, not an admin script. One function, one audit trail, one place to debug
"where did my coins go".

---

## 1. System map

```
                        ┌──────────────────────────────┐
   Browser / PWA ─────► │  Lobby (Next.js App Router)  │
                        │  ├ /api/economy/*            │
   External game    ───►│  ├ /api/rewards/*            │
   (vercel.app)         │  ├ /api/gifts/*              │
   signed callbacks     │  ├ /api/sessions/*           │
                        │  └ /api/ads/postback         │
                        └───┬──────────┬───────────┬───┘
                            │          │           │
                   ┌────────▼───┐  ┌───▼────┐  ┌───▼──────────┐
                   │ PostgreSQL │  │ Redis  │  │ Event log    │
                   │ truth:     │  │ speed: │  │ (append-only │
                   │ ledger,    │  │ tokens,│  │  `events`    │
                   │ identity,  │  │ limits,│  │  table →     │
                   │ missions,  │  │ boards,│  │  warehouse)  │
                   │ inventory  │  │ locks  │  └──────────────┘
                   └────────────┘  └────────┘
```

**Rule of thumb for what goes where**

| Data | Store | Why |
|---|---|---|
| Coin balance, ledger, entitlements, purchases | Postgres | Must survive a Redis flush |
| Game tokens, rate limits, locks, nonces | Redis | Ephemeral, TTL'd, high churn |
| Live leaderboards | Redis ZSET | O(log n) rank, rebuilt from Postgres nightly |
| Streak counter, mission progress | Postgres (Redis read-cache) | Money-adjacent → must be durable |
| Analytics events | Postgres `events`, partitioned by day | Cheap now, exportable later |

If Redis is wiped, the product must still be correct — only slower. Test this.

---

## 2. Economy design

### 2.1 Currencies

| Currency | Symbol | Earned | Spent on | Notes |
|---|---|---|---|---|
| **Coins** | 🪙 | ads, streaks, missions, wins, gifts | plays, continues, cosmetics, tournament entry | Soft. Inflates. Must be sunk. |
| **Tickets** | 🎟️ | tournaments, seasons, rare loot | premium cosmetics, big gift boxes | Hard-ish. Scarce. Never sold for coins. |
| **XP** | ⭐ | every completed play | nothing — drives Level | Not spendable. Pure progression. |

Two spendable currencies is the ceiling. A third one confuses players and doubles your
balancing work.

### 2.2 Faucets (sources) — tuned for ~1 session/day

| Source | Amount | Cap | Purpose |
|---|---|---|---|
| Signup grant | 100 | once | Enough for ~6 plays. Hooks before the paywall. |
| Daily check-in (streak) | 25 → 35 → 50 → 75 → 100 → 150 → **250** | 1/day | The single strongest D7 retention lever you have |
| First play of the day | free play | 1/day | Removes friction on the return visit |
| Rewarded ad | +25 **or** 1 free play | 6/day | Primary revenue loop |
| Daily mission (3 rotating) | 20 / 30 / 50 | 3/day | Directs players to under-played games |
| Weekly mission | 200 | 1/week | Gives the week a shape |
| Level-up | 50 × level | — | Progression payoff |
| Leaderboard payout (daily top 20) | 500 / 300 / 200 / 100… | 1/day | Whale-of-skill retention |
| Referral (friend reaches L3) | 150 referrer / 75 friend | 10/mo | Cheapest user acquisition you will ever get |
| Promo code | variable | per-code | Campaigns, influencers, apologies |
| Gift received | variable | see §4 | Social loop |

**Daily free income of an engaged player: ≈ 180–260 coins.**

### 2.3 Sinks (drains)

| Sink | Cost | Why it matters |
|---|---|---|
| Play a game | 10 / 15 / 20 (per-game, DB-driven) | Core sink |
| Continue / extra life | 15 | Highest-intent sink; add this early |
| Avatar frame, card skin, name colour | 150 – 1,500 | Pure sink, zero marginal cost, high perceived value |
| Tournament entry | 50 | Sink + stakes |
| Gift box (loot) | 200 | Variable-reward sink, see §3.4 |
| Gift transfer fee | 10% of amount | Anti-farming tax (§5) |

**Daily spend of an engaged player: 10 plays ≈ 150 coins + impulse buys.**

### 2.4 The balance you are aiming for

```
free income (≈220) ≈ 0.85 × desired spend (≈260)
```

Slightly negative. The 15% gap is what a rewarded ad closes. If income > spend, coins
become worthless and ads stop being watched. If the gap is too wide, players bounce.
**Ship it at 0.85 and tune weekly from §7 dashboards.** Never tune from intuition.

### 2.5 Revenue math (be honest with yourself)

```
ARPDAU = (rewarded ads/DAU) × (eCPM / 1000)
       = 2.5 × ($3.00 / 1000)          ← MENA rewarded video, realistic
       = $0.0075 per daily user
```

| DAU | Monthly gross |
|---|---|
| 1,000 | ≈ $225 |
| 10,000 | ≈ $2,250 |
| 50,000 | ≈ $11,250 |

The lever that matters most is **ads per DAU**, not eCPM — you control the first one.
Every design decision below is aimed at moving 2.5 → 4.0 without making the app feel
like a slot machine.

---

## 3. Reward systems

### 3.1 Streaks (build this first)

- Check-in is **automatic on first authenticated page load of a new day**, not a button.
  A button loses 30% of claims.
- Day boundary = **Africa/Casablanca**, stored as `DATE` in the user's timezone. Never UTC —
  a player at 01:00 must not lose their streak.
- **Streak freeze**: one auto-freeze per 30 days. Protects the 40-day streaks you cannot
  afford to lose. Show it explicitly: "we saved your streak".
- Day 7 pays 250 and the cycle restarts at day 1, but `longestStreak` is kept forever
  and displayed on the profile.

### 3.2 Missions

- `MissionTemplate` (definition, in DB) → `MissionAssignment` (per user, per day).
- Assigned by a cron at 00:00 Casablanca. 3 daily + 1 weekly.
- Progress is written **server-side only**, from verified `PlaySession` rows (§6).
- Template kinds: `PLAY_N_GAMES`, `PLAY_SPECIFIC_GAME`, `SCORE_ABOVE`, `WATCH_N_ADS`,
  `WIN_STREAK`, `INVITE_FRIEND`, `SEND_GIFT`.
- Weight assignment toward **the game with lowest plays in the last 7 days**. This is how
  you keep a 4-game catalog feeling alive.

### 3.3 Levels

```
xpForLevel(n) = 100 × n^1.4     // L2=264, L5=955, L10=2512, L20=6633
```

XP per completed play = `10 + floor(score / scoreDivisor)`, capped at 50. Level gates
gifting, referral payout, and leaderboards — this is your main anti-bot gate.

### 3.4 Gift boxes (variable rewards, done responsibly)

- Server rolls, **never the client**. Client receives only the outcome.
- Weighted `LootTable` → `LootEntry(weight, kind, payload)`.
- **Pity timer**: guaranteed rare within N opens. Store `pityCounter` per user per table.
  Without pity, a player with bad luck quits; with pity, they push one more time.
- Every roll writes an `events` row with the server seed hash, so you can prove fairness
  if anyone accuses you of rigging.
- Publish the odds in-app. It costs nothing and it is becoming a legal requirement in
  more markets every year.

### 3.5 Seasons (phase 4, not launch)

4-week seasons with a free reward track and a paid track. Season XP is separate from
account XP. This is the structure that turns a lobby into a live product — but do not
build it before §1–§4 are stable.

---

## 4. Gifting

Three distinct mechanics, often confused:

| Mechanic | Direction | Cost to sender | Risk |
|---|---|---|---|
| **Send coins** | P2P | amount + 10% fee | Coin farming via fake accounts |
| **Gift a play** | P2P | 1 play cost | Low |
| **Grant** | Admin/system → user | none | Internal abuse |

### Rules for P2P transfers (all enforced server-side)

1. Both accounts ≥ **Level 3** and ≥ **72h old**.
2. Sender daily cap: **500 coins**, max 5 recipients.
3. Receiver daily cap: **1,000 coins** from all senders combined.
4. 10% fee burned (not routed to anyone) — this is the sink that stops farm loops.
5. Accounts sharing a device fingerprint or IP /24 **cannot** transfer to each other.
6. Every transfer writes **two** ledger entries (debit + credit) plus one `BURN` entry,
   linked by the same `transferId`. The three must sum to zero minus the burn.

### Gift links (growth lever)

`POST /api/gifts/link` mints a one-time claim code worth N coins, TTL 7 days, shareable
on WhatsApp. Claimable **only by a new account or an account < 7 days old**. This turns
gifting into acquisition instead of internal coin shuffling.

---

## 5. Anti-abuse — the part that decides whether the economy survives

| Attack | Defence |
|---|---|
| **Direct game URL** (biggest hole today) | External game must call `POST /api/sessions/verify` with a short-lived signed JWT before booting. No valid session → refuse to start. Until this ships, coins are cosmetic. |
| Fake scores | Game signs `HMAC-SHA256(gameSecret, sessionId + score + nonce)`. Per-game secret, rotatable. Server rejects scores above a per-game plausibility ceiling and flags for review. |
| Ad postback replay | Postback must carry a `nonce` **issued at ad-start** and stored in Redis with TTL. One nonce = one reward. Verify HMAC of the whole query string, not a static shared secret in a URL. |
| Multi-accounting | Device fingerprint + hashed IP on every `Device` row. Referral payout requires the friend to reach L3 organically. Cap accounts per device at 3. |
| Double-spend race | `updateMany({ where: { coins: { gte: cost } } })` + check `count === 1`, inside a transaction with the ledger insert. |
| Retry storms / duplicate rewards | Every mutating endpoint takes an `Idempotency-Key`. `LedgerEntry.idempotencyKey` is `@unique`; on `P2002`, return the original result. |
| Endpoint hammering | Redis sliding window: unlock 10/min, claim 20/min, gift 5/min, postback 60/min per user. |
| Coin farming rings | Nightly job: graph of transfers; flag components with >5 accounts and >80% internal flow. Freeze, don't delete. |

**Every one of these is cheap to build now and expensive to retrofit after launch.**

---

## 6. Data model (Prisma)

```prisma
// ─────────────── IDENTITY ───────────────
model User {
  id            String   @id @default(cuid())
  username      String?  @unique
  phone         String?  @unique
  password      String?
  role          Role     @default(PLAYER)
  status        UserStatus @default(ACTIVE)
  locale        String   @default("ar-MA")
  timezone      String   @default("Africa/Casablanca")

  // CACHED projections of the ledger — never written directly
  coins         Int      @default(0)
  tickets       Int      @default(0)
  xp            Int      @default(0)
  level         Int      @default(1)

  streakCount   Int      @default(0)
  longestStreak Int      @default(0)
  lastCheckinOn DateTime? @db.Date
  freezesLeft   Int      @default(1)

  referralCode  String   @unique
  referredById  String?
  referredBy    User?    @relation("Ref", fields: [referredById], references: [id])
  referrals     User[]   @relation("Ref")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastSeenAt    DateTime?

  ledger        LedgerEntry[]
  sessions      PlaySession[]
  devices       Device[]
  missions      MissionAssignment[]
  items         UserItem[]
  adImpressions AdImpression[]

  @@index([lastSeenAt])
  @@index([coins])
}

enum Role       { PLAYER MODERATOR ADMIN }
enum UserStatus { ACTIVE FROZEN BANNED }

model Device {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  fingerprint  String
  ipHash       String
  userAgent    String?
  firstSeenAt  DateTime @default(now())
  lastSeenAt   DateTime @updatedAt

  @@unique([userId, fingerprint])
  @@index([fingerprint])   // ← multi-account detection
  @@index([ipHash])
}

// ─────────────── LEDGER (source of truth) ───────────────
model LedgerEntry {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  currency       Currency @default(COINS)
  delta          Int                       // + earn, − spend
  balanceAfter   Int                       // snapshot for fast audit
  reason         LedgerReason
  refType        String?                   // "PlaySession" | "GiftTransfer" | …
  refId          String?
  idempotencyKey String   @unique          // ← makes every write retry-safe
  metadata       Json?
  createdAt      DateTime @default(now())

  @@index([userId, createdAt(sort: Desc)])
  @@index([reason, createdAt])
  @@index([refType, refId])
}

enum Currency { COINS TICKETS }

enum LedgerReason {
  SIGNUP_GRANT  DAILY_CHECKIN  MISSION_REWARD  LEVEL_UP
  AD_REWARD     LEADERBOARD_PAYOUT  REFERRAL_BONUS  PROMO_CODE
  GIFT_RECEIVED GIFT_SENT  GIFT_FEE_BURN  LOOT_BOX_PAYOUT
  PLAY_COST     CONTINUE_COST  COSMETIC_PURCHASE  TOURNAMENT_ENTRY
  LOOT_BOX_COST ADMIN_GRANT  ADMIN_CLAWBACK  REFUND
}

// ─────────────── CATALOG (config in DB, not code) ───────────────
model Game {
  id            String  @id              // "mafia", "tahadi", …
  slug          String  @unique
  titleAr       String
  titleFr       String?
  embedUrl      String
  hmacSecret    String                   // per-game score signing key
  playCost      Int     @default(10)     // ← single source of truth for price
  continueCost  Int     @default(15)
  xpDivisor     Int     @default(100)
  maxPlausibleScore Int @default(1000000)
  isActive      Boolean @default(true)
  sortOrder     Int     @default(0)

  sessions      PlaySession[]
}

model RemoteConfig {
  key       String   @id
  value     Json
  updatedAt DateTime @updatedAt
}
// Holds streak table, ad caps, mission weights, fee %. Tune without a deploy.

// ─────────────── PLAY ───────────────
model PlaySession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  gameId        String
  game          Game     @relation(fields: [gameId], references: [id])
  unlockMethod  UnlockMethod
  coinsSpent    Int      @default(0)
  score         Int?
  scoreVerified Boolean  @default(false)
  xpAwarded     Int      @default(0)
  startedAt     DateTime @default(now())
  endedAt       DateTime?
  clientNonce   String   @unique

  @@index([userId, startedAt(sort: Desc)])
  @@index([gameId, score(sort: Desc)])
}

enum UnlockMethod { COINS AD FREE_DAILY TOURNAMENT GIFTED }

// ─────────────── REWARDS ───────────────
model MissionTemplate {
  id          String  @id @default(cuid())
  kind        MissionKind
  titleAr     String
  target      Int
  rewardCoins Int
  rewardXp    Int     @default(0)
  cadence     Cadence @default(DAILY)
  gameId      String?
  weight      Int     @default(100)
  isActive    Boolean @default(true)

  assignments MissionAssignment[]
}

enum MissionKind { PLAY_N_GAMES PLAY_SPECIFIC_GAME SCORE_ABOVE WATCH_N_ADS WIN_STREAK INVITE_FRIEND SEND_GIFT }
enum Cadence     { DAILY WEEKLY SEASONAL }

model MissionAssignment {
  id         String  @id @default(cuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  templateId String
  template   MissionTemplate @relation(fields: [templateId], references: [id])
  progress   Int     @default(0)
  claimedAt  DateTime?
  periodKey  String            // "2026-09-20" or "2026-W38"
  expiresAt  DateTime

  @@unique([userId, templateId, periodKey])
  @@index([userId, expiresAt])
}

model LootTable {
  id      String      @id @default(cuid())
  name    String      @unique
  costCoins Int
  pityAt  Int         @default(10)
  entries LootEntry[]
}

model LootEntry {
  id       String    @id @default(cuid())
  tableId  String
  table    LootTable @relation(fields: [tableId], references: [id])
  weight   Int
  rarity   Rarity
  kind     RewardKind
  payload  Json       // {coins:200} | {itemId:"frame_gold"} | {tickets:5}
}

enum Rarity     { COMMON RARE EPIC LEGENDARY }
enum RewardKind { COINS TICKETS ITEM XP FREE_PLAY }

// ─────────────── INVENTORY ───────────────
model Item {
  id        String   @id            // "frame_gold"
  kind      ItemKind
  titleAr   String
  assetUrl  String?
  priceCoins Int?
  priceTickets Int?
  isActive  Boolean  @default(true)
  users     UserItem[]
}

enum ItemKind { AVATAR_FRAME CARD_SKIN NAME_COLOR BADGE BOOSTER }

model UserItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id])
  equipped  Boolean  @default(false)
  expiresAt DateTime?
  acquiredAt DateTime @default(now())

  @@unique([userId, itemId])
}

// ─────────────── GIFTS ───────────────
model GiftTransfer {
  id          String   @id @default(cuid())
  senderId    String
  recipientId String?
  claimCode   String?  @unique     // for share-a-link gifts
  amount      Int
  feeBurned   Int
  status      GiftStatus @default(PENDING)
  message     String?
  createdAt   DateTime @default(now())
  claimedAt   DateTime?
  expiresAt   DateTime

  @@index([senderId, createdAt])
  @@index([recipientId, createdAt])
}

enum GiftStatus { PENDING CLAIMED EXPIRED REVERSED BLOCKED }

model PromoCode {
  id          String   @id @default(cuid())
  code        String   @unique
  rewardKind  RewardKind
  payload     Json
  maxUses     Int      @default(1)
  usedCount   Int      @default(0)
  perUserLimit Int     @default(1)
  startsAt    DateTime @default(now())
  expiresAt   DateTime
  redemptions PromoRedemption[]
}

model PromoRedemption {
  id      String    @id @default(cuid())
  codeId  String
  code    PromoCode @relation(fields: [codeId], references: [id])
  userId  String
  createdAt DateTime @default(now())

  @@unique([codeId, userId])
}

// ─────────────── ADS & REVENUE ───────────────
model AdImpression {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  gameId       String?
  placement    String              // "unlock" | "double_reward" | "continue"
  network      String
  nonce        String   @unique    // issued at start, burned at postback
  status       AdStatus @default(STARTED)
  revenueMicros Int?               // fill from network reporting API
  startedAt    DateTime @default(now())
  completedAt  DateTime?

  @@index([userId, startedAt])
  @@index([status, startedAt])
}

enum AdStatus { STARTED COMPLETED REJECTED EXPIRED }

// ─────────────── ANALYTICS ───────────────
model Event {
  id        BigInt   @id @default(autoincrement())
  userId    String?
  name      String              // "play_start", "reward_claim", "gift_sent"
  props     Json
  sessionId String?
  createdAt DateTime @default(now())

  @@index([name, createdAt])
  @@index([userId, createdAt])
}
// Partition by month (`PARTITION BY RANGE (createdAt)`), drop old partitions,
// export to a warehouse when this table passes ~50M rows.

model LeaderboardSnapshot {
  id        String   @id @default(cuid())
  gameId    String
  periodKey String              // "2026-09-20" | "2026-W38"
  userId    String
  rank      Int
  score     Int
  payout    Int      @default(0)
  createdAt DateTime @default(now())

  @@unique([gameId, periodKey, userId])
  @@index([gameId, periodKey, rank])
}
```

### Redis keyspace

```
sess:token:{uuid}            → {userId,gameId,sessionId}   TTL 90s, burn on use
ad:nonce:{nonce}             → {userId,gameId,placement}   TTL 300s
rl:{route}:{userId}          → counter                     TTL 60s
lock:balance:{userId}        → mutex for balance mutation  TTL 5s
lb:{gameId}:{periodKey}      → ZSET userId→score           TTL 8d
streak:{userId}              → cached streak payload       TTL until midnight
cfg:remote                   → RemoteConfig cache          TTL 60s
```

---

## 7. Metrics that actually decide your tuning

| Metric | Target | How |
|---|---|---|
| D1 / D7 / D30 retention | 35% / 15% / 6% | cohort on `User.createdAt` vs `events` |
| Rewarded ads per DAU | **> 3.0** | `AdImpression` COMPLETED / DAU |
| Ad completion rate | > 85% | COMPLETED / STARTED — below 70% means UX or fraud |
| Sessions per DAU | > 4 | `PlaySession` |
| Coin inflation | net flow ≈ 0 | `SUM(delta)` over the day, by reason |
| Checkin claim rate | > 90% | automatic, not a button |
| Gift ring share | < 2% of coin volume | transfer-graph job |
| ARPDAU | $0.0075 → $0.012 | revenue / DAU |

**The single most useful query you will write:**

```sql
-- Daily faucet vs sink, by reason. Run this every morning.
SELECT date_trunc('day', "createdAt") AS d,
       reason,
       SUM(delta) AS net,
       COUNT(*)   AS n
FROM "LedgerEntry"
WHERE "createdAt" > now() - interval '14 days'
GROUP BY 1, 2
ORDER BY 1 DESC, ABS(SUM(delta)) DESC;
```

If `SUM(net)` across all reasons trends positive week over week, coins are inflating,
players stop watching ads, and revenue quietly dies. That is the number to watch.

---

## 8. API surface (additions)

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/economy/balance` | GET | session | Balance + level + streak, one call |
| `/api/economy/ledger` | GET | session | Paginated history — players will ask |
| `/api/sessions/start` | POST | session | Charges, mints session + signed JWT |
| `/api/sessions/verify` | POST | game HMAC | **Called by the external game before boot** |
| `/api/sessions/submit` | POST | game HMAC | Score + nonce → XP, missions, leaderboard |
| `/api/rewards/checkin` | POST | session | Idempotent per local day |
| `/api/rewards/missions` | GET | session | Today's assignments + progress |
| `/api/rewards/claim` | POST | session | `Idempotency-Key` required |
| `/api/rewards/lootbox/open` | POST | session | Server-rolled, pity-aware |
| `/api/gifts/send` | POST | session | All §4 rules enforced here |
| `/api/gifts/link` | POST | session | Mint shareable claim code |
| `/api/gifts/claim` | POST | session | Code or direct transfer |
| `/api/promo/redeem` | POST | session | |
| `/api/ads/start` | POST | session | Issues nonce → Redis |
| `/api/ads/postback` | POST | HMAC | Verify nonce, burn, credit |
| `/api/leaderboard/:gameId` | GET | optional | Redis ZSET, cached 10s |
| `/api/admin/*` | ALL | ADMIN | Grants, clawbacks, freezes — **all ledgered** |

---

## 9. Build order

**Phase 0 — stop the bleeding (this week)**
1. Close the direct-URL hole: `/api/sessions/verify` + game-side boot check.
2. `LedgerEntry` + `mutateBalance()`; migrate existing balances as `SIGNUP_GRANT` entries.
3. Atomic deduction with `updateMany` guard.
4. Move `playCost` into the `Game` table; delete the hardcoded `COST = 10`.
5. Rate limits on unlock/claim.

**Phase 1 — retention (weeks 2–3)**
6. Streaks with freeze + local-day handling.
7. Daily missions + cron assignment.
8. XP and levels.
9. `events` table wired into every meaningful action.

**Phase 2 — revenue (week 4)**
10. Real ad network with nonce-based postback and HMAC.
11. `AdImpression` + ad-per-DAU dashboard.
12. "Double your reward" placement after a run ends — usually the highest-yield slot.

**Phase 3 — social (weeks 5–6)**
13. Gifting + fee burn + fraud graph job.
14. Referral with L3 gate.
15. Gift links for acquisition.

**Phase 4 — depth (week 7+)**
16. Cosmetics shop (your best pure sink).
17. Daily leaderboards + payouts.
18. Loot boxes with published odds and pity.
19. Seasons.

---

## 10. Things that will bite you if you skip them

- **Timezone.** Streaks and dailies in UTC will break for every Moroccan player at midnight.
- **Idempotency.** Mobile networks retry. Without keys you will double-credit rewards.
- **Balance cache drift.** Run a nightly reconciliation:
  `SUM(delta) FROM LedgerEntry GROUP BY userId` vs `User.coins`. Alert on any mismatch.
- **Config in code.** Every number in §2 belongs in `RemoteConfig`. You will change them
  ten times in the first month, and you do not want ten deploys.
- **Deleting users.** Soft-delete only (`status = BANNED`). The ledger must stay intact.
- **Publishing loot odds.** Do it from day one; retrofitting it looks like an admission.
- **No admin tool.** You will need to grant coins to an angry player at 23:00. Build the
  admin grant route in Phase 0 and ledger it like everything else.
