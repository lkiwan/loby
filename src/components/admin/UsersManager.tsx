'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import {
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

type UserRow = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: 'PLAYER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'FROZEN' | 'BANNED';
  coins: number;
  tickets: number;
  xp: number;
  level: number;
  referralCode: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  _count: { sessions: number; devices: number; adImpressions: number };
  accounts: { provider: string }[];
};

type Draft = {
  username: string;
  email: string;
  phone: string;
  role: UserRow['role'];
  status: UserRow['status'];
  coins: number;
  tickets: number;
};

const ROLES: UserRow['role'][] = ['PLAYER', 'MODERATOR', 'ADMIN'];
const STATUSES: UserRow['status'][] = ['ACTIVE', 'FROZEN', 'BANNED'];

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

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(d));
}

function fmtAgo(d: string | null | undefined): string {
  if (!d) return '—';
  const mins = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
  if (mins < 1) return 'à l’instant';
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export default function UsersManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    getSession().then((s) => setMeId(s?.user?.id ?? null));
  }, []);

  const fetchUsers = useCallback(async (q: string) => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (res.ok) setUsers(data.users);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchUsers(search).finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const draftOf = (u: UserRow): Draft =>
    drafts[u.id] ?? {
      username: u.username ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      role: u.role,
      status: u.status,
      coins: u.coins,
      tickets: u.tickets,
    };

  const isDirty = (u: UserRow): boolean => {
    const d = draftOf(u);
    return (
      d.username !== (u.username ?? '') ||
      d.email !== (u.email ?? '') ||
      d.phone !== (u.phone ?? '') ||
      d.role !== u.role ||
      d.status !== u.status ||
      d.coins !== u.coins ||
      d.tickets !== u.tickets
    );
  };

  const setDraft = (u: UserRow, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [u.id]: { ...draftOf(u), ...patch } }));
  };

  const notify = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage((m) => (m?.text === text ? null : m)), 4000);
  };

  const save = async (u: UserRow) => {
    if (busyId) return;
    setBusyId(u.id);
    setMessage(null);
    const d = draftOf(u);
    try {
      const patch: Record<string, unknown> = {};
      if (d.username !== (u.username ?? '')) patch.username = d.username;
      if (d.email !== (u.email ?? '')) patch.email = d.email;
      if (d.phone !== (u.phone ?? '')) patch.phone = d.phone;
      if (d.role !== u.role) patch.role = d.role;
      if (d.status !== u.status) patch.status = d.status;
      if (d.coins !== u.coins) patch.coins = d.coins;
      if (d.tickets !== u.tickets) patch.tickets = d.tickets;

      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('err', data.error || 'Erreur lors de l’enregistrement.');
        return;
      }
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...data.user } : x)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[u.id];
        return next;
      });
      notify('ok', `✅ ${d.username || 'Joueur'} mis à jour.`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u: UserRow) => {
    if (busyId) return;
    const name = u.username || u.email || u.id;
    if (!window.confirm(`Supprimer définitivement le profil "${name}" ?\nCeci efface sessions, jetons, comptes et historique.`)) {
      return;
    }
    setBusyId(u.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        notify('err', data.error || 'Erreur lors de la suppression.');
        return;
      }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      notify('ok', `🗑️ Profil "${name}" supprimé.`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="card-title">👥 Gestion des joueurs</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-cairo text-[11px] font-bold text-neutral-400">
            {users.length} affichés
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (pseudo, email, tél)"
              className="field pl-9"
            />
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchUsers(search).finally(() => setLoading(false));
            }}
            disabled={loading}
            className="btn-chunk btn-ghost-hollow px-3 py-2.5"
            title="Actualiser"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`anim-shake mb-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-3 font-cairo text-[13px] font-bold ${
            message.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-950/60 text-emerald-200'
              : 'border-red-500/30 bg-red-950/60 text-red-200'
          }`}
        >
          {message.type === 'ok' ? <Check className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />}
          {message.text}
        </div>
      )}

      <div className="scroll-x overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 font-cairo text-[11px] font-black uppercase tracking-wider text-neutral-500">
              <th className="px-3 py-2">Joueur</th>
              <th className="px-3 py-2">Rôle</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2 text-right">🪙 Coins</th>
              <th className="px-3 py-2 text-right">🎟️ Tickets</th>
              <th className="px-3 py-2 text-right">Lvl</th>
              <th className="px-3 py-2">Activité</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center font-cairo text-[13px] font-semibold text-neutral-500">
                  {loading ? 'Chargement…' : 'Aucun joueur trouvé.'}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const d = draftOf(u);
                const dirty = isDirty(u);
                return (
                  <tr key={u.id} className="border-b border-white/5 align-top font-cairo text-[13px] transition hover:bg-white/[0.04]">
                    <td className="px-3 py-2.5">
                      <input
                        value={d.username}
                        onChange={(e) => setDraft(u, { username: e.target.value })}
                        className="field mb-1.5 !py-1.5 text-[13px]"
                        placeholder="pseudo"
                      />
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                        <Mail className="h-3 w-3" />
                        <input
                          value={d.email}
                          onChange={(e) => setDraft(u, { email: e.target.value })}
                          className="w-full bg-transparent font-semibold text-neutral-400 outline-none placeholder:text-neutral-600"
                          placeholder="email"
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                        <Phone className="h-3 w-3" />
                        <input
                          value={d.phone}
                          onChange={(e) => setDraft(u, { phone: e.target.value })}
                          className="w-full bg-transparent font-semibold text-neutral-400 outline-none placeholder:text-neutral-600"
                          placeholder="téléphone"
                        />
                      </div>
                      <span className="mt-1.5 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase text-neutral-400">
                        {u.accounts.length > 0 ? u.accounts[0].provider : 'password'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={d.role}
                        onChange={(e) => setDraft(u, { role: e.target.value as UserRow['role'] })}
                        className="field !py-2 text-[12px]"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-black ${roleBadge[d.role] ?? roleBadge.PLAYER}`}>
                        {d.role}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={d.status}
                        onChange={(e) => setDraft(u, { status: e.target.value as UserRow['status'] })}
                        className="field !py-2 text-[12px]"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-black ${statusBadge[d.status] ?? statusBadge.ACTIVE}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={d.coins}
                        onChange={(e) => setDraft(u, { coins: Math.max(0, Number(e.target.value) || 0) })}
                        className="field w-24 !py-1.5 text-right text-[13px] font-bold tabular-nums text-amber-300"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={d.tickets}
                        onChange={(e) => setDraft(u, { tickets: Math.max(0, Number(e.target.value) || 0) })}
                        className="field w-24 !py-1.5 text-right text-[13px] font-bold tabular-nums text-amber-300"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-neutral-300">
                      {u.level}
                      <span className="block text-[10px] font-semibold text-neutral-600">
                        {u.xp} XP · {u._count.sessions} parties
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[11px] font-semibold text-neutral-400">Inscrit : {fmtDate(u.createdAt)}</p>
                      <p className="text-[11px] font-semibold text-neutral-500">Vu : {fmtAgo(u.lastSeenAt)}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => save(u)}
                          disabled={busyId !== null || !dirty}
                          title="Enregistrer les modifications"
                          className={`btn-chunk px-2.5 py-2 text-[11px] ${dirty && busyId === null ? 'btn-amber' : 'btn-ghost-hollow'} disabled:opacity-40`}
                        >
                          {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={busyId !== null || u.id === meId}
                          title={u.id === meId ? 'Impossible de supprimer votre propre compte' : 'Supprimer le profil'}
                          className="btn-chunk btn-blood px-2.5 py-2 text-[11px] disabled:opacity-40"
                        >
                          {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                        {u.role === 'ADMIN' && <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-cairo text-[11px] font-semibold text-neutral-600">
        Les changements de solde sont tracés dans le ledger (ADMIN_GRANT / ADMIN_CLAWBACK). Cliquez sur 💾 pour enregistrer une ligne.
      </p>
    </section>
  );
}