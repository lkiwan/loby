(function () {
  'use strict';
  var GAME = document.currentScript && document.currentScript.dataset.game || '';

  var NAMES = [];
  try {
    var sp = new URLSearchParams(location.search);
    var raw = sp.get('p');
    if (raw) {
      var arr = JSON.parse(decodeURIComponent(raw));
      if (Array.isArray(arr)) {
        var seen = Object.create(null);
        for (var i = 0; i < arr.length; i++) {
          var n = String(arr[i] == null ? '' : arr[i]).replace(/\s+/g, ' ').trim().slice(0, 14);
          if (!n) continue;
          var k = n.toLowerCase();
          if (seen[k]) continue;
          seen[k] = 1;
          NAMES.push(n);
        }
      }
    }
  } catch (e) {
    NAMES = [];
  }

  if (GAME === 'hazr') {
    try {
      if (NAMES.length) {
        localStorage.setItem('hazer-fzer-save-v1', JSON.stringify({
          players: NAMES.length,
          names: NAMES.slice(),
          imposters: 1,
          timer: 120,
          savedAt: Date.now(),
        }));
      } else {
        localStorage.removeItem('hazer-fzer-save-v1');
      }
    } catch (e) {}
  }
  if (!NAMES.length) return;

  var MIN = { mafia: 6, paint: 3, hazr: 2, bara: 3, sowl: 3 };
  var MAX = { mafia: 14, paint: 15, hazr: 15, bara: 15, sowl: 8 };
  var need = Math.min(MAX[GAME], Math.max(NAMES.length, MIN[GAME] || 0));
  while (NAMES.length < need) NAMES.push('لاعب ' + (NAMES.length + 1));

  function waitFor(fn, ms) {
    return new Promise(function (res) {
      var t0 = Date.now();
      (function tick() {
        var v;
        try { v = fn(); } catch (e) { v = null; }
        if (v) return res(v);
        if (Date.now() - t0 > (ms || 15000)) return res(null);
        setTimeout(tick, 60);
      })();
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function setVal(el, v) {
    var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function phase() { try { return (typeof S !== 'undefined' && S.phase) || null; } catch (e) { return null; } }
  function act() { return (window.act && window.act) || null; }
  function byText(sel, txt) {
    return Array.prototype.find.call(document.querySelectorAll(sel), function (b) {
      return b.textContent.trim() === txt;
    }) || null;
  }

  var PLAN = {};
  PLAN.mafia = async function () {
    if (phase() === null) {
      var home = await waitFor(function () { return document.querySelector('button.btn-horror'); });
      if (!home) return; home.click();
    }
    if (!(await waitFor(function () { return document.querySelector('form input[placeholder]'); }))) return;
    for (var g = 0; g < 24; g++) {
      var rm = document.querySelector('button[aria-label="مشّاه"]');
      if (!rm) break;
      rm.click(); await sleep(90);
    }
    for (var i = 0; i < Math.min(NAMES.length, 14); i++) {
      var add = document.querySelector('form input[placeholder]');
      if (!add || add.disabled) break;
      setVal(add, NAMES[i]);
      var frm = add.closest('form');
      var btn = frm && frm.querySelector('button[type="submit"]');
      if (!btn) break;
      btn.click(); await sleep(90);
    }
  };
  PLAN.paint = async function () {
    var cta = await waitFor(function () { return document.querySelector('button.home-cta'); });
    if (cta) cta.click();
    var ready = await waitFor(function () {
      var n = document.querySelectorAll('.player-inputs input.player-input');
      return n.length >= 3 ? n : null;
    });
    if (!ready) return;
    var want = Math.min(NAMES.length, 15);
    var g = 0, prev = -1, stall = 0;
    while (g < 30) {
      g++;
      var have = document.querySelectorAll('.player-inputs input.player-input').length;
      if (have >= want) break;
      var btn = (want <= 7 && byText('.count-chip', String(want))) || document.querySelector('.count-chip.count-more');
      if (!btn) break;
      btn.click(); await sleep(120);
      var now = document.querySelectorAll('.player-inputs input.player-input').length;
      if (now === prev) { if (++stall > 3) break; } else { stall = 0; }
      prev = now;
    }
    var all = document.querySelectorAll('.player-inputs input.player-input');
    for (var i = 0; i < want && i < all.length; i++) setVal(all[i], NAMES[i]);
  };
  PLAN.hazr = async function () {
    var cta = await waitFor(function () { return document.querySelector('button.btn-cta'); });
    if (cta) cta.click();
    var names = await waitFor(function () {
      var n = document.querySelectorAll('input[placeholder]:not(.count-input)');
      return n.length ? n : null;
    });
    if (!names) return;
    var cnts = document.querySelectorAll('input.count-input[type="number"]');
    var cnt = cnts[0];
    if (cnt && cnt.value !== String(NAMES.length)) { setVal(cnt, String(NAMES.length)); await sleep(140); }
    names = document.querySelectorAll('input[placeholder]:not(.count-input)');
    for (var i = 0; i < NAMES.length && i < names.length; i++) setVal(names[i], NAMES[i]);
  };
  PLAN.bara = async function () {
    var a = act();
    if (phase() !== 'setup') {
      if (a && a.quickStart) a.quickStart();
      else { var h = await waitFor(function () { return document.querySelector('button.btn-cta'); }); if (!h) return; h.click(); }
    }
    if (!(await waitFor(function () { return document.querySelectorAll('#names input').length ? 1 : null; }))) return;
    var want = Math.min(NAMES.length, 15);
    var have = document.querySelectorAll('#names input').length;
    if (want !== have) {
      if (want <= 7) {
        var chip = byText('.count-chip', String(want));
        if (chip) chip.click();
      } else {
        var more = document.querySelector('.count-chip.count-more');
        if (more) { more.click(); await sleep(80); }
        var box = await waitFor(function () { return document.getElementById('player-count'); }, 4000);
        if (box) setVal(box, String(want));
      }
      await sleep(140);
    }
    var all = document.querySelectorAll('#names input');
    for (var i = 0; i < want && i < all.length; i++) setVal(all[i], NAMES[i]);
  };
  PLAN.sowl = async function () {
    var a = act();
    if (phase() !== 'setup') {
      if (a && a.goSetup) a.goSetup();
      else { var h = await waitFor(function () { return document.querySelector('button.btn-primary'); }); if (!h) return; h.click(); }
    }
    if (!(await waitFor(function () { return document.getElementById('name-input'); }))) return;
    var want = Math.min(NAMES.length, 8);
    for (var i = 0; i < want; i++) {
      var inp = document.getElementById('name-input');
      if (!inp) break;
      setVal(inp, NAMES[i]);
      var b = act();
      if (b && b.addPlayer) b.addPlayer();
      else { var plus = inp.parentElement && inp.parentElement.querySelector('button'); if (plus) plus.click(); }
      await sleep(90);
    }
  };
  (PLAN[GAME] || function () {})();
})();
