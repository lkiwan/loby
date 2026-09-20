# DARJA ARCADE — Ads Integration (choice + full implementation)

Companion to `ARCHITECTURE.md` and `REWARDS_ECONOMY_ARCHITECTURE.md`.

**Your setup:** Next.js lobby on your own server/domain, Postgres + Redis on your server,
4 games hosted as separate Vercel apps loaded in iframes, mobile-first, Morocco/MENA traffic.

---

## 1. The decision

> **Use Google AdSense H5 Games Ads (Ad Placement API), running in the lobby only.**

Everything else is a fallback. Reasons, in order of importance:

1. **It is one of the very few networks that serves rewarded video to a mobile browser.**
   AdMob, Unity Ads, AppLovin and ironSource sell native app inventory only. Their SDKs
   cannot fill a browser game. If you were planning on AdMob — stop, it will not work.
2. **Highest demand pool available to web.** It is backed by AdSense/Google Ads demand,
   which is the deepest advertiser pool on the open web.
3. **Free, no traffic minimum, no revenue share negotiation.** Most other web rewarded
   networks (AppLixir, Venatus, Playwire, AdinPlay) want 5k+ DAU or 500k pageviews/month
   before they talk to you. You do not have that yet.
4. **One script tag.** No build step, no native wrapper, no store submission.
5. **It works in Morocco** — AdSense pays MA publishers, and the audience is servable.

### The catch you must design around

**AdSense H5 has no server-to-server (S2S) reward callback.** The "ad finished" signal
arrives in the browser (`adViewed` / `breakStatus === 'viewed'`), not from Google's servers
to yours.

Your current `ARCHITECTURE.md` assumes a real S2S postback at `/api/ads/postback`. That
endpoint is still useful — but with Google it will be **your own client calling it with a
signed nonce**, not Google calling it. §4 shows how to make that nearly as safe. Do not
skip that section; a naive `POST /reward` after an ad is a free coin printer.

---

## 2. Why not the others

| Network | Web rewarded? | S2S callback | Verdict for you |
|---|---|---|---|
| **AdSense H5 Games Ads** | ✅ | ❌ | **Pick this.** Best eCPM available to web, no minimums |
| Google Ad Manager (GAM) H5 | ✅ | ❌ | Same formats, better controls — but needs scale to be worth the setup |
| AdMob | ❌ app only | ✅ | Only if you ship a real Android/iOS app later |
| Unity Ads / ironSource / AppLovin MAX | ❌ app only | ✅ | Not usable in a browser. Ignore. |
| AppLixir | ✅ | partial | Good web-specific fallback, wants ~5k DAU |
| ayetStudios HTML5 video | ✅ | ✅ signed S2S | The only one that fits your postback design natively. Lower demand quality. Keep as **fill fallback**. |
| Adsterra / Monetag / PropellerAds | popunders, "rewarded interstitial" | partial | Accepts anyone, pays in MENA, but will wreck retention and can get you blacklisted from Google later. **Do not start here.** |
| GameMonetize / GameDistribution | ✅ | ❌ | Requires hosting your games on their platform. Conflicts with your own lobby. |

**Waterfall plan:** AdSense H5 as primary. If fill rate in Morocco drops below ~70%,
add ayetStudios as a secondary call when `breakStatus === 'noAdPreloaded'`. Never run two
SDKs simultaneously on the same page.

---

## 3. Where the ad runs — and why your architecture is already right

This is the most important structural point in the document.

```
✅  Ad runs HERE (your domain, you own ads.txt)
┌──────────────────────────────────────────────┐
│  darja-arcade.ma  — the LOBBY                │
│  ┌────────────────────────────────────────┐  │
│  │  AdSense H5 SDK loaded once, in root   │  │
│  │  layout. Rewarded ad plays fullscreen  │  │
│  │  BEFORE the player enters the game.    │  │
│  └────────────────────────────────────────┘  │
│                    │ token                   │
│                    ▼                          │
│  ┌────────────────────────────────────────┐  │
│  │  <iframe src="mafia.vercel.app">       │  │  ❌ NO ad SDK here
│  │  Pure game. Zero ad code.              │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**You cannot serve AdSense on `*.vercel.app`.** AdSense requires `ads.txt` at the root of
the domain showing ads, and you do not control `vercel.app/ads.txt`. Any attempt to run
ads inside the game iframes will fail verification or get your account flagged.

Your existing "watch ad in the lobby → receive token → enter game" flow sidesteps this
completely. Keep it. The games stay ad-free and you keep 100% of the ad surface on a
domain you own.

**Required:** `src/app/../public/ads.txt` on the lobby domain:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

If you later add ayetStudios, append the lines from their dashboard to the **same** file.

---

## 4. The reward flow (nonce-signed, no S2S)

Because Google will not call your server, the reward must be claimed by the client — so
the claim has to be unforgeable and single-use.

```
1. User taps "شاهد إعلان"
   └─ POST /api/ads/start  { gameId, placement }
        ├─ rate-limit check (max 6 rewarded/day/user)
        ├─ nonce = randomUUID()
        ├─ Redis SETEX ad:nonce:{nonce} 300 {userId,gameId,placement,issuedAt}
        ├─ INSERT AdImpression(status=STARTED, nonce)
        └─ 200 { nonce }

