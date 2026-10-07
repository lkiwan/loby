# Strategic Ad Placement Plan: "PlayM3ana Monetization"

The goal of this plan is to **maximize ad revenue (eCPM)** while **minimizing player friction**. The core philosophy is to shift away from cheap, annoying "auto-loading" banners and focus on **Opt-In Rewarded Ads** and **Native Placements**.

## 1. High-Value "Opt-In" Rewarded Ads (The Moneymaker)
Rewarded ads pay the most and players actually *like* them because they get something in return.

*   **Current: "Watch to Play" (Keep & Enhance)**
    *   *Where:* When a user clicks a game but lacks coins.
    *   *Improvement:* Instead of a Native Banner with a fake 5-second timer, use a real **Rewarded Video Ad**. It pays 10x more and feels more premium.
*   **New: "Double Your Winnings"**
    *   *Where:* On the Game Over / Match Results screen.
    *   *Action:* If a player wins 50 coins, show a button: `📺 تفرج فإشهار و ضاعف الربح (100)`.
    *   *Why:* Players are euphoric after a win and highly likely to click this.
*   **New: "Daily Mystery Chest"**
    *   *Where:* A floating gift icon in the Lobby header.
    *   *Action:* "Open daily chest for free coins — Sponsored by our partners." Triggers a 15-30 second video ad before opening.

## 2. Seamless Native Ads (Medium Value, Zero Disturbance)
Native ads match the look and feel of your app. They don't look like cheap banners.

*   **New: "Sponsored Game Card"**
    *   *Where:* Inside the horizontal scrolling "✨ اللعاب الجدد اليوم" (New Games) row.
    *   *Action:* Make the 3rd or 4th card in the scroll an `AdNativeBanner` styled to look EXACTLY like a game card. 
    *   *Why:* As players swipe through games, their eyes naturally hit the ad without it breaking the UI layout.
*   **New: Leaderboard Interruption**
    *   *Where:* On the `/leaderboard` page, right below the Top 3 players.
    *   *Action:* Insert a sleek native ad separating the "Kings" of the leaderboard from the rest of the players. 

## 3. Interstitial / Pop Ads (High Value, High Annoyance)
These are full-screen ads. Use them *very* carefully so players don't rage-quit.

*   **New: The "Every 3rd Game" Rule**
    *   *Where:* In the transition screen *after* leaving a game room and returning to the lobby.
    *   *Action:* Keep a counter in the user's session. Only show a pop-up/interstitial ad on their 3rd, 6th, and 9th game played. 
    *   *Why:* Never interrupt a user *entering* a game (they will leave). Interrupt them when they are already finished and relaxed.

## 4. Banner Ads (Low Value)
Banners pay very little. They should only be used to fill empty space.

*   **Remove:** The random `AdBanner` sitting in the middle of the Lobby page. It pushes content down and causes accidental clicks (which ad networks penalize you for).
*   **Keep/Move:** If you must have a banner, make it a sticky 320x50 at the very bottom of the screen (just above the mobile tab bar).

---

### Implementation Roadmap Checklist
- [ ] Upgrade the "Missions" and "Play Modal" ads from Native Banners to actual Rewarded Video networks (like Google AdMob/AdSense H5 Rewarded).
- [ ] Build the "Double Winnings" button component for the post-game screen.
- [ ] Move the current Lobby `AdBanner` into the horizontal scrolling games list as a fake "Game Card".
- [ ] Implement the "Every 3 Games" counter logic in `src/app/games/[gameId]/page.tsx`.

