import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';
import { StarMark } from '@/components/Star';
import SignOutButton from '@/components/admin/AdminControls';

export const dynamic = 'force-dynamic';

const ONLINE_WINDOW_MIN = 15;

type RawGameStat = { gameId: string; sessions: number; seconds: bigint };
type RawUserStat = { userId: string; sessions: number; seconds: bigint };

function fmtHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h <= 0) return `${m} min`;
  if (m <= 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d);
}

function fmtAgo(d: Date | null | undefined): string {
  if (!d) return '—';
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return 'à l’instant';
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  MODERATOR: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  PLAYER: 'bg-white/5 text-neutral-400 border-white/10',
};

const statusBadge: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  FROZEN: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  BANNED: 'bg-red-500/20 text-red-300 border-red-500/40',
};

async function loadDashboard() {
  const [userStats, gameStats, players, games, devices] = await Promise.all([
    prisma.$queryRaw<RawUserStat[]>`
      SELECT "userId",
             COUNT(*)::int AS sessions,
             COALESCE(SUM(EXTRACT(EPOCH FROM ("endedAt" - "startedAt"))), 0)::bigint AS seconds
      FROM "PlaySession"
      WHERE "endedAt" IS NOT NULL
      GROUP BY "userId"
    `,
    prisma.$queryRaw<RawGameStat[]>`
      SELECT "gameId",
             COUNT(*)::int AS sessions,
             COALESCE(SUM(EXTRACT(EPOCH FROM ("endedAt" - "startedAt"))), 0)::bigint AS seconds
      FROM "PlaySession"
      WHERE "endedAt" IS NOT NULL
      GROUP BY "gameId"
    `,
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        coins: true,
        tickets: true,
        xp: true,
        level: true,
        streakCount: true,
        longestStreak: true,
        createdAt: true,
        lastSeenAt: true,
        _count: { select: { sessions: true, devices: true, adImpressions: true } },
        accounts: { select: { provider: true, providerAccountId: true } },
      },
    }),
    prisma.game.findMany({
      select: { id: true, titleAr: true, titleFr: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.device.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { lastSeenAt: 'desc' },
      take: 300,
    }),
  ]);

  const statMap = new Map<string, { sessions: number; seconds: number }>();
  let totalSeconds = 0;
  let endedSessions = 0;
  for (const row of userStats) {
    const seconds = Number(row.seconds);
    statMap.set(row.userId, { sessions: row.sessions, seconds });
    totalSeconds += seconds;
    endedSessions += row.sessions;
  }

  const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MIN * 60 * 1000);
  const onlinePlayers = players.filter((p) => p.lastSeenAt && p.lastSeenAt >= onlineSince);

  return {
    players,
    onlinePlayers,
    games,
    gameStats,
    statMap,
    totalSeconds,
    endedSessions,
    totalAllSessions: players.reduce((n, p) => n + p._count.sessions, 0),
    gmailCount: players.filter((p) => p.email?.toLowerCase().endsWith('@gmail.com')).length,
    googleAccounts: players.filter((p) => p.accounts.some((a) => a.provider === 'google')),
    devices,
  };
}

