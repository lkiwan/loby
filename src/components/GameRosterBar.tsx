'use client';

import { useState, useCallback } from 'react';
import {
  X, Users, Loader2, Trash2, UserPlus, BookmarkPlus, RotateCcw,
} from 'lucide-react';
import { Sounds } from '@/lib/sounds';
import { MAX_NAME_LEN, nameKey, normalizeName, rulesFor } from '@/lib/roster';

const AVATAR_COLORS = [
  '#2DD4BF', '#F97066', '#F5B942', '#a855f7',
  '#3b82f6', '#ec4899', '#22c55e', '#f97316',
];

export type RosterFriend = { id: string; name: string; plays: number };

/* In-game player list. Adding or removing here edits the session roster only —
   nothing reaches the database until the player presses "Save as friends".
   The lobby shows just the saved names again. */
export default function GameRosterBar({
  gameId,
  saved,
  names,
  isSession,
  onChange,
  onSaveAsFriends,
  onReset,
}: {
  gameId: string;
  saved: RosterFriend[];
  names: string[];
  isSession: boolean;
  onChange: (next: string[]) => void;
  onSaveAsFriends: (next: string[]) => Promise<string[]>;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const rules = rulesFor(gameId);
  const savedKeys = new Set(saved.map((f) => nameKey(f.name)));
  const unsaved = names.filter((n) => !savedKeys.has(nameKey(n)));
  const atMax = names.length >= rules.max;

  const close = useCallback(() => {
    setOpen(false);
    setDraft('');
    setNotice(null);
  }, []);

  const add = () => {
    const clean = normalizeName(draft);
    if (!clean || atMax) return;
    if (names.some((n) => nameKey(n) === nameKey(clean))) {
      setNotice('هاد الصاحبي بقا ف الجولة.');
      Sounds.error();
      return;
    }
    if (names.length + 1 > rules.max) {
      setNotice(`هاد اللعبة كتقبل ${rules.max} صاحبين برك.`);
      Sounds.error();
      return;
    }
    onChange([...names, clean]);
    setDraft('');
    setNotice(null);
    Sounds.ok();
  };

  const remove = (name: string) => {
    if (removing) return;
    setRemoving(name);
    onChange(names.filter((n) => nameKey(n) !== nameKey(name)));
    setRemoving(null);
    setNotice(null);
    Sounds.click();
  };

  const saveAll = async () => {
    if (saving || !unsaved.length) return;
    setSaving(true);
    setNotice(null);
    try {
      const savedNow = await onSaveAsFriends(unsaved);
      if (savedNow.length) {
        setNotice(`تسجّل ${savedNow.length} صاحبي ف الحساب ديالك ✅`);
        Sounds.ok();
      } else {
        setNotice('ما لقينا والو جديد — ممكن وصلتي للحد.');
        Sounds.error();
      }
    } catch (e) {
      setNotice(e instanceof Error && e.message ? e.message : 'مشكلة في الاتصال. عاود جرب.');
      Sounds.error();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* trigger */}
      <button
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#030812]/70 text-white shadow-lg backdrop-blur-md transition hover:border-[#2DD4BF]/40 active:scale-90"
        aria-label="اللاعبين"
        title="اللاعبين"
      >
        <Users className="h-5 w-5" />
      </button>

      {/* players chip row under the HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center px-3">
        <div className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-[#030812]/70 px-2.5 py-1.5 backdrop-blur-md">
          {names.length === 0 ? (
            <button
              onClick={() => setOpen(true)}
              className="font-cairo text-[11px] font-bold text-[#B8C4D8]"
            >
              + زيد لاعبين
            </button>
          ) : (
            names.slice(0, 8).map((n, i) => (
              <span
                key={nameKey(n)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] py-0.5 ps-0.5 pe-2"
              >
                <span
                  className="grid h-5 w-5 place-items-center rounded-full font-cairo text-[9px] font-black text-[#0B1F3A]"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {n.trim()[0]?.toUpperCase() ?? '؟'}
                </span>
                <span className="font-cairo text-[10px] font-bold text-neutral-200">{n}</span>
              </span>
            ))
          )}
          {names.length > 8 && (
            <span className="shrink-0 font-cairo text-[10px] font-bold text-[#B8C4D8]">
              +{names.length - 8}
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
          <div className="bounce-in relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-[#2DD4BF]/25 bg-[#12294D] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
              <div>
                <h2 className="font-lalezar text-lg text-[#FFF7E8] leading-none">
                  {names.length} كايعبّرو دابا
                </h2>
                <p className="mt-1 font-cairo text-[11px] text-[#B8C4D8]">
                  {isSession
                    ? 'تعديلات هاد الجولة فقط — كتسالي ملي ترجع للساحة'
                    : 'تلقاهم ف السمية ديال الصاحبين ديالك'}
                </p>
              </div>
              <button
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/30 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[62dvh] overflow-y-auto p-5">
              {/* add */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <UserPlus className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2DD4BF]/60" />
                  <input
                    value={draft}
                    onChange={(e) => { setDraft(e.target.value); setNotice(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
                    maxLength={MAX_NAME_LEN}
                    placeholder={atMax ? 'وصلتي للحد ديال هاد اللعبة' : 'زيد اسم لاعب…'}
                    className="w-full rounded-xl border border-[#2DD4BF]/25 bg-[#0B1F3A] ps-9 pe-3 py-3 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/30 outline-none transition focus:border-[#2DD4BF]/60"
                  />
                </div>
                <button
                  onClick={add}
                  disabled={!draft.trim() || atMax}
                  className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-[#F5B942] text-[#0B1F3A] transition active:scale-95 disabled:opacity-40"
                  title="زيد"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>

              {notice && (
                <p className="mt-2 font-cairo text-[11px] font-bold text-[#F5B942]">{notice}</p>
              )}

              {/* current table */}
              <div className="mt-4 flex flex-col gap-2">
                {names.map((n, i) => {
                  const isSaved = savedKeys.has(nameKey(n));
                  return (
                    <div
                      key={nameKey(n)}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
                    >
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-cairo text-[13px] font-black text-[#0B1F3A]"
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {n.trim()[0]?.toUpperCase() ?? '؟'}
                      </div>
                      <span className="min-w-0 flex-1 truncate font-cairo text-[13px] font-bold text-[#FFF7E8]">
                        {n}
                      </span>
                      {!isSaved && (
                        <span className="shrink-0 rounded-full border border-[#F5B942]/30 bg-[#F5B942]/10 px-2 py-0.5 font-cairo text-[9px] font-bold text-[#F5B942]">
                          ماشي مسجل
                        </span>
                      )}
                      <button
                        onClick={() => remove(n)}
                        disabled={removing !== null}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400 active:scale-90"
                        title="حيد من الجولة"
                      >
                        {removing === n ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
                {names.length === 0 && (
                  <p className="py-6 text-center font-cairo text-[12px] text-[#B8C4D8]">
                    ما كاين حتى لاعب. زيد سميات من فوق.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/[0.06] px-5 py-4">
              <button
                onClick={() => void saveAll()}
                disabled={saving || !unsaved.length}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2DD4BF] py-3 font-cairo text-[13px] font-bold text-[#0B1F3A] transition active:scale-[0.98] disabled:opacity-40"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
                {unsaved.length
                  ? `سجّل ${unsaved.length} صاحبي ف الحساب`
                  : 'كلشي مسجل'}
              </button>
              <button
                onClick={() => { onReset(); setNotice(null); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 font-cairo text-[12px] font-bold text-[#B8C4D8] transition hover:border-white/20"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                رجع للسميات المحفوظة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}