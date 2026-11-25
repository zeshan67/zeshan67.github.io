/* asifhasanzeshan.xyz — motion and small behaviours.
   Everything is readable without this file; it only adds movement. */
(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: colour follows the section under it ---------- */

  function watchTones() {
    var sections = document.querySelectorAll("[data-tone]:not(.site-header)");
    function update() {
      var probe = header.offsetHeight / 2;
      var tone = "paper";
      sections.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) tone = s.dataset.tone;
      });
      if (header.dataset.tone !== tone) header.dataset.tone = tone;
      header.classList.toggle("is-stuck", window.scrollY > 8);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Menu on small screens ---------- */

  function menu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    function set(open) {
      root.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    }
    toggle.addEventListener("click", function () { set(!root.classList.contains("menu-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) set(false); });
  }

  /* ---------- Slot: an algorithm pairing one word from each side ---------- */

  function slot() {
    var el = document.querySelector(".slot");
    if (!el) return;
    var label = el.querySelector(".dim-label");
    var reels = [].map.call(el.querySelectorAll(".reel"), function (reel) {
      var strip = reel.querySelector(".reel-strip");
      var words = [].map.call(strip.children, function (s) { return s.textContent; });
      var n = words.length;
      // Four turns of the reel, so it can always spin forwards.
      for (var t = 0; t < 3; t++) words.forEach(function (w) {
        var s = document.createElement("span"); s.textContent = w; strip.appendChild(s);
      });
      return { reel: reel, strip: strip, n: n, total: n * 4, i: 0, widths: [] };
    });
    var total = reels[0].n * reels[1].n;

    function pad(v) { return (v < 10 ? "0" : "") + v; }
    function showLabel(a, b) { label.textContent = pad(a * reels[1].n + b + 1) + " / " + pad(total); }

    function fit() {
      var stacked = getComputedStyle(el).flexDirection === "column";
      el.style.fontSize = "";
      reels.forEach(function (r) { r.reel.style.width = ""; });
      var fs = parseFloat(getComputedStyle(el).fontSize);
      var max = reels.map(function (r) {
        return Math.max.apply(null, [].slice.call(r.strip.children, 0, r.n).map(function (s) { return s.getBoundingClientRect().width; }));
      });
      var box = el.clientWidth;
      var need = stacked ? Math.max(max[0], max[1]) : max[0] + max[1] + fs * 1.5;
      el.style.fontSize = (fs * box / need).toFixed(2) + "px";
      reels.forEach(function (r) {
        r.widths = [].slice.call(r.strip.children, 0, r.n).map(function (s) { return Math.ceil(s.getBoundingClientRect().width) + 1; });
        r.reel.style.width = r.widths[r.i] + "px";
      });
    }

    fit();
    showLabel(reels[0].i, reels[1].i);
    var resizeTimer;
    window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(fit, 100); });

    if (reduce || !window.gsap) return;

    function spin(r, target, delay) {
      var turns = 1 + Math.floor(Math.random() * 2);
      var steps = ((target - r.i + r.n) % r.n) + r.n * turns;
      var from = r.i;
      r.i = target;
      var dur = 2.1 + steps * 0.24;
      gsap.fromTo(r.strip,
        { yPercent: -from * 100 / r.total },
        {
          yPercent: -(from + steps) * 100 / r.total, duration: dur, delay: delay, ease: "power2.inOut",
          onComplete: function () { gsap.set(r.strip, { yPercent: -target * 100 / r.total }); }
        });
      // Open the window early when the next word is wider, close it late when it is narrower.
      var grow = r.widths[target] > r.widths[from];
      gsap.to(r.reel, {
        width: r.widths[target],
        duration: dur * (grow ? 0.45 : 0.4),
        delay: delay + dur * (grow ? 0.05 : 0.6),
        ease: "power2.inOut"
      });
      return delay + dur;
    }

    function next() {
      var a = reels[0].i, b = reels[1].i, na, nb;
      do {
        na = Math.floor(Math.random() * reels[0].n);
        nb = Math.floor(Math.random() * reels[1].n);
      } while (na === a && nb === b);

      var end = 0;
      if (na !== a) end = Math.max(end, spin(reels[0], na, 0));
      if (nb !== b) end = Math.max(end, spin(reels[1], nb, na !== a ? 0.5 : 0));

      // While it searches, the counter runs through candidates.
      var ticker = setInterval(function () {
        showLabel(Math.floor(Math.random() * reels[0].n), Math.floor(Math.random() * reels[1].n));
      }, 130);
      gsap.delayedCall(end, function () {
        clearInterval(ticker);
        showLabel(na, nb);
        gsap.delayedCall(2.4 + Math.random() * 1.6, next);
      });
    }

    gsap.delayedCall(2.2, next);
  }

  /* ---------- Drafting sheet: grid, dimension lines, centre lines and doors ---------- */

  function blueprint() {
    var c = document.querySelector(".blueprint");
    if (!c || !c.getContext) return;
    var ctx = c.getContext("2d");
    var G = 40, W = 0, H = 0, items = [], blocks = [], raf = 0;
    var INK = "26,26,26";

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function int(a, b) { return Math.floor(rnd(a, b + 1)); }
    function snap(v) { return Math.round(v / G) * G; }
    function ease(p) { return 1 - Math.pow(1 - p, 3); }

    /* Everything a drawing must stay clear of, in page coordinates. */
    function findBlocks() {
      var sy = window.scrollY, out = [];
      function add(r, pad) {
        if (r.width && r.height) out.push({ l: r.left - pad, t: r.top + sy - pad, r: r.right + pad, b: r.bottom + sy + pad });
      }
      document.querySelectorAll(".hero h1 strong, .hero h1 span, .hero-sub, .statement p").forEach(function (el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        add(range.getBoundingClientRect(), 22);
      });
      document.querySelectorAll(".hero-actions, .slip, .section, .contact").forEach(function (el) { add(el.getBoundingClientRect(), 22); });
      var reels = document.querySelectorAll(".reel");
      if (reels.length) {
        var top = Infinity, bottom = -Infinity;
        reels.forEach(function (r) { var b = r.getBoundingClientRect(); top = Math.min(top, b.top); bottom = Math.max(bottom, b.bottom); });
        out.push({ l: 0, t: top + sy - 26, r: W, b: bottom + sy + 26 });
      }
      out.push({ l: 0, t: 0, r: W, b: header.offsetHeight + 8 });
      blocks = out;
    }

    function box(it) {
      if (it.type === "door") {
        return { l: Math.min(it.x, it.x + it.r * it.sx) - 4, r: Math.max(it.x, it.x + it.r * it.sx) + 4, t: Math.min(it.y, it.y + it.r * it.sy) - 4, b: Math.max(it.y, it.y + it.r * it.sy) + 4 };
      }
      if (it.v) return { l: it.x - 12, r: it.x + (it.type === "dim" ? 44 : 12), t: it.y - 8, b: it.y + it.len + 8 };
      return { l: it.x - 8, r: it.x + it.len + 8, t: it.y - (it.type === "dim" ? 22 : 12), b: it.y + 12 };
    }
    function clash(a, list) {
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        if (b && a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t) return true;
      }
      return false;
    }

    function make(now, aged) {
      var sy = window.scrollY;
      var others = items.filter(function (o) { return o && o.type !== "none"; }).map(function (o) {
        var b = box(o); return { l: b.l - 14, r: b.r + 14, t: b.t - 14, b: b.b + 14 };
      });
      for (var tries = 0; tries < 30; tries++) {
        var type = ["dim", "dim", "door", "door", "line"][int(0, 4)];
        var it = { type: type, x: snap(rnd(G, W - G)), y: snap(sy + rnd(0, H)), life: rnd(16000, 26000) };
        if (type === "door") { it.r = G * int(1, 2); it.sx = Math.random() < 0.5 ? 1 : -1; it.sy = Math.random() < 0.5 ? 1 : -1; }
        else { it.v = Math.random() < 0.35; it.len = G * (type === "dim" ? int(3, 8) : int(4, 10)); }
        var b = box(it);
        if (b.l < 6 || b.r > W - 6 || b.t < 0) continue;
        if (clash(b, blocks) || clash(b, others)) continue;
        it.born = now - (aged ? rnd(0, it.life * 0.6) : 0);
        return it;
      }
      // No free spot in view right now: look again shortly.
      return { type: "none", born: now, life: 1800 };
    }

    function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

    function draw(it, now) {
      var age = reduce ? 0.5 : (now - it.born) / it.life;
      if (age >= 1) return false;
      if (it.type === "none") return true;
      var sy = window.scrollY, b = box(it);
      if (b.b < sy - H * 0.6 || b.t > sy + H * 1.6) return false;
      if (b.b < sy || b.t > sy + H) return true;

      var p = ease(Math.min(1, age / 0.4));
      var a = (age > 0.78 ? (1 - age) / 0.22 : 1) * 0.13;
      ctx.strokeStyle = "rgba(" + INK + "," + a + ")";
      ctx.fillStyle = "rgba(" + INK + "," + a * 1.7 + ")";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      if (it.type === "dim" || it.type === "line") {
        var d = it.len * p;
        var ex = it.x + (it.v ? 0 : d), ey = it.y + (it.v ? d : 0);
        if (it.type === "line") ctx.setLineDash([18, 5, 3, 5]);
        line(it.x, it.y, ex, ey);
        ctx.setLineDash([]);
        [[it.x, it.y], [ex, ey]].forEach(function (pt) {
          if (it.type === "dim") {
            if (it.v) line(pt[0] - 8, pt[1], pt[0] + 8, pt[1]); else line(pt[0], pt[1] - 8, pt[0], pt[1] + 8);
            line(pt[0] - 4, pt[1] + 4, pt[0] + 4, pt[1] - 4);
          } else {
            line(pt[0] - 4, pt[1], pt[0] + 4, pt[1]); line(pt[0], pt[1] - 4, pt[0], pt[1] + 4);
          }
        });
        if (it.type === "dim" && d >= G) {
          // the figure counts in whole grid cells, 600 mm each
          ctx.font = "500 10px Archivo, sans-serif";
          var mm = String(Math.floor(d / G + 0.02) * 600);
          if (it.v) ctx.fillText(mm, it.x + 12, it.y + d / 2 + 3);
          else ctx.fillText(mm, it.x + d / 2 - ctx.measureText(mm).width / 2, it.y - 8);
        }
      }

      if (it.type === "door") {
        var ang = (Math.PI / 2) * p;
        line(it.x, it.y, it.x + it.r * it.sx, it.y);
        line(it.x, it.y, it.x + Math.cos(ang) * it.r * it.sx, it.y + Math.sin(ang) * it.r * it.sy);
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        for (var t = 0; t <= 24; t++) {
          var q = ang * t / 24, px = it.x + Math.cos(q) * it.r * it.sx, py = it.y + Math.sin(q) * it.r * it.sy;
          if (t) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
      return true;
    }

    function grid() {
      var sy = window.scrollY;
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      for (var x = 0, i = 0; x < W; x += G, i++) {
        ctx.strokeStyle = "rgba(" + INK + "," + (i % 4 ? 0.022 : 0.045) + ")";
        line(x, sy, x, sy + H);
      }
      var first = Math.floor(sy / G);
      for (var j = first; j * G < sy + H; j++) {
        ctx.strokeStyle = "rgba(" + INK + "," + (j % 4 ? 0.022 : 0.045) + ")";
        line(0, j * G, W, j * G);
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(0.5, 0.5 - window.scrollY);
      grid();
      for (var i = 0; i < items.length; i++) if (!draw(items[i], now)) { items[i] = null; items[i] = make(now, false); }
      ctx.restore();
    }

    function seed() {
      var now = performance.now();
      findBlocks();
      items = [];
      var count = W < 700 ? 3 : 6;
      for (var i = 0; i < count; i++) items.push(make(now, true));
    }

    size();
    seed();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { size(); seed(); }, 150); });
    // Text settles after the entrance and after late font or layout changes.
    setTimeout(findBlocks, 2600);
    window.addEventListener("load", findBlocks);

    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", function () {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    });
  }

  /* ---------- Touch screens: the row in the middle of the screen lights up, as hover does ---------- */

  function touchFocus() {
    if (!window.matchMedia("(hover: none)").matches || !("IntersectionObserver" in window)) return;
    root.classList.add("touch-focus");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-active", e.isIntersecting); });
    }, { rootMargin: "-46% 0px -46% 0px" });
    document.querySelectorAll(".row, .thread").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Logo: the yellow dot is an eye that changes each time it blinks ---------- */

  function logoEye() {
    var svg = document.querySelector(".logo");
    if (!svg || !window.gsap || reduce) return;
    var lid = svg.querySelector(".eye-lid");
    var looks = svg.querySelectorAll(".eye-v");
    var dots = svg.querySelectorAll(".logo-dot");
    var cur = 0, TOP = -132, D = 264;

    function show(i) {
      looks.forEach(function (g, k) { g.classList.toggle("is-on", k === i); });
      cur = i;
    }
    function lidAt(open) { return { attr: { y: TOP + D * (1 - open), height: D * open } }; }
    function to(tl, open, dur) {
      var v = lidAt(open); v.duration = dur; v.ease = "power2.inOut";
      return tl.to(lid, v);
    }

    function blink() {
      var next;
      do { next = Math.floor(Math.random() * looks.length); } while (next === cur);
      var tl = gsap.timeline({ onComplete: function () { gsap.delayedCall(2.2 + Math.random() * 2.6, blink); } });
      to(tl, 0, 0.14);
      if (Math.random() < 0.25) {
        // now and then it half-opens and thinks before deciding
        tl.call(show, [0]);
        to(tl, 0.5, 0.22);
        tl.to(dots, { autoAlpha: 1, duration: 0.18, stagger: 0.26 })
          .to(dots, { autoAlpha: 0, duration: 0.2 }, "+=0.9");
        to(tl, 0, 0.14);
      }
      tl.call(show, [next]);
      to(tl, 1, 0.24);
    }
    gsap.delayedCall(1.6, blink);
  }

  /* ---------- Scroll and entrance motion ---------- */

  function motion() {
    if (!window.gsap || reduce) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    root.classList.add("js-motion");

    if (document.querySelector(".hero")) {
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".hero h1 > *", { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.05)
        .from(".reel-strip", { y: "105%", duration: 1.3, stagger: 0.12 }, 0.15)
        .from(".dim", { scaleX: 0, transformOrigin: "left center", duration: 1.2 }, 0.45)
        .from(".dim-label", { autoAlpha: 0, duration: 0.5 }, 1.1)
        .from(".hero-sub, .hero-actions", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.6)
        .from(".slip", { y: 26, autoAlpha: 0, rotate: 2.5, duration: 1, clearProps: "transform" }, 0.85);
    }

    if (document.querySelector(".statement p")) {
      var words = new SplitText(".statement p", { type: "words" });
      gsap.fromTo(words.words,
        { opacity: 0.13, filter: "blur(5px)" },
        {
          opacity: 1, filter: "blur(0px)", ease: "none", stagger: 0.06,
          scrollTrigger: { trigger: ".statement p", start: "top 82%", end: "bottom 58%", scrub: 0.6 }
        });
      gsap.utils.toArray(".statement mark").forEach(function (m) {
        ScrollTrigger.create({
          trigger: m, start: "top 46%",
          onEnter: function () { m.classList.add("is-lit"); },
          onLeaveBack: function () { m.classList.remove("is-lit"); }
        });
      });
    }
  }

  function start() {
    watchTones();
    menu();
    blueprint();
    slot();
    logoEye();
    touchFocus();
    motion();
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener("load", start);
})();
