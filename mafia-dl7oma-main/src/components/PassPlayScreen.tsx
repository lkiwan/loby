import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Hand, EyeOff } from "lucide-react";
import { useMafiaGame, selectRevealPlayer } from "../game/useMafiaGame";
import { FlipCardView } from "./PlayerCard";
import { buzz } from "../lib/utils";

export default function PassPlayScreen() {
  const players = useMafiaGame((s) => s.players);
  const revealIndex = useMafiaGame((s) => s.revealIndex);
  const cardFaceUp = useMafiaGame((s) => s.cardFaceUp);
  const flipUp = useMafiaGame((s) => s.flipUp);
  const flipBack = useMafiaGame((s) => s.flipBack);
  const hideAndNext = useMafiaGame((s) => s.hideAndNext);
  const unlockDashboard = useMafiaGame((s) => s.unlockDashboard);

  const [showLock, setShowLock] = useState(false);

  const deck = players.filter((p) => !p.isTeller);
  const current = selectRevealPlayer(useMafiaGame.getState());
  const teller = players.find((p) => p.isTeller);

  const wasLast = () => useMafiaGame.getState().cardsLocked;

  const onHide = () => {
    buzz([15, 30]);
    // flip back first (role stays on the CURRENT player during the rotation)…
    flipBack();
    // …then hand off to the next player only when face-down again
    setTimeout(() => {
      hideAndNext();
      if (wasLast()) setTimeout(() => setShowLock(true), 600);
    }, 680);
  };

  const lockScreen = (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-40 flex h-full flex-col items-center justify-center gap-5 overflow-hidden px-8"
    >
      {/* table picture background */}
      <img
        src={`${import.meta.env.BASE_URL}img/table-bg.avif`}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-night/55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(234,179,8,.10), rgba(0,0,0,0) 55%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.8))",
        }}
      />

      <motion.div
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-gold/10 ring-2 ring-gold/60 shadow-glowGold"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lock className="h-12 w-12 text-gold" />
        <span className="absolute inset-0 animate-pulseRing rounded-3xl ring-2 ring-gold/40" />
      </motion.div>

      <div className="relative z-10 text-center">
        <h2 className="font-darija font-black text-2xl tracking-wider text-zinc-100">
          تيلي عند الحاكم
        </h2>
        <p className="mt-2 font-darija text-base font-bold text-zinc-500">
          دابا كلشي را كناوين الأدوار.
        </p>
      </div>

      <p className="relative z-10 font-darija text-2xl font-black text-gold">
        {teller?.name ?? "الحاكم"}
      </p>

      <button
        type="button"
        onClick={() => {
          buzz([40, 40, 60]);
          unlockDashboard();
        }}
        className="relative z-10 btn-horror group w-full max-w-[280px] overflow-hidden px-5 py-3 text-center"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span className="text-horror horror-flicker relative block font-darija text-xl font-black tracking-[0.18em]">
          فتّح لابو
        </span>
        <span
          aria-hidden
          className="absolute bottom-1.5 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-blood/50 to-transparent"
        />
      </button>
      <p className="relative z-10 text-center font-darija text-xs font-semibold text-zinc-600">
        بيتا ف الكوين، تيلي ليّا. ما تيشريش.
      </p>
    </motion.div>
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-night px-5">
      {/* lantern ambience */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(234,179,8,.10), transparent 48%), radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.7) 100%)",
        }}
      />

      {/* banner */}
      <div className="relative z-10 pt-5">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={revealIndex}
            initial={{ y: -26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 26, opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="w-full rounded-2xl border border-gold/25 bg-night-panel/90 px-4 py-3 text-center shadow-card"
          >
            <p className="font-darija text-xs font-bold tracking-[0.35em] text-yellow-500 uppercase">
              عطيو تيلي لـ
            </p>
            <motion.p
              key={"name" + revealIndex}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-grit text-3xl text-zinc-50"
            >
              {current?.name}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* big card stage — always big */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative w-[min(62vw,250px)] aspect-[3/4.4]">
          {/* pulsing tap ring while face-down */}
          {!cardFaceUp && (
            <motion.span
              className="pointer-events-none absolute -inset-3 rounded-3xl border-2 border-gold/60"
              animate={{ opacity: [0.9, 0.15, 0.9], scale: [1, 1.05, 1] }}
              transition={{
                duration: 1.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <motion.div
            key={revealIndex}
            initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="h-full w-full"
          >
            <FlipCardView
              role={current?.role ?? null}
              playerName={current?.name ?? ""}
              faceUp={cardFaceUp}
              pulse={
                cardFaceUp
                  ? current?.role === "EISSABA"
                    ? "red"
                    : current?.role === "TBIB"
                      ? "green"
                      : current?.role === "BOULIS"
                        ? "gold"
                        : "none"
                  : "none"
              }
              onTap={() => {
                if (!cardFaceUp) {
                  buzz(25);
                  flipUp();
                }
              }}
            />
          </motion.div>
        </div>

        {/* hint / action area */}
        <div className="mt-6 h-16 w-full">
          <AnimatePresence mode="wait">
            {cardFaceUp ? (
              <motion.button
                key="hide"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={onHide}
                className="btn-gold w-full text-lg"
              >
                <EyeOff className="mr-2 inline h-5 w-5" /> خوبي سيرّك
              </motion.button>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1 flex items-center justify-center gap-2 text-center font-darija text-sm font-semibold text-zinc-400"
              >
                <Hand className="h-4 w-4 text-gold" />
                ديز على الكرطة باش تشوف راك نتا
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* progress */}
      <div className="relative z-10 mb-5 mt-1 flex items-center justify-center gap-1.5">
        {deck.map((p, i) => {
          const done = i < revealIndex;
          const now = i === revealIndex;
          return (
            <span
              key={p.id}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                now
                  ? "w-6 bg-gold shadow-glowGold"
                  : done
                    ? "bg-heal/70"
                    : "bg-white/15"
              }`}
            />
          );
        })}
      </div>

      {showLock && lockScreen}
    </div>
  );
}