2. Client calls adBreak({ type:'reward', ... })
        ├─ beforeReward(showAdFn) → enable your button, call showAdFn() on tap
        ├─ adViewed()   → ad fully watched
        └─ adDismissed()/adBreakDone → no reward

3. On adViewed only:
   └─ POST /api/ads/complete  { nonce }   (+ Idempotency-Key: nonce)
        ├─ GETDEL ad:nonce:{nonce}      ← burn; missing = replay or expired → 409
        ├─ elapsed = now - issuedAt; reject if < 5s or > 300s
        ├─ UPDATE AdImpression status=COMPLETED
        ├─ mutateBalance(userId, +25, AD_REWARD, idempotencyKey=nonce)
        │     OR generateGameToken() if placement === 'unlock'
        └─ 200 { redirectUrl | newBalance }
```

**Why this is safe enough:**

| Attack | Blocked by |
|---|---|
| Call `/complete` without watching | Needs a nonce, and nonce is only issued by `/start` |
| Replay the same nonce | `GETDEL` burns it; `LedgerEntry.idempotencyKey` is `@unique` |
| Script `/start` → `/complete` in a loop | 5s minimum elapsed + 6/day cap + rate limit |
| Farm nonces for later | 300s TTL |
| Multi-account farming | device fingerprint cap (§5 of the rewards doc) |

**Reconcile weekly.** Compare `COUNT(AdImpression WHERE status=COMPLETED)` against the
impressions Google reports in the AdSense H5 report (Reports → Filter → Ad format →
Rewarded). If your count is meaningfully higher, someone is forging completions. That
comparison *is* your S2S substitute.

---

## 5. Code

### 5.1 Load the SDK once — `src/app/layout.tsx`

```tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Script
          id="adsense-h5"
          strategy="afterInteractive"
          async
          crossOrigin="anonymous"
          data-ad-frequency-hint="45s"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
        />
        <Script id="adsense-h5-init" strategy="afterInteractive">{`
          window.adsbygoogle = window.adsbygoogle || [];
          window.adBreak  = function(o){ window.adsbygoogle.push(o); };
          window.adConfig = function(o){ window.adsbygoogle.push(o); };
          window.adConfig({
            preloadAdBreaks: 'on',
            sound: 'on',
            onReady: function(){ window.__adsReady = true; }
          });
        `}</Script>
        {children}
      </body>
    </html>
  );
}
```

`data-ad-frequency-hint` tells Google roughly how often interstitials may appear. It does
**not** limit rewarded ads (those are always user-initiated).

### 5.2 CSP / headers — `next.config.ts`

If you have a Content-Security-Policy, the ads will silently fail without these:

```ts
const csp = [
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagservices.com",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.vercel.app",
  "img-src 'self' data: https:",
  "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
].join("; ");
```

Also make sure the lobby page is **not** itself framed and that your game iframe uses
`sandbox="allow-scripts allow-same-origin allow-popups"` — nothing more.

### 5.3 Client hook — `src/lib/useRewardedAd.ts`

```ts
"use client";
import { useCallback, useState } from "react";

type Placement = "unlock" | "double_reward" | "continue" | "daily_bonus";
type Result =
  | { ok: true; payload: any }
  | { ok: false; reason: "no_fill" | "dismissed" | "error" | "capped" };

