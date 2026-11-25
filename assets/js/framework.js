/* Reframing creative learning — the interactive framework.
   The page reads without this file; it adds selection, wires, stepping and motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Content, from the paper ---------- */

  var PLANES = {
    epi: {
      n: 1, name: "Epistemic", cy: 262, about: "Information evaluation", objective: "Curiosity",
      q: "Is the AI's output true and credible?",
      body: "The first checkpoint. Epistemic means to do with knowledge: what is true, and how we know. Generative AI can blur the line between fact and fabrication, so this plane asks whether an output can be trusted at all. The learner traces where it came from, flags how confident it is, and rejects anything that contradicts what is known.",
      ex: "The learner examines the sources and assumptions behind AI-generated climate references for the desert site, and tests whether proposed layouts respond realistically to heat and orientation."
    },
    ope: {
      n: 2, name: "Operational", cy: 408, about: "Creative operations", objective: "Iteration",
      q: "Can I work the AI tool skilfully?",
      body: "Once outputs can be trusted, this plane is about working the tool well: shaping precise prompts and looping through cycles of generating, testing and refining. The learner uses the AI's power while staying in command of the result.",
      ex: "Prompts specify orientation, shading intent and room adjacency. The learner iterates across cycles of generated floorplans while keeping authorship over the final layout."
    },
    eth: {
      n: 3, name: "Ethical–legal", cy: 554, about: "Governance and equity by design", objective: "Originality",
      q: "Is it responsible and transparent?",
      body: "Good output and good craft still call for a conscience. This plane checks AI results for bias or harm and insists on disclosing where the AI contributed, keeping the human answerable for ethics and compliance.",
      ex: "Bias reviews ask whether generated layouts simply copy existing homes or impose unsuitable conventions. Authorship disclosure makes the AI's role explicit, and building codes are taught and evaluated directly."
    },
    ref: {
      n: 4, name: "Reflective", cy: 700, about: "Metacognition, critique and choice", objective: "Agency",
      q: "Why did I make these choices?",
      body: "The final plane steps back. Reflective critique asks why choices were made and whether they hold up: the reasons for an action and its consequences. This is where design literacy deepens over time.",
      ex: "The learner articulates why certain AI options were accepted, modified or rejected, and how those decisions align with functional goals and professional values."
    }
  };
  var PLANE_IDS = ["epi", "ope", "eth", "ref"];

  var COMPS = [
    { id: "pla", n: "Plausibility checks", s: "Test outputs against what is known", home: "epi", also: ["ope", "ref"],
      d: "Uses domain expertise and common sense to reject outputs that contradict established facts. It also guides which prototypes are worth refining and what to question on reflection.",
      ex: "Asking whether shading and solar orientation are realistic for desert conditions." },
    { id: "prov", n: "Provenance tracing", s: "Record where an output came from", home: "epi", also: ["eth"],
      d: "Records where data or an AI output came from, so its authenticity can be verified. Its trail also feeds authorship and accountability work on the ethical–legal plane.",
      ex: "Checking the sources and assumptions behind AI-generated climate references." },
    { id: "unc", n: "Uncertainty tagging", s: "Mark how far to rely on an output", home: "epi", also: ["ref"],
      d: "Attaches confidence scores to outputs so learners can judge how far to rely on them. The same scores later inform reflective judgement about which options to trust.",
      ex: "Flagging layout claims that rest on generalised or probabilistic assumptions." },
    { id: "tri", n: "Cross-modal triangulation", s: "Compare text, image and video results", home: "epi", also: ["ope"],
      d: "Compares results across modalities (text, image and video) to check that they stay consistent. The comparison habit carries into operational testing of variants.",
      ex: "Cross-checking a generated plan against solar simulation imagery for the same site." },
    { id: "ite", n: "Iterative prototyping", s: "Generate, test, compare, revise", home: "ope", also: ["ref"],
      d: "Generates design variants with AI and refines them over successive cycles. Each cycle gives the reflective plane fresh material to weigh and learn from.",
      ex: "Producing two floorplans, then looping to compare and improve them." },
    { id: "pro", n: "Prompt engineering", s: "Refine the instructions given to the model", home: "ope", also: ["epi"],
      d: "Crafting and refining the input instructions that steer the model toward relevant responses. Sharper prompts also surface more traceable, checkable outputs for the epistemic plane.",
      ex: "Specifying orientation, shading intent and adjacency in the prompt." },
    { id: "aut", n: "Authorship disclosure", s: "Say where AI contributed", home: "eth", also: ["ref"],
      d: "Transparently acknowledges where AI contributed to content or decisions. Naming the AI's share also sharpens the learner's reflection on their own role.",
      ex: "Marking which parts of the design came from the AI and which from the learner." },
    { id: "bia", n: "Bias and harm review", s: "Look for unfair defaults and harms", home: "eth", also: ["epi"],
      d: "Examines outputs for unfair bias or harm and proposes mitigations. The scrutiny overlaps with epistemic checks on whether an output reflects reality fairly.",
      ex: "Asking if layouts are culturally invasive, inequitable or merely copied." },
    { id: "refc", n: "Reflective critique", s: "Explain why an output was kept or rejected", home: "ref", also: ["ope", "eth"],
      d: "Compels learners to reflect on the process and how to improve the creative outcome. It reaches back into operational and ethical decisions, asking why each was made.",
      ex: "Reasoning through why one iteration was accepted over another." }
  ];
  var COMP = {};
  COMPS.forEach(function (c) { c.serves = [c.home].concat(c.also); COMP[c.id] = c; });

  var NODES = {
    task: {
      title: "The design task and the learner's intent", meta: "Where every use of GenAI starts",
      q: "What am I trying to make, and why?",
      body: "A design task arrives with its goals, constraints and context, set inside a curriculum or studio. The learner brings their own intent: their judgement and their concept. Both go into the AI tool together.",
      ex: "A two-bedroom, one-toilet home on a hot, sun-exposed, arid site. Climate data, solar software and building codes stay with the human."
    },
    med: {
      title: "GenAI mediation", meta: "The tool in the middle",
      q: "What is the AI actually doing for me?",
      body: "Generative AI sits between the task and the outcome. It helps with ideation, synthesis and representation. Whatever it returns is not yet the answer: it now has to pass through four planes of judgment.",
      ex: "A generative system returns many floorplan iterations for the same brief, in 2D and in 3D."
    },
    out: {
      title: "Creative learning", meta: "What the planes are for",
      q: "What has the learner gained?",
      body: "The outcome is sustained design literacy together with AI literacy. Evaluating the learner's performance then feeds back, recalibrating the curriculum and the studio approach. That is the dotted line running up the left of the diagram.",
      ex: "The learner can say how the floorplan was reached, and could do it again in a professional capacity."
    }
  };

  var STOPS = ["node:task", "node:med", "plane:epi", "plane:ope", "plane:eth", "plane:ref", "node:out"];
  function stopName(key) {
    var k = key.split(":");
    if (k[0] === "plane") return PLANES[k[1]].name + " plane";
    return { task: "The design task", med: "GenAI mediation", out: "Creative learning" }[k[1]];
  }

  /* ---------- Elements ---------- */

  var stage = $("#stage");
  if (!stage) return;
  var diagram = $("#diagram"), planesSvg = $("#planes"), wiresSvg = $("#wires");
  var panelIn = $("#panelIn"), stepPrev = $("#stepPrev"), stepNext = $("#stepNext");
  var stepNextLabel = $("#stepNextLabel"), stepPos = $("#stepPos");
  var compList = $("#comps ul");
  var NS = "http://www.w3.org/2000/svg";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  COMPS.forEach(function (c) {
    var li = document.createElement("li");
    var marks = PLANE_IDS.map(function (p) {
      var cls = p === c.home ? "is-home" : (c.also.indexOf(p) > -1 ? "" : "is-off");
      return '<i data-p="' + p + '" class="' + cls + '"></i>';
    }).join("");
    var others = c.also.map(function (p) { return PLANES[p].name; }).join(" and ");
    li.innerHTML = '<button type="button" class="fw-comp" data-p="' + c.home + '" data-sel="comp:' + c.id + '" aria-pressed="false"' +
      ' aria-label="' + esc(c.n) + ". Home plane: " + PLANES[c.home].name + ". Also serves: " + others + '.">' +
      '<span class="fw-marks" aria-hidden="true">' + marks + "</span>" +
      "<span><b>" + esc(c.n) + "</b><small>" + esc(c.s) + "</small></span></button>";
    compList.appendChild(li);
  });

  var planeEls = {}, compEls = {}, nodeEls = {};
  $$(".fw-plane", planesSvg).forEach(function (g) { planeEls[g.dataset.p] = g; });
  $$(".fw-comp", compList).forEach(function (b) { compEls[b.dataset.sel.split(":")[1]] = b; });
  $$(".fw-node", planesSvg).forEach(function (g) { nodeEls[g.dataset.sel.split(":")[1]] = g; });

  /* ---------- Wires ---------- */

  var wires = [];
  COMPS.forEach(function (c) {
    c.serves.forEach(function (p, i) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "fw-wire fw-wire--" + (i ? "also" : "home"));
      g.setAttribute("data-p", p);
      var path = document.createElementNS(NS, "path");
      var dot = document.createElementNS(NS, i ? "rect" : "circle");
      g.appendChild(path); g.appendChild(dot);
      wiresSvg.appendChild(g);
      wires.push({ comp: c.id, plane: p, home: !i, slot: i, of: c.serves.length, g: g, path: path, dot: dot });
    });
  });

  function elbow(ax, ay, lx, by, bx) {
    var dy = by - ay, r = Math.min(7, Math.abs(dy) / 2), d = dy > 0 ? 1 : -1;
    if (r < 1) return "M" + ax + " " + ay + "H" + bx;
    return "M" + ax + " " + ay + "H" + (lx - r) + "Q" + lx + " " + ay + " " + lx + " " + (ay + d * r) +
      "V" + (by - d * r) + "Q" + lx + " " + by + " " + (lx + r) + " " + by + "H" + bx;
  }

  function layoutWires() {
    if (getComputedStyle(wiresSvg).display === "none") return;
    var dr = diagram.getBoundingClientRect(), pr = planesSvg.getBoundingClientRect();
    if (!pr.width) return;
    var k = pr.width / 404, ox = pr.left - dr.left, oy = pr.top - dr.top;
    wiresSvg.setAttribute("viewBox", "0 0 " + dr.width + " " + dr.height);

    var byY = {};
    COMPS.forEach(function (c) {
      var r = compEls[c.id].getBoundingClientRect();
      byY[c.id] = { x: r.left - dr.left, y: r.top - dr.top + r.height / 2 };
    });

    // Where each wire leaves its plane: spread along the two edges that meet at the right-hand tip.
    PLANE_IDS.forEach(function (p) {
      var list = wires.filter(function (w) { return w.plane === p; })
        .sort(function (a, b) { return byY[a.comp].y - byY[b.comp].y; });
      var n = list.length;
      list.forEach(function (w, i) {
        var s = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
        var f = Math.abs(s) * 0.36;
        w.ax = ox + (394 - 190 * f) * k;
        w.ay = oy + (PLANES[p].cy + (s < 0 ? -92 : 92) * f) * k;
      });
    });

    wires.forEach(function (w) {
      var b = byY[w.comp];
      w.bx = b.x;
      w.by = b.y + (w.slot - (w.of - 1) / 2) * 9;
    });

    // One lane each, ordered so wires heading the same way do not cross.
    var x0 = ox + 404 * k + 6, x1 = byY[COMPS[0].id].x - 16;
    [true, false].forEach(function (home) {
      var set = wires.filter(function (w) { return w.home === home; });
      var up = set.filter(function (w) { return w.by < w.ay; }).sort(function (a, b) { return a.ay - b.ay; });
      var down = set.filter(function (w) { return w.by >= w.ay; }).sort(function (a, b) { return b.ay - a.ay; });
      var order = up.concat(down), n = order.length;
      order.forEach(function (w, i) {
        var t = (i + (home ? 0.5 : 1)) / (n + (home ? 0 : 1));
        w.lx = x0 + (x1 - x0) * t;
      });
    });

    wires.forEach(function (w) {
      w.path.setAttribute("d", elbow(r1(w.ax), r1(w.ay), r1(w.lx), r1(w.by), r1(w.bx)));
      if (w.home) {
        w.dot.setAttribute("cx", r1(w.ax)); w.dot.setAttribute("cy", r1(w.ay)); w.dot.setAttribute("r", 4);
      } else {
        w.dot.setAttribute("x", r1(w.ax - 3)); w.dot.setAttribute("y", r1(w.ay - 3));
        w.dot.setAttribute("width", 6); w.dot.setAttribute("height", 6);
      }
    });
  }
  function r1(v) { return Math.round(v * 10) / 10; }

  /* ---------- Selection ---------- */

  var current = null;

  function paint(key) {
    var k = key ? key.split(":") : [null, null], type = k[0], id = k[1];
    var focusPlanes = type === "plane" ? [id] : type === "comp" ? COMP[id].serves : null;

    PLANE_IDS.forEach(function (p) {
      var on = !!focusPlanes && focusPlanes.indexOf(p) > -1;
      planeEls[p].classList.toggle("is-on", on);
      planeEls[p].classList.toggle("is-dim", !!focusPlanes && !on);
    });
    COMPS.forEach(function (c) {
      var on = type === "comp" ? c.id === id : type === "plane" ? c.serves.indexOf(id) > -1 : false;
      var el = compEls[c.id];
      el.classList.toggle("is-on", on);
      el.classList.toggle("is-dim", (type === "comp" || type === "plane") && !on);
      // When a plane is chosen the component takes that plane's colour, otherwise its home colour.
      el.dataset.p = type === "plane" && on ? id : c.home;
    });
    Object.keys(nodeEls).forEach(function (n) { nodeEls[n].classList.toggle("is-on", type === "node" && n === id); });
    wires.forEach(function (w) {
      w.g.classList.toggle("is-on", (type === "plane" && w.plane === id) || (type === "comp" && w.comp === id));
    });
    stage.classList.toggle("has-sel", type === "plane" || type === "comp");
  }

  function relButton(key, label, also) {
    var p = key.split(":")[0] === "plane" ? key.split(":")[1] : COMP[key.split(":")[1]].home;
    return '<button type="button" data-sel="' + key + '" data-p="' + p + '" class="' + (also ? "is-also" : "") + '">' +
      '<i class="fw-dot"></i>' + esc(label) + "</button>";
  }

  function render(key) {
    var html, k = key ? key.split(":") : [null], id = k[1];
    if (k[0] === "plane") {
      var pl = PLANES[id];
      var rel = COMPS.filter(function (c) { return c.serves.indexOf(id) > -1; })
        .sort(function (a, b) { return (a.home === id ? 0 : 1) - (b.home === id ? 0 : 1); });
      html = "<h3>" + esc(pl.name) + " plane</h3>" +
        '<p class="fw-panel-meta" data-p="' + id + '"><i class="fw-dot"></i><span>Plane ' + pl.n + " of 4 · " + esc(pl.about) + " · Objective: " + pl.objective.toLowerCase() + "</span></p>" +
        '<p class="fw-panel-q">' + esc(pl.q) + "</p>" +
        '<p class="fw-panel-body">' + esc(pl.body) + "</p>" +
        "<h4>Components at work here (filled: this is their home plane)</h4>" +
        '<div class="fw-panel-rel">' + rel.map(function (c) { return relButton("comp:" + c.id, c.n, c.home !== id); }).join("") + "</div>" +
        "<h4>In the desert-home task</h4>" +
        '<p class="fw-panel-ex">' + esc(pl.ex) + "</p>";
    } else if (k[0] === "comp") {
      var c = COMP[id];
      html = "<h3>" + esc(c.n) + "</h3>" +
        '<p class="fw-panel-meta" data-p="' + c.home + '"><i class="fw-dot"></i><span>Action component · Home plane: ' + esc(PLANES[c.home].name) + "</span></p>" +
        '<p class="fw-panel-q">' + esc(c.s) + ".</p>" +
        '<p class="fw-panel-body">' + esc(c.d) + "</p>" +
        "<h4>Planes it serves (filled: its home plane)</h4>" +
        '<div class="fw-panel-rel">' + c.serves.map(function (p, i) { return relButton("plane:" + p, PLANES[p].name, i > 0); }).join("") + "</div>" +
        "<h4>In the desert-home task</h4>" +
        '<p class="fw-panel-ex">' + esc(c.ex) + "</p>";
    } else if (k[0] === "node") {
      var nd = NODES[id];
      html = "<h3>" + esc(nd.title) + "</h3>" +
        '<p class="fw-panel-meta">' + esc(nd.meta) + "</p>" +
        '<p class="fw-panel-q">' + esc(nd.q) + "</p>" +
        '<p class="fw-panel-body">' + esc(nd.body) + "</p>" +
        "<h4>In the desert-home task</h4>" +
        '<p class="fw-panel-ex">' + esc(nd.ex) + "</p>";
    } else {
      html = "<h3>Start anywhere on the diagram</h3>" +
        '<p class="fw-panel-q">Select a plane or a component to see what it asks of the learner.</p>' +
        '<p class="fw-panel-body">Each one comes with an example from a real design task. Or step through the path an AI output takes, from the design task at the top to the learning outcome at the bottom.</p>';
    }
    panelIn.innerHTML = html;
    panelIn.parentNode.classList.toggle("is-empty", !key);
    panelIn.scrollTop = 0;
    if (window.gsap && !reduce) {
      gsap.fromTo(panelIn.children, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "expo.out", stagger: 0.035, overwrite: true });
    }

    var i = key ? STOPS.indexOf(key) : -1;
    stepPrev.hidden = i < 1;
    if (!key) { stepPos.textContent = ""; stepNextLabel.textContent = "Start with the design task"; }
    else if (k[0] === "comp") { stepPos.textContent = ""; stepNextLabel.textContent = "Open its home plane"; }
    else {
      stepPos.textContent = "Stop " + (i + 1) + " of " + STOPS.length;
      stepNextLabel.textContent = i === STOPS.length - 1 ? "See it on a real task" : "Next: " + stopName(STOPS[i + 1]);
    }
  }

  function select(key) {
    current = key;
    paint(key);
    render(key);
    $$("[data-sel]", stage).forEach(function (el) {
      if (el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", String(el.dataset.sel === key));
    });
  }

  stage.addEventListener("click", function (e) {
    var el = e.target.closest("[data-sel]");
    if (!el) return;
    var key = el.dataset.sel;
    // A second press on the same thing in the diagram lets go of it.
    select(key === current && !el.closest(".fw-panel") ? null : key);
  });
  stage.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest("svg [data-sel]");
    if (!el) return;
    e.preventDefault();
    select(el.dataset.sel === current ? null : el.dataset.sel);
  });
  if (window.matchMedia("(hover: hover)").matches) {
    $$("[data-sel]", diagram).forEach(function (el) {
      if (el.dataset.sel.indexOf("node:") === 0) return;
      el.addEventListener("mouseenter", function () { paint(el.dataset.sel); });
      el.addEventListener("mouseleave", function () { paint(current); });
    });
  }

  stepNext.addEventListener("click", function () {
    if (!current) return select(STOPS[0]);
    if (current.indexOf("comp:") === 0) return select("plane:" + COMP[current.split(":")[1]].home);
    var i = STOPS.indexOf(current);
    if (i === STOPS.length - 1) { $("#example").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); return; }
    select(STOPS[i + 1]);
  });
  stepPrev.addEventListener("click", function () {
    var i = STOPS.indexOf(current);
    if (i > 0) select(STOPS[i - 1]);
  });

  // Components named in the worked example lead back to the diagram.
  $$("[data-goto]").forEach(function (b) {
    b.setAttribute("aria-label", "Show " + b.textContent + " in the framework");
    b.addEventListener("click", function () {
      select(b.dataset.goto);
      stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  select(null);
  layoutWires();
  if ("ResizeObserver" in window) new ResizeObserver(layoutWires).observe(diagram);
  window.addEventListener("load", layoutWires);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutWires);

  /* ---------- Page navigation: mark the section in view ---------- */

  var navLinks = $$(".fw-nav a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navLinks.forEach(function (a) { var t = $(a.getAttribute("href")); if (t) io.observe(t); });
  }

  /* ---------- Figures that move: play in view, with a pause control ---------- */

  $$(".fw-video").forEach(function (box) {
    var v = $("video", box), userPaused = reduce;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fw-video-btn";
    box.appendChild(btn);
    function sync() {
      var playing = !v.paused;
      btn.setAttribute("aria-label", playing ? "Pause the animation" : "Play the animation");
      btn.innerHTML = '<svg aria-hidden="true"><use href="#i-' + (playing ? "pause" : "play") + '"/></svg>';
    }
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    btn.addEventListener("click", function () {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    sync();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !userPaused) play(); else if (!e.isIntersecting) v.pause();
        });
      }, { threshold: 0.35 }).observe(box);
    }
  });

  /* ---------- Citation ---------- */

  var copyBtn = $("#copyCite"), cite = $("#citation");
  if (copyBtn && cite) {
    copyBtn.addEventListener("click", function () {
      var text = cite.textContent.trim();
      function done(ok) {
        copyBtn.textContent = ok ? "Citation copied" : "Select the text to copy it";
        setTimeout(function () { copyBtn.textContent = "Copy the citation"; }, 2400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var r = document.createRange(); r.selectNodeContents(cite);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        done(false);
      }
    });
  }

  /* ---------- Motion ---------- */

  function motion() {
    if (!window.gsap || reduce) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(".fw-byline > *", { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.05)
      .from(".fw-title-a", { yPercent: 28, autoAlpha: 0, duration: 1.2 }, 0.15)
      .from(".fw-title-b > span:first-child", { y: 18, autoAlpha: 0, duration: 1 }, 0.4)
      .from(".fw-title-b .dim", { scaleX: 0, transformOrigin: "left center", duration: 1.2 }, 0.55)
      .from(".fw-title-b .dim-label", { autoAlpha: 0, duration: 0.5 }, 1.2)
      .from(".fw-hero .hero-sub, .fw-hero .hero-actions", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.6)
      .from(".fw-hero .slip", { y: 26, autoAlpha: 0, rotate: 2.5, duration: 1, clearProps: "transform" }, 0.85);

    // The diagram assembles once, in the order an output travels through it.
    var order = PLANE_IDS.map(function (p) { return planeEls[p]; });
    var homeWires = wires.filter(function (w) { return w.home; }).map(function (w) { return w.g; });
    gsap.timeline({
      defaults: { ease: "expo.out" },
      scrollTrigger: { trigger: stage, start: "top 72%", once: true },
      onComplete: function () { gsap.set(order.concat(homeWires), { clearProps: "all" }); }
    })
      .from(".fw-planes .fw-node, .fw-flow", { autoAlpha: 0, y: -10, duration: 0.7, stagger: 0.05 }, 0)
      .from(".fw-spine, .fw-pins, .fw-feedback", { autoAlpha: 0, duration: 0.8 }, 0.25)
      .from(order, { y: -46, autoAlpha: 0, duration: 1, stagger: 0.14 }, 0.2)
      .from(".fw-comp", { x: 18, autoAlpha: 0, duration: 0.7, stagger: 0.045, clearProps: "transform,opacity,visibility" }, 0.55)
      .from(homeWires, { autoAlpha: 0, duration: 0.6, stagger: 0.05 }, 0.95);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(motion);
  else window.addEventListener("load", motion);
})();