export default async function AdminPage() {
  await requireAdminUser();
  const data = await loadDashboard();

  const multiAccountDevices = new Map<string, { users: string[]; ips: Set<string> }>();
  for (const d of data.devices) {
    const entry = multiAccountDevices.get(d.fingerprint);
    if (entry) {
      entry.users.push(d.user.username ?? '?');
      entry.ips.add(d.ipHash);
    } else {
      multiAccountDevices.set(d.fingerprint, {
        users: [d.user.username ?? '?'],
        ips: new Set([d.ipHash]),
      });
    }
  }
  const suspects = [...multiAccountDevices.entries()]
    .map(([fp, v]) => ({ fingerprint: fp, count: new Set(v.users).size, ips: v.ips.size, users: [...new Set(v.users)] }))
    .filter((s) => s.count > 1)
    .sort((a, b) => b.count - a.count);

  const kpis = [
    { label: 'Joueurs inscrits', value: data.players.length, icon: '👥' },
    { label: `En ligne (${ONLINE_WINDOW_MIN} min)`, value: data.onlinePlayers.length, icon: '🟢' },
    { label: 'Comptes Gmail', value: data.gmailCount, icon: '📧' },
    { label: 'Heures de jeu', value: fmtHours(data.totalSeconds), icon: '⏱️' },
    { label: 'Parties jouées', value: data.endedSessions, icon: '🎮' },
  ];

  return (
    <main className="min-h-dvh bg-[#0d0b08] px-4 py-6 text-[#f1e7d6] sm:px-6 lg:px-10">
      {/* header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StarMark size={36} />
          <div>
            <h1 className="font-grit text-lg uppercase tracking-wide">
              <span className="text-gold-sheen">DARJA</span> ARCADE — ADMIN
            </h1>
            <p className="font-cairo text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-500">
              Panneau de supervision
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="btn-chunk btn-ghost-hollow px-4 py-2 text-[12px]"
          >
            👥 Gérer les joueurs
          </Link>
          <Link
            href="/"
            className="btn-chunk btn-ghost-hollow px-4 py-2 text-[12px]"
          >
            ← Retour lobby
          </Link>
          <SignOutButton />
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-[#6b542e]/40 bg-[#16110c] p-4 shadow-[0_18px_40px_-24px_rgba(0,0,0,.85)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {k.icon} {k.label}
            </p>
            <p className="mt-1.5 font-grit text-2xl text-[#f5eddc]">{k.value}</p>
          </div>
        ))}
      </section>

      {/* online + gmail side, playtime */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* ONLINE */}
        <div className="card">
          <h2 className="card-title">🟢 Joueurs en ligne</h2>
          {data.onlinePlayers.length === 0 ? (
            <p className="font-cairo text-[13px] font-semibold text-neutral-500">Personne en ce moment.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.onlinePlayers.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-cairo text-[13px] font-bold text-neutral-100">
                      {p.username ?? '—'}
                    </p>
                    <p className="truncate font-cairo text-[11px] font-semibold text-neutral-500">
                      {p.email ?? '—'}
                    </p>
                  </div>
                  <span className="shrink-0 font-cairo text-[11px] font-bold text-emerald-300">
                    {fmtAgo(p.lastSeenAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* GMAIL / GOOGLE accounts */}
        <div className="card">
          <h2 className="card-title">📧 Comptes Google connectés (Gmail)</h2>
          {data.googleAccounts.length === 0 ? (
            <p className="font-cairo text-[13px] font-semibold text-neutral-500">Aucun compte Google lié.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.googleAccounts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-cairo text-[13px] font-bold text-neutral-100">
                      {p.email}
                    </p>
                    <p className="truncate font-cairo text-[11px] font-semibold text-neutral-500">
                      @{p.username ?? '—'}
                    </p>
                  </div>
                  <span className="text-[11px]">🪙 {p.coins}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PLAYTIME PER GAME */}
        <div className="card">
          <h2 className="card-title">⏱️ Temps de jeu par jeu</h2>
          {data.gameStats.length === 0 ? (
            <p className="font-cairo text-[13px] font-semibold text-neutral-500">Aucune session terminée.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.gameStats
                .slice()
                .sort((a, b) => Number(b.seconds) - Number(a.seconds))
                .map((s) => {
                  const game = data.games.find((g) => g.id === s.gameId);
                  return (
                    <li
                      key={s.gameId}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-cairo text-[13px] font-bold text-neutral-100">
                          {game?.titleFr ?? s.gameId}
                        </p>
                        <p className="font-cairo text-[11px] font-semibold text-neutral-500">
                          {game?.titleAr ?? ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-right font-cairo text-[12px] font-bold text-amber-300">
                        {fmtHours(Number(s.seconds))}
                        <span className="block text-[10px] font-semibold text-neutral-500">
                          {s.sessions} parties
                        </span>
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </section>

      {/* PLAYERS */}
      <section className="card mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-title">🧑‍🤝‍🧑 Tous les joueurs ({data.players.length})</h2>
          <p className="font-cairo text-[11px] font-semibold text-neutral-500">
            {data.totalAllSessions} sessions démarrées · {data.endedSessions} terminées
          </p>
        </div>
        <div className="scroll-x overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 font-cairo text-[11px] font-black uppercase tracking-wider text-neutral-500">
                <th className="px-3 py-2">Joueur</th>
                <th className="px-3 py-2">Fournisseur</th>
                <th className="px-3 py-2">Rôle</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">🪙 Coins</th>
                <th className="px-3 py-2 text-right">Lvl</th>
                <th className="px-3 py-2 text-right">Streak</th>
                <th className="px-3 py-2 text-right">Parties</th>
                <th className="px-3 py-2 text-right">Temps de jeu</th>
                <th className="px-3 py-2">Inscrit</th>
                <th className="px-3 py-2">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {data.players.map((p) => {
                const stat = data.statMap.get(p.id);
                const provider = p.accounts.length > 0 ? p.accounts[0].provider : 'password';
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 font-cairo text-[13px] transition hover:bg-white/[0.04]"
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-bold text-neutral-100">{p.username ?? '—'}</p>
                      <p className="max-w-[200px] truncate text-[11px] font-semibold text-neutral-500">
                        {p.email ?? p.phone ?? '—'}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                          provider === 'google' ? 'border-emerald-500/40 text-emerald-300' : 'border-white/10 text-neutral-400'
                        }`}
                      >
                        {provider === 'google' ? 'Gmail' : 'Pass'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${roleBadge[p.role] ?? roleBadge.PLAYER}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusBadge[p.status] ?? statusBadge.ACTIVE}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums text-amber-300">{p.coins}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-neutral-300">{p.level}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-neutral-300">
                      {p.streakCount}
                      <span className="text-[10px] text-neutral-600"> /{p.longestStreak}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-neutral-300">{p._count.sessions}</td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums text-amber-200">
                      {stat ? fmtHours(stat.seconds) : '0 min'}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-400">{fmtDate(p.createdAt)}</td>
                    <td className="px-3 py-2.5 text-neutral-400">{fmtAgo(p.lastSeenAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MULTI-ACCOUNT SUSPECTS */}
      {suspects.length > 0 && (
        <section className="card mt-6">
          <h2 className="card-title">🚨 Multi-comptes détectés ({suspects.length})</h2>
          <div className="scroll-x overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 font-cairo text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  <th className="px-3 py-2">Appareil (empreinte)</th>
                  <th className="px-3 py-2">Comptes</th>
                  <th className="px-3 py-2">IPs</th>
                </tr>
              </thead>
              <tbody>
                {suspects.map((s) => (
                  <tr key={s.fingerprint} className="border-b border-white/5 font-cairo text-[13px]">
                    <td className="max-w-[220px] truncate px-3 py-2.5 font-mono text-[11px] text-neutral-400">
                      {s.fingerprint.slice(0, 24)}…
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-bold text-red-300">{s.count} comptes</p>
                      <p className="text-[11px] font-semibold text-neutral-500">{s.users.join(', ')}</p>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-neutral-300">{s.ips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="mt-8 border-t-2 border-[#6b542e]/30 pt-4 text-center">
        <p className="font-cairo text-[11px] font-semibold text-neutral-600">
          Darja Arcade — panneau admin · {data.players.length} joueurs · {fmtHours(data.totalSeconds)} de jeu au total
        </p>
      </footer>
    </main>
  );
}