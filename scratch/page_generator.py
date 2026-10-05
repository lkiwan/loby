import re
import sys

def main():
    with open("C:/Users/arhou/OneDrive/Bureau/projet omar/colab/loby/src/app/page.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    # The file is large, we'll replace parts of it.
    
    # 1. Imports
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';")
    content = content.replace("UserPlus, Users, Volume2, VolumeX, X, Zap,\n} from 'lucide-react';", "UserPlus, Users, Volume2, VolumeX, X, Zap,\n  Bell, Home, User\n} from 'lucide-react';")

    # 2. Dynamic Imports
    content = content.replace("const StarField      = dynamic(() => import('@/components/StarField'),      { ssr: false });\nconst GameBackground = dynamic(() => import('@/components/GameBackground'), { ssr: false });", "")

    # 3. Loading Screen
    old_loading = """  if (status === 'loading') {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#030812] overflow-hidden">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <StarField />
          <GameBackground />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,transparent_25%,rgba(3,8,18,.88)_100%)]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <StarMark size={60} />
          <div className="pulse-glow-ring h-12 w-12 rounded-full border-2 border-cyan-400/40 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          </div>
          <p className="font-lalezar text-2xl text-[#e8d9c0] text-glow-cyan">كنوجدو الكراسا…</p>
        </div>
      </div>
    );
  }"""
    new_loading = """  if (status === 'loading') {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#0B1F3A] overflow-hidden zellige-bg">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1F3A]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <StarMark size={60} />
          <div className="pulse-glow-ring h-12 w-12 rounded-full border-2 border-[#2DD4BF]/40 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#2DD4BF]" />
          </div>
          <p className="font-lalezar text-2xl text-[#FFF7E8] text-glow-gold">كنوجدو الكراسا…</p>
        </div>
      </div>
    );
  }"""
    content = content.replace(old_loading, new_loading)

    # 4. Main JSX Return - remove background/hero and replace with new UI
    
    parts = content.split("return (\n    <div className=\"relative min-h-dvh overflow-x-hidden bg-[#030812] text-[#f1e7d6]\">")
    if len(parts) < 2:
        parts = content.split("return (\n    <div className=\"relative min-h-dvh overflow-x-hidden bg-[#030812]")
    
    pre_return = parts[0]
    post_return = parts[1]
    
    modals_split = post_return.split("{/* ═══════════════ AD MODAL ═══════════════ */}")
    main_content = modals_split[0]
    modals_content = "{/* ═══════════════ AD MODAL ═══════════════ */}" + modals_split[1]

    # Let's fix colors in modals
    modals_content = modals_content.replace("bg-[#060c1a]", "bg-[#12294D]")
    modals_content = modals_content.replace("border-cyan-400/20", "border-[#2DD4BF]/20")
    modals_content = modals_content.replace("text-cyan-400", "text-[#2DD4BF]")
    modals_content = modals_content.replace("text-cyan-300", "text-[#2DD4BF]")
    modals_content = modals_content.replace("text-cyan-200", "text-[#2DD4BF]")
    modals_content = modals_content.replace("text-neutral-100", "text-[#FFF7E8]")
    modals_content = modals_content.replace("text-neutral-200", "text-[#FFF7E8]")
    modals_content = modals_content.replace("text-neutral-300", "text-[#FFF7E8]")
    modals_content = modals_content.replace("text-neutral-400", "text-[#B8C4D8]")
    modals_content = modals_content.replace("text-neutral-500", "text-[#B8C4D8]")
    modals_content = modals_content.replace("bg-cyan-400/5", "bg-[#2DD4BF]/5")
    modals_content = modals_content.replace("bg-cyan-400/25", "bg-[#2DD4BF]/25")
    modals_content = modals_content.replace("btn-amber", "bg-[#F5B942] text-[#0B1F3A] font-bold")

    new_return = """return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0B1F3A] text-[#FFF7E8] zellige-bg pb-24">
      {launching && <LaunchOverlay game={launching} />}

      {/* Header */}
      <header className="header-zellige sticky top-4 z-30 mx-4 rounded-full bg-[#12294D] border border-white/10 shadow-lg mt-4 px-4 py-2 flex items-center justify-between sm:mx-auto sm:max-w-6xl">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-playm3ana.png" alt="PlayM3ana" width={32} height={32} className="rounded-full" />
          <span className="text-gradient-gold-teal font-grit text-lg font-bold tracking-tight">PLAYM3ANA</span>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <button className="relative">
                <Bell className="h-5 w-5 text-[#B8C4D8]" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#F97066]" />
              </button>
              <button onClick={openSettings} className="grid h-8 w-8 place-items-center rounded-full bg-[#0B1F3A] border border-[#2DD4BF]/30">
                <User className="h-4 w-4 text-[#2DD4BF]" />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-gold rounded-full px-4 py-1.5 text-sm font-bold bg-[#F5B942] text-[#0B1F3A]">
              دخول
            </Link>
          )}
        </div>
      </header>

      {/* Coins pill */}
      {isAuthed && (
        <div className={`fixed start-4 top-[84px] z-[55] flex select-none items-center gap-1.5 rounded-full border border-[#F5B942]/40 bg-[#12294D]/95 px-3 py-1 font-cairo text-[13px] font-black tabular-nums text-[#F5B942] shadow-[0_0_14px_rgba(245,185,66,.35)] pointer-events-none ${coinPop ? 'coin-pop' : ''}`}>
          <Coins className="h-3.5 w-3.5" />
          {coins}
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[max(5rem,env(safe-area-inset-bottom))] sm:px-6 mt-6 flex flex-col gap-6">
        
        {/* Hero Card */}
        <section className="hero-card-zellige zellige-corners rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#F97066] p-6 text-[#FFF7E8] shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-start gap-2">
            {isAuthed ? (
              <>
                <h2 className="font-lalezar text-3xl">أهلا بيك يا سيد! 🪔</h2>
                <p className="font-cairo text-sm font-semibold opacity-90">جلسة اللعب دايرينها دابا — جاهز تدخل مع صحابك؟</p>
              </>
            ) : (
              <>
                <h2 className="font-lalezar text-3xl">مرحبا بيك فالحومة! 🪔</h2>
                <p className="font-cairo text-sm font-semibold opacity-90 mb-2">صاوب كونط دابا باش تلعب مع صحابك وتعيش الشوهة</p>
                <div className="flex gap-3 mt-2 w-full">
                  <Link href="/register" className="flex-1 bg-[#F5B942] text-[#0B1F3A] font-bold py-2 rounded-xl text-center">بدا فابور</Link>
                  <Link href="/login" className="flex-1 bg-white/20 backdrop-blur font-bold py-2 rounded-xl text-center">عندي كونط</Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Lobby of the day */}
        <section className="lobby-card-zellige zellige-corners rounded-2xl bg-[#12294D] border border-white/10 p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-lalezar text-xl text-[#F5B942]">🎉 اللوبي ديال اليوم</h3>
            <div className="flex items-center gap-1.5 bg-[#2DD4BF]/10 px-2 py-1 rounded-full border border-[#2DD4BF]/20">
              <span className="live-dot bg-[#2DD4BF] h-2 w-2 rounded-full animate-pulse" />
              <span className="font-cairo text-xs font-bold text-[#2DD4BF]">مباشر الآن</span>
            </div>
          </div>
          <p className="font-cairo text-sm text-[#B8C4D8] mb-4">حضور: 2,831 لاعب دابا • 14 غرفة مفتوحة</p>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-full border-2 border-[#12294D] bg-[#2DD4BF] grid place-items-center"><User className="h-4 w-4 text-[#0B1F3A]"/></div>
              <div className="h-8 w-8 rounded-full border-2 border-[#12294D] bg-[#F97066] grid place-items-center"><User className="h-4 w-4 text-[#0B1F3A]"/></div>
              <div className="h-8 w-8 rounded-full border-2 border-[#12294D] bg-[#F5B942] grid place-items-center"><User className="h-4 w-4 text-[#0B1F3A]"/></div>
            </div>
            <button className="btn-gold bg-[#F5B942] text-[#0B1F3A] font-bold px-5 py-2 rounded-xl text-sm">
              دخل اللوبي
            </button>
          </div>
        </section>

        {/* New Games Row */}
        <section className="mt-2">
          <h3 className="section-title-zellige font-lalezar text-2xl text-[#FFF7E8] mb-4">✨ اللعاب الجدد اليوم</h3>
          
          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-5">
            {GAMES.map((game, i) => (
              <GameCard
                key={game.id}
                game={game}
                coins={coins}
                isBusy={busyId === game.id}
                loadingAction={busyAction}
                onPlay={(e) => playWithCoins(game.id, e)}
                onWatchAd={() => watchAdToPlay(game.id)}
              />
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="flex sm:hidden overflow-x-auto gap-4 pb-4 snap-x -mx-4 px-4 scrollbar-hide">
            {GAMES.map((game, i) => {
              const colors = ['from-[#2DD4BF] to-teal-500', 'from-[#F97066] to-orange-500', 'from-[#F5B942] to-amber-500', 'from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500'];
              const bgGrad = colors[i % colors.length];
              const statuses = ['سخون 🔥', 'كيمشي دابا', 'جديد!'];
              const status = statuses[i % statuses.length];
              return (
                <div key={game.id} className="game-card-zellige snap-center shrink-0 w-40 rounded-2xl bg-[#12294D] border border-white/10 overflow-hidden flex flex-col" onClick={(e) => playWithCoins(game.id, e)}>
                  <div className={`h-24 bg-gradient-to-br ${bgGrad} flex items-center justify-center relative`}>
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur rounded-full px-2 py-0.5 font-cairo text-[10px] font-bold text-white status-chip">
                      {status}
                    </div>
                    {/* Using GameIcon since we don't know if game.logo is available in the type */}
                    <GameIcon game={game} size={48} />
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h4 className="font-lalezar text-[15px] text-[#FFF7E8] truncate">{game.darijaTitle}</h4>
                    <div className="flex items-center gap-1 font-cairo text-[11px] text-[#B8C4D8]">
                      <Users className="h-3 w-3" />
                      <span>{120 + i * 15} لاعب</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Missions Card */}
        {isAuthed && (
          <section className="missions-card-zellige bg-[#12294D] rounded-2xl border border-white/10 p-4 flex items-center justify-between cursor-pointer" onClick={() => setMissionsOpen(true)}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F5B942]/20 grid place-items-center">
                <Target className="h-5 w-5 text-[#F5B942]" />
              </div>
              <div>
                <h3 className="font-lalezar text-lg text-[#FFF7E8]">🎁 مهامك اليوم</h3>
                <p className="font-cairo text-xs text-[#B8C4D8]">كمل المهام وربح كوينز</p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-[#B8C4D8] -rotate-90" />
          </section>
        )}

        {/* Guest Notice */}
        {!isAuthed && <GuestNotice />}

        {/* Ad Banner */}
        <AdBanner />

        {/* Coming Soon */}
        <ComingSoon />

        {/* Leaderboard Teaser */}
        <LeaderboardTeaser />

        {/* Referral Section */}
        {isAuthed && xpData?.referralCode && (
          <section className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-[#F5B942]/20 bg-gradient-to-br from-[#12294D] to-[#0B1F3A] p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#F5B942]" />
                <span className="font-lalezar text-xl text-[#F5B942]">عرض على صاحبك</span>
              </div>
              <p className="mb-4 font-cairo text-[13px] font-semibold text-[#B8C4D8]">
                بارطاجي الكود مع صاحبك — بجوج غاتربحو كوينز فابور 🎁
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 overflow-hidden rounded-xl border border-[#F5B942]/20 bg-[#0B1F3A] px-4 py-3 font-mono text-[15px] tracking-widest text-[#FFF7E8]">
                  {xpData.referralCode}
                </code>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(xpData!.referralCode!);
                    setReferralCopied(true);
                    setTimeout(() => setReferralCopied(false), 2200);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-4 py-3 font-cairo text-[13px] font-black text-[#2DD4BF] transition hover:bg-[#2DD4BF]/20 active:scale-95"
                >
                  {referralCopied ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  {referralCopied ? 'تم!' : 'كوپي'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <LobbyFooter isAuthed={isAuthed} username={session?.user?.username} />
      </main>

      {/* Sticky CTA */}
      <div className="sticky-cta-zellige fixed bottom-20 left-4 right-4 z-40 sm:hidden">
        <button className="w-full bg-[#F5B942] text-[#0B1F3A] font-lalezar text-lg py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          بدا لعب دابا — جلسة جديدة
        </button>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="bottom-tab-bar fixed bottom-0 left-0 right-0 h-16 bg-[#12294D] border-t border-white/10 z-50 flex items-center justify-around sm:hidden px-2 pb-safe">
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#F5B942]">
          <Home className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">الرئيسية</span>
        </div>
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#B8C4D8]">
          <Users className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">الصحاب</span>
        </div>
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#B8C4D8]">
          <Gamepad2 className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">اللعاب</span>
        </div>
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#B8C4D8]" onClick={openSettings}>
          <User className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">حسابي</span>
        </div>
      </nav>

      {/* Missions Panel */}
      {missionsOpen && (
        <MissionsPanel
          onClose={() => setMissionsOpen(false)}
          onClaim={(reward) => {
            void update();
            setMissionsOpen(false);
            showToast('ok', `مبروك! ربحتي +${reward} 🪙 على المهمة 🎯`);
          }}
        />
      )}
""" + modals_content

    final_content = pre_return + new_return

    with open("C:/Users/arhou/OneDrive/Bureau/projet omar/colab/loby/src/app/page.tsx", "w", encoding="utf-8") as f:
        f.write(final_content)

if __name__ == "__main__":
    main()
