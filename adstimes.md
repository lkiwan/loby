# Ad Placements and Triggers

Here is a detailed breakdown of every single ad placement in the application, categorized by whether they appear automatically (without any touch) or manually (triggered by a specific user touch/action).

## 1. Ads Shown Automatically (Without Any Touch)
These ads are rendered natively as part of the page structure. They load automatically when the user browses the page.

| Ad Component | Ad Network / Format | Location in App | Trigger / When it shows | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `<AdBanner />` | Iframe Banner (`bauval.org`) | **Main Lobby** (`src/app/page.tsx`) | **Automatically on page load.** Appears statically near the bottom of the Lobby screen, below the Guest Notice and Missions. | To passively monetize users scrolling through the main menu before they decide to play a game. |

## 2. Ads Shown Manually (Triggered by a User "Touch")
These ads are placed behind specific actions. They are used as a "Rewarded Ad" mechanism—the user trades their attention (and a 5-second wait) to unlock a feature or claim a reward.

| Ad Component | Ad Network / Format | Location in App | The "Touch" (User Action) | What Happens After Touch | Reward / Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `<AdNativeBanner />` | Native Script (`bauval.org`) | **Play Modal** (`src/app/page.tsx`) | **Touch:** Clicking **"Watch Ad" (تفرج فإشهار)** on a Game Card. | Opens a modal overlay, renders the Native Ad, and starts a **5-second countdown**. | Bypasses the coin cost; grants the user access to play the selected game for free. |
| `<AdNativeBanner />` | Native Script (`bauval.org`) | **Missions Panel** (`MissionsPanel.tsx`) | **Touch:** Clicking **"Claim" (جمع)** next to a completed daily mission (Mobile view). | Opens the mission claim screen, renders the Native Ad, and starts a **5-second countdown**. | Rewards the user with the mission's bonus Coins and XP. |
| `<AdNativeBanner />` | Native Script (`bauval.org`) | **Daily Missions Buttons** (`DailyMissionButtons.tsx`) | **Touch:** Clicking **"Claim" (جمع)** next to a completed daily mission (Desktop view). | Same as above; opens the claim screen, renders the ad, and counts down for 5 seconds. | Rewards the user with the mission's bonus Coins. |
| `useRewardedAd()` | Google AdSense H5 (`adBreak`) | **Game End Screen** (`src/app/games/[gameId]/page.tsx`) | **Touch:** Clicking **"Play Again"** inside a game, *only if* the user originally paid for that session using an Ad. | Calls Google's `adBreak` API to pop up a fullscreen interactive video or interstitial ad. | Allows the user to play another round of the same game without paying coins. |

### Summary of the Logic
The codebase has a very strict philosophy for Native Ads (`AdNativeBanner`). They are heavily tied to a **5-second countdown timer**. The only ad that shows up completely unprompted on the screen without clicking anything is the standard `AdBanner` at the bottom of the Lobby page.

