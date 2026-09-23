import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Skull, PartyPopper, RotateCcw } from "lucide-react";
import { useMafiaGame } from "../game/useMafiaGame";
import { ROLE_META } from "../game/types";

export default function GameOverScreen() {
  const winner = useMafiaGame((s) => s.winner);

  useEffect(() => {
    window.parent.postMessage({ type: "game-over" }, "*");
  }, []);
  const players = useMafiaGame((s) => s.players);
  const resetGame = useMafiaGame((s) => s.resetGame);

  const mafiaWon = winner === "EISSABA";
  const deck = players.filter((p) => !p.isTeller);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-night px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: mafiaWon
            ? "radial-gradient(circle at 50% 30%, rgba(220,38,38,.28), rgba(0,0,0,0) 60%), radial-gradient(circle at 50% 110%, rgba(220,38,38,.12), rgba(0,0,0,0) 55%)"
            : "radial-gradient(circle at 50% 30%, rgba(234,179,8,.25), rgba(0,0,0,0) 60%), radial-gradient(circle at 50% 110%, rgba(16,185,129,.16), rgba(0,0,0,0) 55%)",
        }}
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 13 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4"
        >
          {mafiaWon ? (
            <Skull className="h-20 w-20 text-blood drop-shadow-[0_0_24px_rgba(220,38,38,.7)]" />
          ) : (
            <PartyPopper className="h-20 w-20 text-gold drop-shadow-[0_0_24px_rgba(234,179,8,.7)]" />
          )}
        </motion.div>

        <h1
          className={`font-darija font-black text-4xl leading-tight tracking-wide ${mafiaWon ? "text-blood" : "text-gold"}`}
        >
          {mafiaWon ? "العصابة ربحات!" : "ولاد الحومة ربحو!"}
        </h1>
        <p className="mt-2 max-w-xs font-darija text-base font-bold text-zinc-400">
          {mafiaWon
            ? "المافيا كتفوت بالخمار وتقادات على الحومة. صند قضية وزلامة..."
            : "الحومة بقات ونادفت من المافيا. عياما الحومة!"}
        </p>
      </motion.div>

      <div className="scrollbar-hide relative z-10 mt-6 w-full max-w-md flex-1 overflow-y-auto rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <p className="mb-2 flex items-center gap-2 font-darija text-xs font-bold tracking-widest text-zinc-400 uppercase">
          <Trophy className="h-4 w-4 text-gold" /> قائمة اللاعبين
        </p>
        <div className="grid grid-cols-2 gap-2">
          {deck.map((p, i) => {
            const meta = p.role ? ROLE_META[p.role] : null;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ring-1 ${
                  p.isDead
                    ? "bg-zinc-950/60 ring-white/5"
                    : "bg-white/5 ring-white/10"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${p.isDead ? "bg-blood" : p.role === "EISSABA" ? "bg-blood" : p.role === "BOULIS" ? "bg-gold" : p.role === "TBIB" ? "bg-heal" : "bg-zinc-500"}`}
                />
                <span
                  className={`min-w-0 flex-1 truncate font-darija text-sm font-bold ${
                    p.isDead ? "text-zinc-600 line-through" : "text-zinc-100"
                  }`}
                >
                  {p.name}
                </span>
                <span
                  className={`shrink-0 text-[10px] font-black tracking-wider ${meta?.color ?? "text-zinc-500"}`}
                >
                  {meta?.label ?? "?"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => resetGame()}
        className="btn-gold font-darija relative z-10 mt-5 w-full !py-5 text-lg"
      >
        <RotateCcw className="mr-2 inline h-5 w-5" /> العب عوض
      </motion.button>
      <p className="relative z-10 mt-2 pb-4 font-darija text-xs font-bold text-zinc-600">
        سيفد الكوين باش تبدّى جمعية جديدة.
      </p>
    </div>
  );
}
