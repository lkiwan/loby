/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const GAMES = [
  {
    id: 'mafia',
    slug: 'mafia',
    titleAr: 'مافيا د الحومة',
    titleFr: "L'MAFIA D'LHOUMA",
    embedUrl: 'https://mafia-dl7oma.vercel.app/',
    playCost: 15,
    continueCost: 15,
    sortOrder: 0,
    playable: true,
  },
  {
    id: 'paint-followers',
    slug: 'paint-followers',
    titleAr: 'ارسم كلمة',
    titleFr: 'Paint Followers',
    embedUrl: 'https://paint-followers.vercel.app/',
    playCost: 10,
    continueCost: 15,
    sortOrder: 1,
    playable: true,
  },
  {
    id: '7azr-fazr',
    slug: '7azr-fazr',
    titleAr: 'حزر فزر',
    titleFr: '7AZR FAZR',
    embedUrl: 'https://7azr-fazr-six.vercel.app/',
    playCost: 10,
    continueCost: 15,
    sortOrder: 2,
    playable: true,
  },
  {
    id: 'bara-salfa',
    slug: 'bara-salfa',
    titleAr: 'برا السالفة',
    titleFr: 'Bara Salfa',
    embedUrl: 'https://bara-salfa-bdarija.vercel.app/',
    playCost: 20,
    continueCost: 15,
    sortOrder: 3,
    playable: true,
  },
];

const CONFIG = {
  signupGrant: 100,
  checkinLadder: [25, 35, 50, 75, 100, 150, 250],
  adRewardCoins: 25,
  adDailyCap: 6,
  giftFeePct: 10,
  referralBonus: 50,
  freeFirstPlayDaily: true,
  missionDailyCount: 3,
  missionWeeklyCount: 1,
  xpBase: 10,
  xpCap: 50,
};

const MISSIONS = [
  { key: 'play_n_games_daily', kind: 'PLAY_N_GAMES', titleAr: 'العب 3 لوعات اليوم', target: 3, rewardCoins: 20, cadence: 'DAILY', weight: 100 },
  { key: 'play_specific_game_daily', kind: 'PLAY_SPECIFIC_GAME', titleAr: 'العب الطاولة اللي ما لعبتيش بزاف', target: 1, rewardCoins: 30, cadence: 'DAILY', weight: 80 },
  { key: 'watch_n_ads_daily', kind: 'WATCH_N_ADS', titleAr: 'شاهد إعلانين', target: 2, rewardCoins: 20, cadence: 'DAILY', weight: 70 },
  { key: 'play_n_games_weekly', kind: 'PLAY_N_GAMES', titleAr: 'العب 10 لوعات فالأسبوع', target: 10, rewardCoins: 200, cadence: 'WEEKLY', weight: 100 },
  { key: 'win_streak_weekly', kind: 'WIN_STREAK', titleAr: 'اربح 3 ديجّات متتاليين', target: 3, rewardCoins: 50, cadence: 'WEEKLY', weight: 60 },
];

async function main() {
  for (const g of GAMES) {
    const hmacSecret = crypto.randomBytes(32).toString('hex');
    await prisma.game.upsert({
      where: { id: g.id },
      update: {
        slug: g.slug,
        titleAr: g.titleAr,
        titleFr: g.titleFr,
        embedUrl: g.embedUrl,
        playCost: g.playCost,
        continueCost: g.continueCost,
        sortOrder: g.sortOrder,
        isActive: true,
      },
      create: {
        id: g.id,
        slug: g.slug,
        titleAr: g.titleAr,
        titleFr: g.titleFr,
        embedUrl: g.embedUrl,
        hmacSecret,
        playCost: g.playCost,
        continueCost: g.continueCost,
        sortOrder: g.sortOrder,
      },
    });
  }

  for (const [key, value] of Object.entries(CONFIG)) {
    await prisma.remoteConfig.upsert({
      where: { key },
      update: { value: JSON.parse(JSON.stringify(value)) },
      create: { key, value: JSON.parse(JSON.stringify(value)) },
    });
  }

  for (const m of MISSIONS) {
    await prisma.missionTemplate.upsert({
      where: { key: m.key },
      update: {
        kind: m.kind,
        titleAr: m.titleAr,
        target: m.target,
        rewardCoins: m.rewardCoins,
        cadence: m.cadence,
        weight: m.weight,
        isActive: true,
      },
      create: m,
    });
  }

  console.log('Seeded games, config and missions.');
  console.log('Game HMAC secrets are stored in DB. Configure each external game with its own secret.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());