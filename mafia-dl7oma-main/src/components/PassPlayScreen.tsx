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
      className="absolute inset-0 z-40 flex h-full flex-col items-center justify-center gap-5 overflow-hidden bg-[#07070D] px-8"
    >
      <motion.div
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#12121C] ring-1 ring-white/10"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Lock className="h-12 w-12 text-[#FFC93C]" />
      </motion.div>

      <div className="relative z-10 text-center">
        <h2 className="font-darija font-black text-2xl tracking-wider text-zinc-100">
          تيلي عند الحاكم
        </h2>
        <p className="mt-2 font-darija text-base font-bold text-zinc-500">
          دابا كلشي را كناوين الأدوار.
        </p>
      </div>

      <p className="relative z-10 font-darija text-2xl font-black text-[#FFC93C]">
        {teller?.name ?? "الحاكم"}
      </p>

      <button
        type="button"
        onClick={() => {
          buzz([40, 40, 60]);
          unlockDashboard();
        }}
        className="relative z-10 w-full max-w-[280px] rounded-full bg-[#C6F542] px-5 py-3.5 text-center font-darija text-xl font-black text-[#131803] transition-transform active:scale-95"
      >
        فتّح لابو
      </button>
      <p className="relative z-10 text-center font-darija text-xs font-semibold text-zinc-600">
        بيتا ف الكوين، تيلي ليّا. ما تيشريش.
      </p>
    </motion.div>
  );

  return (
    <div dir="rtl" className="relative flex h-full flex-col overflow-hidden bg-[#07070D] px-5">
      {/* banner */}
      <div className="relative z-10 pt-5">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={revealIndex}
            initial={{ y: -26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 26, opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="w-full rounded-3xl bg-[#12121C] px-4 py-4 text-center ring-1 ring-white/[0.07]"
          >
            <p className="font-darija text-sm font-extrabold tracking-[0.2em] text-[#FFC93C]">
              عطيو تيلي لـ
            </p>
            <motion.p
              key={"name" + revealIndex}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1 font-darija text-5xl font-black text-white"
            >
              {current?.name}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* big card stage — always big */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="relative w-[min(62vw,250px)] aspect-[3/4.4]">
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
        <div className="mt-6 flex h-16 w-full justify-center">
          <AnimatePresence mode="wait">
            {cardFaceUp ? (
              <motion.button
                key="hide"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={onHide}
                className="flex h-fit items-center gap-2 rounded-full bg-[#C6F542] px-10 py-3 font-darija text-lg font-black text-[#131803] transition-transform active:scale-95"
              >
                <EyeOff className="h-5 w-5" /> خبي سرّك
              </motion.button>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1 flex items-center justify-center gap-2 text-center font-darija text-[15px] font-semibold text-zinc-400"
              >
                <Hand className="h-4 w-4 text-zinc-500" />
                برك على الكرطة باش تشوف الدور ديالك
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
                now ? "bg-[#C6F542]" : done ? "bg-white/35" : "bg-white/[0.12]"
              }`}
            />
          );
        })}
      </div>

      {showLock && lockScreen}
    </div>
  );
}
