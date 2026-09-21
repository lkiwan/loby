'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Download, KeyRound, Loader2, X } from 'lucide-react';
import { downloadCsv, fmtDateTime, fmtDur } from '@/lib/csv';

type GameStat = {
  gameId: string;
  title: string;
  sessions: number;
  seconds: number;
  bestScore: number | null;
};

type RecentSession = {
  id: string;
  gameId: string;
  title: string;
  score: number | null;
  coinsSpent: number;
  unlockMethod: string;
  startedAt: string;
  endedAt: string | null;
};

type DetailData = {
  user: {
    id: string;
    username: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    coins: number;
    tickets: number;
    xp: number;
    level: number;
    referralCode: string | null;
    createdAt: string;
    lastSeenAt: string | null;
    locale: string;
    timezone: string;
  };
  carrier: { firstStartedAt: string | null; lastStartedAt: string | null; lastEndedAt: string | null; deviceCount: number };
  aggregate: { sessions: number; seconds: number };
  games: GameStat[];
  recentSessions: RecentSession[];
  providers: string[];
};

export default function UserDetailModal({
  userId,
  name,
  onClose,
  onChanged,
}: {
  userId: string;
  name: string;
  onClose: () => void;
  onChanged: (msg: string) => void;
}) {
  const [data, setData] = useState<DetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/stats`);
        const body = await res.json();
        if (ignore) return;
        if (!res.ok) {
          setError(body.error || 'Erreur de chargement.');
          return;
        }
        setData(body);
      } catch {
        if (!ignore) setError('Erreur réseau.');
      }
    })();
    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const changePw = async () => {
    if (pwBusy) return;
    setPwMsg(null);
    if (pw1.length < 6) {
      setPwMsg({ ok: false, text: 'Mot de passe trop court (6+ caractères).' });
      return;
    }
    if (pw1 !== pw2) {
      setPwMsg({ ok: false, text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    setPwBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw1 }),
      });
      const body = await res.json();
      if (!res.ok) {
        setPwMsg({ ok: false, text: body.error || 'Erreur.' });
        return;
      }
      setPw1('');
      setPw2('');
      setPwMsg({ ok: true, text: '✅ Mot de passe modifié.' });
      onChanged('🔑 Mot de passe du joueur modifié.');
    } finally {
      setPwBusy(false);
    }
  };

  const downloadSingle = () => {
    if (!data || downloading) return;
    setDownloading(true);
    const u = data.user;
    const rows = [
      ['Identifiant', u.id],
      ['Pseudo', u.username ?? ''],
      ['Email', u.email ?? ''],
      ['Téléphone', u.phone ?? ''],
      ['Rôle', u.role],
      ['Statut', u.status],
      ['Coins', u.coins],
      ['Tickets', u.tickets],
      ['XP', u.xp],
      ['Niveau', u.level],
      ['Code parrainage', u.referralCode ?? ''],
      ['Locale', u.locale],
      ['Fuseau', u.timezone],
      ['Fournisseurs', data.providers.join(', ')],
      ['Appareils enregistrés', data.carrier.deviceCount],
      ['Inscrit le', fmtDateTime(u.createdAt)],
      ['Dernière activité', u.lastSeenAt ? fmtDateTime(u.lastSeenAt) : '—'],
      ['Première partie', data.carrier.firstStartedAt ? fmtDateTime(data.carrier.firstStartedAt) : '—'],
      ['Dernière connexion', data.carrier.lastStartedAt ? fmtDateTime(data.carrier.lastStartedAt) : '—'],
      ['Dernière déconnexion', data.carrier.lastEndedAt ? fmtDateTime(data.carrier.lastEndedAt) : '—'],
      ['Nombre de parties', data.aggregate.sessions],
      ['Temps de jeu total', fmtDur(data.aggregate.seconds)],
      ['Temps de jeu total (s)', data.aggregate.seconds],
      ['Jeux joués', data.games.length],
    ];

    const gameRows = data.games.map((g) => [
      `Jeu - ${g.title}`,
      g.sessions,
      fmtDur(g.seconds),
      g.bestScore === null || g.bestScore === undefined ? '' : g.bestScore,
    ]);

    downloadCsv(`joueur-${u.username || u.email || u.id}.csv`, ['Champ', 'Valeur'], [...rows, ...gameRows]);
    setDownloading(false);
  };

  const info = (label: string, value: string | number) => (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
      <p className="font-cairo text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-0.5 font-cairo text-[13px] font-bold text-neutral-100">{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="anim-pop relative my-4 w-full max-w-3xl rounded-2xl border border-[#6b542e]/50 bg-[#141009] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <h2 className="font-grit text-lg uppercase tracking-wide text-[#f5eddc]">
              <span className="text-gold-sheen">Détail joueur</span> — {name}
            </h2>
            <p className="font-cairo text-[12px] font-semibold text-neutral-500">
              {data?.user.email ?? '…'} · ID {data?.user.id.slice(0, 14)}…
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadSingle} disabled={!data || downloading} className="btn-chunk btn-amber px-3 py-2 text-[12px]">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              CSV
            </button>
            <button onClick={onClose} className="btn-chunk btn-ghost-hollow px-3 py-2" aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error ? (
          <p className="p-6 font-cairo text-[13px] font-bold text-red-300">{error}</p>
        ) : !data ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {/* Profil */}
            <div>
              <h3 className="card-title mb-2">👤 Profil</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {info('Identifiant', data.user.id)}
                {info('Email', data.user.email ?? '—')}
                {info('Téléphone', data.user.phone ?? '—')}
                {info('Rôle', data.user.role)}
                {info('Statut', data.user.status)}
                {info('Locale', data.user.locale)}
                {info('Fuseau', data.user.timezone)}
                {info('Code parrainage', data.user.referralCode ?? '—')}
                {info('Fournisseur', data.providers.length ? data.providers.join(', ') : 'password')}
                {info('Appareils', data.carrier.deviceCount)}
                {info('XP', data.user.xp)}
                {info('Niveau', data.user.level)}
              </div>
            </div>

            {/* Activité */}
            <div>
              <h3 className="card-title mb-2">⏱️ Temps passé et activité</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {info('Inscrit le', fmtDateTime(data.user.createdAt))}
                {info('Dernière activité', data.user.lastSeenAt ? fmtDateTime(data.user.lastSeenAt) : '—')}
                {info('Première partie', data.carrier.firstStartedAt ? fmtDateTime(data.carrier.firstStartedAt) : '—')}
                {info('Dernière connexion', data.carrier.lastStartedAt ? fmtDateTime(data.carrier.lastStartedAt) : '—')}
                {info('Dernière déconnexion', data.carrier.lastEndedAt ? fmtDateTime(data.carrier.lastEndedAt) : '—')}
                {info('Nombre de parties', data.aggregate.sessions)}
                {info('Temps de jeu total', fmtDur(data.aggregate.seconds))}
                {info('Jeux joués', data.games.length)}
              </div>
            </div>

            {/* Jeux joués */}
            <div>
              <h3 className="card-title mb-2">🎮 Jeux joués</h3>
              {data.games.length === 0 ? (
                <p className="font-cairo text-[13px] font-semibold text-neutral-500">Aucune partie enregistrée.</p>
              ) : (
                <div className="scroll-x overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 font-cairo text-[11px] font-black uppercase tracking-wider text-neutral-500">
                        <th className="px-3 py-2">Jeu</th>
                        <th className="px-3 py-2 text-right">Parties</th>
                        <th className="px-3 py-2 text-right">Temps</th>
                        <th className="px-3 py-2 text-right">Meilleur score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.games.map((g) => (
                        <tr key={g.gameId} className="border-b border-white/5 font-cairo text-[13px]">
                          <td className="px-3 py-2 font-bold text-neutral-100">{g.title}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-neutral-300">{g.sessions}</td>
                          <td className="px-3 py-2 text-right font-bold text-amber-300">{fmtDur(g.seconds)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-neutral-300">{g.bestScore ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Dernières parties */}
            {data.recentSessions.length > 0 && (
              <div>
                <h3 className="card-title mb-2">🕒 20 dernières parties</h3>
                <ul className="flex flex-col gap-1.5">
                  {data.recentSessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 font-cairo text-[12px]"
                    >
                      <span className="min-w-0 truncate font-bold text-neutral-200">{s.title}</span>
                      <span className="shrink-0 font-semibold text-neutral-500">
                        {s.score !== null && s.score !== undefined ? `Score ${s.score} · ` : ''}
                        {fmtDateTime(s.startedAt)}{s.endedAt ? ' → ' + fmtDateTime(s.endedAt) : ' (en cours)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mot de passe */}
            <div>
              <h3 className="card-title mb-2">🔑 Changer le mot de passe</h3>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="relative flex-1">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="Nouveau mot de passe (6+)"
                    className="field pl-9"
                    autoComplete="new-password"
                  />
                </div>
                <div className="relative flex-1">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="field pl-9"
                    autoComplete="new-password"
                  />
                </div>
                <button onClick={changePw} disabled={pwBusy} className="btn-chunk btn-amber px-4 py-2.5">
                  {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Valider
                </button>
              </div>
              {pwMsg && (
                <p
                  className={`mt-2 flex items-center gap-2 font-cairo text-[12px] font-bold ${
                    pwMsg.ok ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {pwMsg.ok ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {pwMsg.text}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}