export function useRewardedAd() {
  const [busy, setBusy] = useState(false);

  const show = useCallback(
    (placement: Placement, gameId?: string): Promise<Result> =>
      new Promise(async (resolve) => {
        if (busy) return resolve({ ok: false, reason: "error" });
        setBusy(true);

        // 1) get a nonce from OUR server
        const startRes = await fetch("/api/ads/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placement, gameId }),
        });
        if (startRes.status === 429) {
          setBusy(false);
          return resolve({ ok: false, reason: "capped" });
        }
        const { nonce } = await startRes.json();

        let viewed = false;

        // 2) ask Google for a rewarded ad
        (window as any).adBreak({
          type: "reward",
          name: placement,
          beforeReward: (showAdFn: () => void) => showAdFn(), // we already had a user tap
          beforeAd: () => document.body.classList.add("ad-playing"),
          afterAd: () => document.body.classList.remove("ad-playing"),
          adViewed: () => { viewed = true; },
          adDismissed: () => { viewed = false; },
          adBreakDone: async (info: { breakStatus: string }) => {
            setBusy(false);
            if (!viewed && info.breakStatus !== "viewed") {
              return resolve({
                ok: false,
                reason: info.breakStatus === "noAdPreloaded" ? "no_fill" : "dismissed",
              });
            }
            // 3) claim the reward with the burned nonce
            const r = await fetch("/api/ads/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Idempotency-Key": nonce },
              body: JSON.stringify({ nonce }),
            });
            if (!r.ok) return resolve({ ok: false, reason: "error" });
            resolve({ ok: true, payload: await r.json() });
          },
        });
      }),
    [busy]
  );

  return { show, busy };
}
```

**Critical:** `adBreakDone` fires in every case — success, no fill, error, dismissal.
Resolve your promise there and nowhere else, or the UI will hang on no-fill.

### 5.4 `POST /api/ads/start`

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomUUID } from "crypto";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const DAILY_CAP = 6;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauth" }, { status: 401 });

  const { placement, gameId } = await req.json();
  const userId = session.user.id;
  const day = new Date().toISOString().slice(0, 10);

  // daily cap, atomic
  const capKey = `ad:cap:${userId}:${day}`;
  const count = await redis.incr(capKey);
  if (count === 1) await redis.expire(capKey, 60 * 60 * 26);
  if (count > DAILY_CAP) return Response.json({ error: "capped" }, { status: 429 });

  const nonce = randomUUID();
  await redis.setex(
    `ad:nonce:${nonce}`,
    300,
    JSON.stringify({ userId, gameId, placement, issuedAt: Date.now() })
  );

  await prisma.adImpression.create({
    data: { userId, gameId, placement, network: "adsense_h5", nonce, status: "STARTED" },
  });

  return Response.json({ nonce });
}
```

### 5.5 `POST /api/ads/complete`

```ts
const REWARD_COINS: Record<string, number> = {
  double_reward: 50,
  daily_bonus: 50,
  continue: 0,   // grants a life, not coins
  unlock: 0,     // grants a game token, not coins
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauth" }, { status: 401 });

  const { nonce } = await req.json();

  // burn the nonce — GETDEL is atomic, so a replay loses the race
  const raw = await redis.getdel(`ad:nonce:${nonce}`);
  if (!raw) return Response.json({ error: "invalid_or_used" }, { status: 409 });

  const data = JSON.parse(raw);
  if (data.userId !== session.user.id)
    return Response.json({ error: "mismatch" }, { status: 403 });

  const elapsed = Date.now() - data.issuedAt;
  if (elapsed < 5_000) {
    await prisma.adImpression.update({
      where: { nonce }, data: { status: "REJECTED" },
    });
    return Response.json({ error: "too_fast" }, { status: 400 });
  }

  await prisma.adImpression.update({
    where: { nonce }, data: { status: "COMPLETED", completedAt: new Date() },
  });

  if (data.placement === "unlock") {
    const token = await generateGameToken(data.userId, data.gameId);
    return Response.json({ redirectUrl: `/games/${data.gameId}?token=${token}` });
  }

  const amount = REWARD_COINS[data.placement] ?? 25;
  const entry = await mutateBalance(data.userId, amount, "AD_REWARD", nonce);
  return Response.json({ newBalance: entry.balanceAfter, awarded: amount });
}
```

Note `idempotencyKey = nonce`. If the phone retries the request on a flaky 3G connection,
Prisma throws `P2002` and you return the original entry instead of paying twice.

---

## 6. Placements, ranked by what they actually earn

Build them in this order.

| # | Placement | Trigger | Offer | Expected opt-in |
|---|---|---|---|---|
| 1 | **`double_reward`** | Run ends, score shown | "ضاعف مكافأتك ×2" | **50–70%** — highest-yield slot in mobile gaming |
| 2 | **`continue`** | Player dies with a good score | "كمل اللعب" | 30–45%, strongest at a personal best |
| 3 | **`unlock`** | Not enough coins to play | "شاهد إعلان والعب مجاناً" | 40–60%, you already have this |
| 4 | **`daily_bonus`** | Streak claim screen | "×2 على مكافأة اليوم" | 25–40% |
| 5 | `interstitial` | Between plays, capped 1 per 3 games | — | passive, low value, mildly hurts retention |

