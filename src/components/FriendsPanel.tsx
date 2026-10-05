'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, Users, Loader2, Trash2, UserPlus, Gamepad2 } from 'lucide-react';
import { Sounds } from '@/lib/sounds';

type Friend = { id: string; name: string };

const MAX_FRIENDS = 15;

const AVATAR_COLORS = [
  '#2DD4BF', '#F97066', '#F5B942', '#a855f7',
  '#3b82f6', '#ec4899', '#22c55e', '#f97316',
];

export default function FriendsPanel({
  onClose,
  onCountChange,
}: {
  onClose: () => void;
  onCountChange?: (count: number) => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        const list: Friend[] = data.friends ?? [];
        setFriends(list);
        onCountChange?.(list.length);
      }
    } catch {
      /* keep last known list */
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => { void fetchFriends(); }, [fetchFriends]);

  const addFriend = async () => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        Sounds.ok();
        setName('');
        await fetchFriends();
      } else {
        Sounds.error();
        setError(data.error ?? 'ما قدرناش نزيدو الصاحبي.');
      }
    } catch {
      Sounds.error();
      setError('مشكلة في الاتصال. عاود جرب.');
    } finally {
      setSaving(false);
    }
  };

  const removeFriend = async (id: string) => {
    if (removingId) return;
    setRemovingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/friends/${id}`, { method: 'DELETE' });
      if (res.ok) {
        Sounds.click();
        await fetchFriends();
      } else {
        const data = await res.json().catch(() => ({}));
        Sounds.error();
        setError(data.error ?? 'ما قدرناش نحيدو الصاحبي.');
      }
    } catch {
      Sounds.error();
      setError('مشكلة في الاتصال. عاود جرب.');
    } finally {
      setRemovingId(null);
    }
  };

  const full = friends.length >= MAX_FRIENDS;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bounce-in relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-[#2DD4BF]/25 bg-[#12294D] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10">
              <Users className="h-4 w-4 text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="font-lalezar text-lg text-[#FFF7E8] leading-none">الصاحبين ديالك</h2>
              <p className="mt-1 font-cairo text-[11px] text-[#B8C4D8]">
                {friends.length}/{MAX_FRIENDS} مسجلين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/30 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60dvh] overflow-y-auto p-5">
          {/* Add form */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <UserPlus className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2DD4BF]/60" />
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') void addFriend(); }}
                maxLength={14}
                disabled={full}
                placeholder={full ? 'وصلتي للحد ديال الصحاب' : 'زيد سمية الصاحبي…'}
                className="w-full rounded-xl border border-[#2DD4BF]/25 bg-[#0B1F3A] ps-9 pe-3 py-3 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/30 outline-none transition focus:border-[#2DD4BF]/60 disabled:opacity-40"
              />
            </div>
            <button
              onClick={() => void addFriend()}
              disabled={!name.trim() || saving || full}
              className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-[#F5B942] text-[#0B1F3A] transition active:scale-95 disabled:opacity-40"
              title="زيد"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="mt-2 font-cairo text-[11px] font-bold text-[#F97066]">{error}</p>
          )}

          {/* List */}
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#2DD4BF]" />
              </div>
            ) : friends.length === 0 ? (
              <div className="py-10 text-center">
                <p className="mb-3 text-4xl">🫱🏼‍🫲🏼</p>
                <p className="font-cairo text-sm text-[#B8C4D8]">ما كاين حتى صاحب مسجل</p>
                <p className="mt-1 font-cairo text-[11px] text-[#B8C4D8]/70">
                  زيد سميات الصحاب ديالك من فوق
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map((f, i) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
                  >
                    <div
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-cairo text-[13px] font-black text-[#0B1F3A]"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                    >
                      {f.name.trim()[0]?.toUpperCase() ?? '؟'}
                    </div>
                    <span className="flex-1 min-w-0 truncate font-cairo text-[13px] font-bold text-[#FFF7E8]">
                      {f.name}
                    </span>
                    <button
                      onClick={() => void removeFriend(f.id)}
                      disabled={removingId === f.id}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400 active:scale-90 disabled:opacity-40"
                      title="حيد"
                    >
                      {removingId === f.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-5 py-3">
          <p className="flex items-center justify-center gap-1.5 text-center font-cairo text-[11px] text-[#B8C4D8]">
            <Gamepad2 className="h-3 w-3 text-[#F5B942]" />
            السميات ديالك كتبان فكل لعبة تلقائياً
          </p>
        </div>
      </div>
    </div>
  );
}