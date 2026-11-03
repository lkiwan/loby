import { motion } from "framer-motion";
import { Trophy, Skull, RotateCcw } from "lucide-react";
import { useMafiaGame } from "../game/useMafiaGame";
import { ROLE_META } from "../game/types";

export default function GameOverScreen() {
  const winner = useMafiaGame((s) => s.winner);
  const players = useMafiaGame((s) => s.players);

  const mafiaWon = winner === "EISSABA";
  const deck = players.filter((p) => !p.isTeller);

  return (
    <div dir="rtl" className="relative flex h-full flex-col overflow-hidden bg-[#07070D] px-5">
      {/* winner header */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="flex flex-col items-center pt-12 text-center"
      >
        <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#12121C] ring-1 ring-white/[0.07]">
          {mafiaWon ? (
            <Skull className="h-12 w-12 text-[#FF4D5E]" />
          ) : (
            <Trophy className="h-12 w-12 text-[#FFC93C]" />
          )}
        </span>

        <h1
          className={`mt-5 font-darija text-4xl leading-tight font-black ${
            mafiaWon ? "text-[#FF4D5E]" : "text-zinc-50"
          }`}
        >
          {mafiaWon ? "العصابة ربحات!" : "ولاد الحومة ربحو!"}
        </h1>
        <p className="mt-2 max-w-xs font-darija text-base font-bold text-zinc-400">
          {mafiaWon
            ? "المافيا كتفوت بالخمار وتقادات على الحومة. صند قضية وزلامة..."
            : "الحومة بقات ونادفت من المافيا. عياما الحومة!"}
        </p>
      </motion.div>

      {/* full roster reveal — the mafia show up here, by name */}
      <div className="scrollbar-hide mt-6 min-h-0 w-full flex-1 overflow-y-auto rounded-[28px] bg-[#12121C] p-4 ring-1 ring-white/[0.06]">
        <p className="mb-3 flex items-center gap-2 font-darija text-xs font-bold tracking-widest text-zinc-400 uppercase">
          <Trophy className="h-4 w-4 text-[#FFC93C]" /> قائمة اللاعبين
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
                className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 ring-1 ${
                  p.isDead
                    ? "bg-white/[0.02] ring-white/[0.05]"
                    : "bg-white/[0.04] ring-white/[0.07]"
                }`}
              >
                {p.role === "EISSABA" ? (
                  <Skull className="h-4 w-4 shrink-0 text-[#FF4D5E]" />
                ) : (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${p.isDead ? "bg-[#FF4D5E]" : p.role === "BOULIS" ? "bg-[#FFC93C]" : p.role === "TBIB" ? "bg-[#3DDC84]" : "bg-zinc-500"}`}
                  />
                )}
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

      {/* replay */}
      <div className="flex flex-col items-center pb-9">
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() =>
            window.parent.postMessage({ type: "replay-requested" }, "*")
          }
          className="mt-6 rounded-full bg-[#C6F542] px-12 py-3.5 font-darija text-xl font-black text-[#131803]"
        >
          <RotateCcw className="mr-2 inline h-5 w-5" /> عاود لعب
        </motion.button>
        <p className="mt-3 font-darija text-xs font-bold text-zinc-600">
          سيفد الكوين باش تبدّى جمعية جديدة.
        </p>
      </div>
    </div>
  );
}
