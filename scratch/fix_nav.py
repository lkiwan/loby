import sys

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_code = '''    const cachedEnd = useRef<number>(0);
    const updateCache = useCallback(() => {
      const mobile = document.getElementById("most-played");
      const desktop = document.getElementById("games-section");
      const target = mobile?.offsetHeight ? mobile : desktop?.offsetHeight ? desktop : null;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      cachedEnd.current = target ? Math.min(target.getBoundingClientRect().top + window.scrollY, maxScroll) : maxScroll;
    }, []);

    const readProgress = useCallback(() => {
      if (cachedEnd.current <= 1) return window.scrollY > 0 ? 1 : 0;
      return Math.min(1, Math.max(0, window.scrollY / cachedEnd.current));
    }, []);'''

old_read_progress = '''    const readProgress = useCallback(() => {
      /* The click target and the mapping target are the same element; fall back
         to the desktop section, then to the maximum scroll, if neither is laid
         out (loading screen / hidden at the current breakpoint). */
      const mobile = document.getElementById("most-played");
      const desktop = document.getElementById("games-section");
      const target = mobile?.offsetHeight
        ? mobile
        : desktop?.offsetHeight
          ? desktop
          : null;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const end = target
        ? Math.min(target.getBoundingClientRect().top + window.scrollY, maxScroll)
        : maxScroll;
      if (end <= 1) return window.scrollY > 0 ? 1 : 0;
      return Math.min(1, Math.max(0, window.scrollY / end));
    }, []);'''

content = content.replace(old_read_progress, new_code)

old_layout_effect = '''    useLayoutEffect(() => {
      if (status === "loading") return;
      let rafId = 0;
      const schedule = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          syncLiquid();
        });
      };
  
      placeLiquid(readProgress());
      morphArmed.current = false;
      const armTimer = window.setTimeout(() => {
        morphArmed.current = true;
      }, LIQUID_ARM_MS);
      schedule();
  
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      /* Fallback tick: scroll events are coalesced (and rAF stalls) whenever the
         renderer suspends frames - background/occluded/headless tabs - which can
         leave the pill behind an already-moved scroll position. A cheap synchronous
         sync keeps the DOM correct even with nothing painting; on an active tab the
         scroll path above still delivers the same-frame, zero-delay updates. */
      const fallbackId = window.setInterval(() => syncLiquid(), 33);
      document.fonts.ready.then(schedule).catch(() => {});
      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        window.clearInterval(fallbackId);
        if (rafId) cancelAnimationFrame(rafId);
        window.clearTimeout(armTimer);
        if (liquidClickTimer.current) {
          clearTimeout(liquidClickTimer.current);
          liquidClickTimer.current = null;
        }
      };
    }, [status, placeLiquid, readProgress, syncLiquid]);'''

new_layout_effect = '''    useLayoutEffect(() => {
      if (status === "loading") return;
      let rafId = 0;
      const schedule = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          syncLiquid();
        });
      };
      
      updateCache();
      placeLiquid(readProgress());
      
      const onResize = () => {
        updateCache();
        schedule();
      };

      morphArmed.current = false;
      const armTimer = window.setTimeout(() => {
        morphArmed.current = true;
      }, LIQUID_ARM_MS);
      schedule();
  
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", onResize);
      
      document.fonts.ready.then(onResize).catch(() => {});
      return () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", onResize);
        if (rafId) cancelAnimationFrame(rafId);
        window.clearTimeout(armTimer);
        if (liquidClickTimer.current) {
          clearTimeout(liquidClickTimer.current);
          liquidClickTimer.current = null;
        }
      };
    }, [status, placeLiquid, readProgress, syncLiquid, updateCache]);'''

content = content.replace(old_layout_effect, new_layout_effect)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done caching fix.')