**Why #1 beats #3:** the unlock ad is a toll before the fun. The double-reward ad is a
bonus right after the dopamine hit, when the player already feels good. Same inventory,
roughly double the opt-in rate. If you only build one new placement, build that one — and
it requires the external games to report score back (`/api/sessions/submit`), which is
another reason to close that integration.

**Target:** 3+ rewarded views per DAU. You currently have 1 placement and are probably
under 1.0.

---

## 7. Policy rules that get accounts banned

These are not suggestions. AdSense disables serving first and discusses later.

- **Never auto-trigger a rewarded ad.** It must follow a user tap. `beforeReward` exists
  exactly for this.
- **No game audio while an ad is visible.** Mute in `beforeAd`, restore in `afterAd`.
- **Never place a button where the ad's close (✕) lands** — top-right corner. Accidental
  clicks are the #1 ban reason for web games. Add `body.ad-playing { pointer-events: none }`
  on your own UI while an ad shows.
- **Never click your own ads**, not once, not "to test". Use Google's test mode.
- **No ads on the login/register page**, no ads on pages with little content.
- Need a **privacy policy page** and a **consent banner** (TCF/GDPR for EU traffic — even
  if your audience is Moroccan, you will get EU visitors).
- Do not incentivise clicks, only views. Never say "اضغط على الإعلان".

---

## 8. Expected revenue — realistic Morocco numbers

Morocco is a low-CPM geo. Plan with these, not with US blog numbers:

| | Conservative | Realistic | Good |
|---|---|---|---|
| Rewarded eCPM (MA/MENA) | $0.80 | $2.00 | $4.00 |
| Rewarded views / DAU | 1.5 | 3.0 | 4.5 |
| **ARPDAU** | $0.0012 | $0.0060 | $0.0180 |
| **1,000 DAU / month** | $36 | $180 | $540 |
| **10,000 DAU / month** | $360 | $1,800 | $5,400 |

Two levers, and only one is yours: **eCPM is set by the market, views/DAU is set by your
design.** Going from 1.5 → 4.5 views is a 3× revenue increase you control entirely through
placements §6 and the economy tuning in the rewards doc.

**AdSense payment in Morocco:** threshold $100, paid by wire transfer to a MAD bank
account, ~21st of the following month. You will need to verify your address by PIN mail —
start that process early, it takes weeks.

---

## 9. Setup checklist

```
[ ] Buy a real domain. Point the lobby at it. (AdSense will not approve *.vercel.app)
[ ] Add: /privacy, /terms, /contact pages + an "About" section. Thin sites get rejected.
[ ] Apply for AdSense → verify site → verify address by PIN mail
[ ] Once approved, apply for H5 Games Ads (separate by-application form)
[ ] Put ads.txt in /public/ads.txt with your pub-ID
[ ] Add NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-… to env
[ ] Load the SDK in layout.tsx (§5.1) and fix your CSP (§5.2)
[ ] Build /api/ads/start and /api/ads/complete (§5.4, §5.5)
[ ] Delete the 5s mock modal and the polling loop from the lobby
[ ] Repurpose /api/ads/postback → keep it, guard it, use it only if you add ayetStudios
[ ] Add the AdImpression table + the weekly reconciliation query (§4)
[ ] Ship placement #1 (double_reward) — requires score submission from the games
[ ] Add a consent banner before taking EU traffic
```

---

## 10. What to delete from the current implementation

| Today | Replace with |
|---|---|
| 5-second mock ad modal | real `adBreak({type:'reward'})` |
| Client polls `/unlock` every 2s, max 10 | single `adBreakDone` callback |
| `ad_completed:{userId}:{gameId}` Redis key, TTL 120s | `ad:nonce:{nonce}`, TTL 300s |
| `AD_NETWORK_WEBHOOK_SECRET` in a query string | HMAC over the full payload (only if you add a real S2S network) |
| No ad cap | `ad:cap:{userId}:{day}`, 6/day |
| No impression record | `AdImpression` rows for every start and completion |

The polling design was a reasonable placeholder, but it has a hole: `/unlock` with
`paymentMethod:"ad"` grants a token whenever the Redis key exists, and nothing proves a
human watched anything. The nonce flow in §4 closes that.
