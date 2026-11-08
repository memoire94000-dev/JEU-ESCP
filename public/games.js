/* Les quatre jeux. Chaque jeu reçoit un niveau, une graine (même partie pour tous en direct)
   et signale son score par cb.report(score, label) puis cb.end(résultat). */
window.Games = (function () {
  const D = window.ARENA_DATA;
  const LEVELS = ["Facile", "Moyen", "Difficile", "Pro"];
  const INFO = {
    dates: { name: "La course aux dates", c: "#ffca5c", desc: "QCM de vitesse. Enchaîne les bonnes réponses : à la première erreur, la série s'arrête." },
    escape: { name: "L'évasion des PCS", c: "#a585ff", desc: "Six casiers, six énigmes sur les catégories socioprofessionnelles, une porte à ouvrir." },
    snake: { name: "Le serpent des figures", c: "#46e3a8", desc: "Dirige le serpent et mange les bonnes syllabes pour écrire la figure de style." },
    clic: { name: "Clic ou pas", c: "#3fdcf7", desc: "Les noms défilent : clique seulement sur ceux qui entrent dans la catégorie." },
  };

  const fr = (s) => String(s).replace(/ ([:;!?»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");
  const esc = (s) => fr(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, r) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const yearLabel = (y) => (y < 0 ? `${-y} av. J.-C.` : String(y));

  /* Sons courts, activés par l'interaction */
  const Sfx = (function () {
    let ctx = null;
    let muted = false;
    try { muted = localStorage.getItem("arena:mute") === "1"; } catch (e) { /* stockage indisponible */ }
    function beep(f, d, type) {
      if (muted) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type || "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.14, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + d);
      } catch (e) { /* audio indisponible */ }
    }
    return {
      ok() { beep(740, 0.1); },
      ko() { beep(160, 0.25, "square"); },
      win() { [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.18), i * 110)); },
      get muted() { return muted; },
      toggle() { muted = !muted; try { localStorage.setItem("arena:mute", muted ? "1" : "0"); } catch (e) { /* stockage indisponible */ } return muted; },
    };
  })();

  /* Outils communs : minuteries annulées à l'arrêt */
  function kit() {
    const timers = new Set();
    const off = [];
    let raf = 0;
    const g = {
      stopped: false,
      t(fn, ms) { const id = setTimeout(() => { timers.delete(id); if (!g.stopped) fn(); }, ms); timers.add(id); return id; },
      clear(id) { clearTimeout(id); timers.delete(id); },
      frame(fn) { cancelAnimationFrame(raf); const loop = (ts) => { if (g.stopped) return; if (fn(ts) !== false) raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); },
      on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); off.push(() => el.removeEventListener(ev, fn, opt)); },
      stop() { g.stopped = true; timers.forEach(clearTimeout); timers.clear(); cancelAnimationFrame(raf); off.forEach((f) => f()); off.length = 0; },
    };
    return g;
  }

  function flash(root, text, bad) {
    const n = document.createElement("div");
    n.className = "flash" + (bad ? " bad" : "");
    n.textContent = fr(text);
    root.appendChild(n);
    setTimeout(() => n.remove(), 1500);
  }

  /* ---------- 1. La course aux dates ---------- */
  function dates(level, seed, m, cb, g) {
    const r = rng(seed ^ 0x9e37);
    const pool = D.dates[level];
    const list = shuffle(pool, r).slice(0, Math.min(30, pool.length));
    const qt = [12000, 8000, 6000, 4000][level];
    let i = 0, streak = 0, score = 0;

    function options(y) {
      const [lo, hi] = [[15, 120], [3, 30], [2, 12], [1, 6]][level];
      const set = new Set([y]);
      let guard = 0;
      while (set.size < 4 && guard++ < 300) {
        const d = lo + Math.floor(r() * (hi - lo + 1));
        const v = y + (r() < 0.5 ? -d : d);
        if (v === 0 || (y > 0 && v <= 0) || v > 2026 || set.has(v)) continue;
        set.add(v);
      }
      return shuffle([...set], r);
    }

    function question() {
      if (i >= list.length) return finish(true);
      const [y, ev] = list[i];
      const eventForm = r() < 0.25;
      const opts = eventForm
        ? shuffle([ev, ...shuffle(pool.filter((p) => p[0] !== y), r).slice(0, 3).map((p) => p[1])], r)
        : options(y).map(yearLabel);
      const good = eventForm ? ev : yearLabel(y);
      m.innerHTML = `<div class="hud"><span>Série <b>${streak}</b></span><span>Question <b>${i + 1}</b> / ${list.length}</span></div>
        <div class="tbar"><i id="tb"></i></div>
        <div class="q">${eventForm ? `Que s'est-il passé en ${esc(yearLabel(y))} ?` : `En quelle année ?<br>${esc(ev)}`}</div>
        <div class="opts">${opts.map((o, n) => `<button class="opt" data-n="${n}">${esc(o)}</button>`).join("")}</div>`;
      const tb = m.querySelector("#tb");
      const start = performance.now();
      let locked = false;
      const answer = (btn, val) => {
        if (locked) return;
        locked = true;
        const ms = performance.now() - start;
        if (val === good) {
          btn.classList.add("ok");
          Sfx.ok();
          streak++;
          score += 100 + Math.round(50 * Math.max(0, 1 - ms / qt));
          cb.report(score, `${streak} sans faute`);
          i++;
          g.t(question, 280);
        } else {
          if (btn) btn.classList.add("bad");
          m.querySelectorAll(".opt").forEach((b, n) => { if (opts[n] === good) b.classList.add("ok"); });
          Sfx.ko();
          g.t(() => finish(false), 1900);
        }
      };
      m.querySelectorAll(".opt").forEach((b) => g.on(b, "click", () => answer(b, opts[+b.dataset.n])));
      g.frame((ts) => {
        if (locked) return false;
        const f = Math.max(0, 1 - (ts - start) / qt);
        tb.style.width = f * 100 + "%";
        if (f <= 0) { answer(null, null); return false; }
      });
    }

    function finish(all) {
      const label = `${streak} sans faute`;
      cb.report(score, label, true);
      cb.end({ score, label, big: String(streak), unit: streak > 1 ? "bonnes réponses d'affilée" : "bonne réponse d'affilée", note: all ? "Série parfaite : tu as vidé le paquet." : "Une erreur et la série s'arrête." });
    }
    question();
  }

  /* ---------- 2. Clic ou pas ---------- */
  function clic(level, seed, m, cb, g) {
    const r = rng(seed ^ 0x1234);
    const cfg = [{ cats: 3, items: 12, t: 1800 }, { cats: 3, items: 14, t: 1400 }, { cats: 4, items: 14, t: 1000 }, { cats: 4, items: 16, t: 750 }][level];
    const cats = shuffle(D.clic[level], r).slice(0, cfg.cats);
    const total = cfg.cats * cfg.items;
    let ci = 0, seen = 0, good = 0, score = 0, hits = 0, sumRt = 0, misses = 0, falses = 0;
    const label = () => `${seen ? Math.round((good / seen) * 100) : 0} % · ${hits ? Math.round(sumRt / hits) : "–"} ms`;

    function nextCat() {
      if (ci >= cats.length) return finish();
      const c = cats[ci];
      const nYes = Math.max(2, Math.round(cfg.items * 0.42));
      const yes = shuffle(c.y, r).slice(0, Math.min(nYes, c.y.length));
      const no = shuffle(c.n, r).slice(0, cfg.items - yes.length);
      const items = shuffle([...yes.map((t) => ({ t, y: true })), ...no.map((t) => ({ t, y: false }))], r);
      m.innerHTML = `<div class="hud"><span>Catégorie <b>${ci + 1}</b> / ${cats.length}</span><span>${esc(label())}</span></div>
        <div class="stage" id="st"><div><div class="muted small">Clique seulement sur</div><div class="cat">${esc(c.k)}</div></div></div>`;
      ci++;
      g.t(() => run(items, c, 0), 2600);
    }

    function run(items, c, idx) {
      if (idx >= items.length) return nextCat();
      const it = items[idx];
      const st = m.querySelector("#st");
      const hud = m.querySelector(".hud");
      hud.innerHTML = `<span class="small">Clique si : <b style="font-size:16px">${esc(c.k)}</b></span><span class="small">${idx + 1}/${items.length}</span>`;
      st.className = "stage";
      st.textContent = fr(it.t);
      let tapped = false;
      const t0 = performance.now();
      const tap = () => {
        if (tapped) return;
        tapped = true;
        if (it.y) {
          const rt = performance.now() - t0;
          hits++; good++; sumRt += rt;
          score += 100 + Math.round(60 * Math.max(0, 1 - rt / cfg.t));
          st.classList.add("hit");
          Sfx.ok();
        } else {
          falses++;
          st.classList.add("bad");
          Sfx.ko();
        }
      };
      const key = (e) => { if (e.code === "Space") { e.preventDefault(); tap(); } };
      g.on(st, "pointerdown", tap);
      g.on(window, "keydown", key);
      g.t(() => {
        st.removeEventListener("pointerdown", tap);
        window.removeEventListener("keydown", key);
        if (!it.y && !tapped) { good++; score += 100; }
        if (it.y && !tapped) { misses++; st.classList.add("bad"); }
        seen++;
        cb.report(score, label());
        st.textContent = "";
        g.t(() => { st.className = "stage"; run(items, c, idx + 1); }, 180);
      }, cfg.t);
    }

    function finish() {
      const pct = Math.round((good / total) * 100);
      const ms = hits ? Math.round(sumRt / hits) : 0;
      const lab = `${pct} % · ${ms || "–"} ms`;
      cb.report(score, lab, true);
      cb.end({ score, label: lab, big: `${pct} %`, unit: "de bonnes réponses", note: `Vitesse moyenne : ${ms ? ms + " ms" : "–"}. ${hits} trouvés, ${misses} oubliés, ${falses} clics en trop.` });
    }
    nextCat();
  }

  /* ---------- 3. Le serpent des figures ---------- */
  function snake(level, seed, m, cb, g) {
    const r = rng(seed ^ 0x77a1);
    const N = 13;
    const speed = [240, 200, 165, 135][level];
    const nDecoys = [2, 3, 5, 7][level];
    const wrap = level < 2;
    const limit = 150;
    const pool = D.figures.filter((f) => (level === 0 ? f.l === 0 : level === 1 ? f.l <= 1 : level === 2 ? f.l === 1 || f.l === 2 : f.l >= 2));
    const figs = shuffle(pool, r).slice(0, 8);
    const allSyl = [...new Set(D.figures.flatMap((f) => f.s))];
    const blocks = new Set();
    if (level === 3) {
      while (blocks.size < 8) {
        const x = 1 + Math.floor(r() * (N - 2)), y = 1 + Math.floor(r() * (N - 2));
        if (Math.abs(x - 6) > 2 || Math.abs(y - 6) > 1) blocks.add(`${x},${y}`);
      }
    }
    let figIdx = 0, sylIdx = 0, lives = 3, score = 0, foundN = 0;
    let body, dir, nextDir, tokens = [], grow = 0, frozen = 0, shake = 0;
    const t0 = performance.now();
    const fig = () => figs[figIdx];
    const ex = () => fig().e[Math.floor(figIdx * 7 + seed) % fig().e.length];
    const promptText = () => (level < 2 ? fig().d : ex());
    const label = () => `${foundN} figure${foundN > 1 ? "s" : ""}`;

    m.innerHTML = `<div class="sn">
      <div class="hud" style="width:100%"><span id="lv"></span><span>Figure <b id="fi"></b></span><span id="tm"></span></div>
      <div class="prompt" id="pr"></div>
      <div class="blanks" id="bl"></div>
      <canvas id="snake"></canvas>
      <div class="pad">
        <button class="u" data-d="0,-1" aria-label="Haut">↑</button>
        <button class="l" data-d="-1,0" aria-label="Gauche">←</button>
        <button class="d" data-d="0,1" aria-label="Bas">↓</button>
        <button class="r" data-d="1,0" aria-label="Droite">→</button>
      </div></div>`;
    const cv = m.querySelector("#snake");
    const ctx = cv.getContext("2d");
    let cell = 26;

    function size() {
      const avail = Math.min(m.clientWidth, Math.max(260, window.innerHeight - 340));
      const side = Math.min(avail, 620);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cell = Math.floor(side / N);
      const px = cell * N;
      cv.style.width = cv.style.height = px + "px";
      cv.width = cv.height = Math.round(px * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    g.on(window, "resize", size);

    function updateText() {
      m.querySelector("#lv").textContent = "♥".repeat(lives) + "♡".repeat(3 - lives);
      m.querySelector("#fi").textContent = `${Math.min(figIdx + 1, figs.length)}/${figs.length}`;
      m.querySelector("#pr").textContent = fr(promptText());
      const s = fig().s;
      const hideLen = level === 3;
      let html = "";
      if (hideLen) {
        html = s.slice(0, sylIdx).map((x) => `<span class="f">${esc(x)}</span>`).join("") + `<span>?</span>`;
      } else {
        html = s.map((x, i) => {
          if (i < sylIdx) return `<span class="f">${esc(x)}</span>`;
          if (i === 0 && level === 0) return `<span>${esc(x[0])}…</span>`;
          return `<span></span>`;
        }).join("");
      }
      m.querySelector("#bl").innerHTML = html;
    }

    const occupied = (x, y) => body.some((b) => b.x === x && b.y === y) || blocks.has(`${x},${y}`);
    function freeCell(used) {
      for (let t = 0; t < 500; t++) {
        const x = Math.floor(r() * N), y = Math.floor(r() * N);
        const h = body[0];
        const k = `${x},${y}`;
        if (occupied(x, y) || used.has(k)) continue;
        if (Math.abs(x - h.x) + Math.abs(y - h.y) < 3) continue;
        used.add(k);
        return { x, y };
      }
      return { x: 0, y: 0 };
    }
    function spawnTokens() {
      const need = fig().s[sylIdx];
      const used = new Set();
      tokens = [{ ...freeCell(used), s: need, ok: true }];
      const decoys = shuffle(allSyl.filter((s) => s !== need), r).slice(0, nDecoys);
      decoys.forEach((s) => tokens.push({ ...freeCell(used), s, ok: false }));
    }
    function reset() {
      body = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
      dir = { x: 1, y: 0 };
      nextDir = dir;
      grow = 0;
      frozen = 500;
      spawnTokens();
      updateText();
    }
    function hurt(msg) {
      lives--;
      shake = 8;
      Sfx.ko();
      flash(m, msg, true);
      updateText();
      if (lives <= 0) { finish(false); return true; }
      return false;
    }
    function eat(tok) {
      if (tok.ok) {
        grow++;
        Sfx.ok();
        score += 10 * (level + 1);
        sylIdx++;
        if (sylIdx >= fig().s.length) {
          foundN++;
          score += 50 * (level + 1);
          flash(m, `${fig().n} : bravo !`);
          cb.report(score, label());
          figIdx++;
          sylIdx = 0;
          if (figIdx >= figs.length) { finish(true); return; }
        } else {
          cb.report(score, label());
        }
        spawnTokens();
        updateText();
      } else {
        if (hurt("Mauvaise syllabe")) return;
        if (body.length > 3) body.pop();
        tokens = tokens.filter((t) => t !== tok);
        const used = new Set(tokens.map((t) => `${t.x},${t.y}`));
        tokens.push({ ...freeCell(used), s: tok.s, ok: false });
      }
    }
    function tick() {
      dir = nextDir;
      const h = { x: body[0].x + dir.x, y: body[0].y + dir.y };
      if (wrap) { h.x = (h.x + N) % N; h.y = (h.y + N) % N; }
      if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N) { if (!hurt("Le mur !")) reset(); return; }
      if (blocks.has(`${h.x},${h.y}`) || body.slice(0, -1).some((b) => b.x === h.x && b.y === h.y)) { if (!hurt("Collision !")) reset(); return; }
      body.unshift(h);
      if (grow > 0) grow--; else body.pop();
      const tok = tokens.find((t) => t.x === h.x && t.y === h.y);
      if (tok) eat(tok);
    }
    function draw() {
      const W = cell * N;
      ctx.save();
      if (shake > 0) { ctx.translate((shake % 2 ? -1 : 1) * 4, 0); shake--; }
      ctx.fillStyle = "#0d1742";
      ctx.fillRect(0, 0, W, W);
      ctx.strokeStyle = "rgba(120,140,220,.12)";
      ctx.lineWidth = 1;
      for (let i = 1; i < N; i++) {
        ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, W); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(W, i * cell); ctx.stroke();
      }
      if (!wrap) { ctx.strokeStyle = "#ff7792"; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, W - 3, W - 3); }
      ctx.fillStyle = "#33438f";
      blocks.forEach((k) => { const [x, y] = k.split(",").map(Number); ctx.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4); });
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      tokens.forEach((t) => {
        ctx.fillStyle = "#f6f8ff";
        const pad = 1;
        const x = t.x * cell + pad, y = t.y * cell + pad, s = cell - pad * 2;
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 7);
        ctx.fill();
        ctx.fillStyle = "#0a1236";
        let fs = Math.floor(cell * 0.46);
        ctx.font = `800 ${fs}px Poppins, sans-serif`;
        while (ctx.measureText(t.s).width > s - 3 && fs > 8) { fs--; ctx.font = `800 ${fs}px Poppins, sans-serif`; }
        ctx.fillText(t.s, t.x * cell + cell / 2, t.y * cell + cell / 2 + 1);
      });
      body.forEach((b, i) => {
        ctx.fillStyle = i === 0 ? "#46e3a8" : `hsl(${168 + i * 4},75%,${58 - Math.min(i, 12)}%)`;
        ctx.beginPath();
        ctx.roundRect(b.x * cell + 1.5, b.y * cell + 1.5, cell - 3, cell - 3, 7);
        ctx.fill();
      });
      const head = body[0];
      ctx.fillStyle = "#0a1236";
      ctx.beginPath();
      ctx.arc(head.x * cell + cell / 2 + dir.x * cell * 0.18, head.y * cell + cell / 2 + dir.y * cell * 0.18, cell * 0.1, 0, 7);
      ctx.fill();
      ctx.restore();
    }
    const setDir = (x, y) => {
      if (x === -dir.x && y === -dir.y) return;
      nextDir = { x, y };
    };
    m.querySelectorAll(".pad button").forEach((b) => {
      const [x, y] = b.dataset.d.split(",").map(Number);
      g.on(b, "pointerdown", (e) => { e.preventDefault(); setDir(x, y); });
    });
    g.on(window, "keydown", (e) => {
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], z: [0, -1], s: [0, 1], q: [-1, 0], d: [1, 0] };
      const d = map[e.key];
      if (d) { e.preventDefault(); setDir(d[0], d[1]); }
    });
    let sx = 0, sy = 0, swiping = false;
    g.on(cv, "pointerdown", (e) => { swiping = true; sx = e.clientX; sy = e.clientY; cv.setPointerCapture(e.pointerId); });
    g.on(cv, "pointermove", (e) => {
      if (!swiping) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
      sx = e.clientX; sy = e.clientY;
    });
    g.on(cv, "pointerup", () => { swiping = false; });

    let ended = false;
    function finish(all) {
      if (ended) return;
      ended = true;
      if (all) { score += lives * 30 * (level + 1); Sfx.win(); }
      const lab = label();
      cb.report(score, lab, true);
      cb.end({ score, label: lab, big: String(foundN), unit: foundN > 1 ? "figures trouvées" : "figure trouvée", note: all ? "Toutes les figures sont trouvées." : "Regarde bien l'indice avant de foncer." });
    }

    reset();
    let last = performance.now(), acc = 0;
    g.frame((ts) => {
      if (ended) return false;
      const dt = ts - last;
      last = ts;
      if (frozen > 0) frozen -= dt;
      else {
        acc += dt;
        const step = Math.max(90, speed - figIdx * 4);
        while (acc >= step && !ended) { acc -= step; tick(); }
      }
      const left = limit - (ts - t0) / 1000;
      m.querySelector("#tm").textContent = fmt(Math.max(0, left));
      if (left <= 0) { finish(false); return false; }
      draw();
    });
  }

  /* ---------- 4. L'évasion des PCS ---------- */
  const ICONS = [
    '<path d="M12 21V7m0 0c-1-3 0-5 0-5s3 1 3 5m-3 0c1-3 0-5 0-5s-3 1-3 5m3 8c-3 0-5-2-5-4m5 7c3 0 5-2 5-4"/>',
    '<path d="M3 10h18l-2-6H5zM5 10v10h14V10M9 20v-6h6v6"/>',
    '<path d="M4 8h16v12H4zM9 8V5h6v3M4 13h16"/>',
    '<circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/>',
    '<path d="M4 20h16l-1-9H5zM7 11V4h10v7M9 15h6"/>',
    '<path d="M4 20l6-6m0 0 3-8 5 5-8 3zM14 4l6 6"/>',
  ];
  const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  function escape(level, seed, m, cb, g) {
    const r = rng(seed ^ 0xbeef);
    const set = D.escape[level];
    const limit = [480, 600, 720, 900][level];
    const solved = [false, false, false, false, false, false];
    const letters = set.scr.split("");
    let penalty = 0, errors = 0;
    const t0 = performance.now();
    const elapsed = () => (performance.now() - t0) / 1000 + penalty;
    const nSolved = () => solved.filter(Boolean).length;
    const label = () => `${nSolved()}/6 énigmes`;
    const scoreNow = () => nSolved() * 500;
    const wrong = () => { penalty += 10; errors++; Sfx.ko(); flash(m, "+10 s de pénalité", true); };
    let finished = false;

    function clock() {
      g.frame(() => {
        const e = m.querySelector("#clk");
        if (!e) return false;
        e.textContent = fmt(elapsed());
      });
    }

    function room() {
      m.innerHTML = `<div class="hud"><span>Chrono <b id="clk">0:00</b></span><span><b>${nSolved()}</b> / 6 casiers</span></div>
      <div class="door"><div class="small muted">Tu es enfermé dans la salle des recensements. Chaque casier ouvert donne une lettre de la porte.</div>
      <div class="slots">${letters.map((l, i) => `<span>${solved[i] ? l : ""}</span>`).join("")}</div>
      ${nSolved() === 6 ? `<button class="btn primary big" id="final">Ouvrir la porte</button>` : ""}</div>
      <div class="casiers">${D.pcs.map((p, i) => `<button class="casier ${solved[i] ? "solved" : ""}" data-i="${i}"><svg viewBox="0 0 24 24">${ICONS[i]}</svg>${esc(p.k)}${solved[i] ? `<span style="color:var(--green);font-size:18px;font-weight:800">${esc(letters[i])}</span>` : ""}</button>`).join("")}</div>`;
      m.querySelectorAll(".casier").forEach((b) => g.on(b, "click", () => { const k = +b.dataset.i; if (!solved[k]) open(k); }));
      const f = m.querySelector("#final");
      if (f) g.on(f, "click", finalDoor);
      clock();
    }

    function shell(k, instr) {
      const key = ["memory", "riddle", "mirror", "anagram", "caisse", "sequence"][k];
      const data = set[key];
      m.innerHTML = `<div class="puzzle"><div class="hud"><button class="link" id="back">← Retour</button><span>Chrono <b id="clk">0:00</b></span></div>
      <h3>${esc(D.pcs[k].k)}</h3><div class="muted small">${esc(instr)}</div>
      <div id="body" style="display:flex;flex-direction:column;gap:12px"></div>
      <button class="link" id="hint" style="text-align:left">Besoin d'un indice ? (+30 s)</button><div class="hint" id="ht" hidden></div></div>`;
      g.on(m.querySelector("#back"), "click", room);
      const hb = m.querySelector("#hint");
      g.on(hb, "click", () => {
        penalty += 30;
        hb.hidden = true;
        const ht = m.querySelector("#ht");
        ht.textContent = fr(data.hint);
        ht.hidden = false;
      });
      clock();
      return m.querySelector("#body");
    }

    function win(k) {
      solved[k] = true;
      Sfx.win();
      cb.report(scoreNow(), label());
      m.innerHTML = `<div class="center"><div class="badge">Casier ouvert</div><div class="resultN">${esc(letters[k])}</div>
        <div class="note">${esc(D.pcs[k].c)}</div><button class="btn primary big" id="go">Retour à la pièce</button></div>`;
      g.on(m.querySelector("#go"), "click", room);
    }

    const open = (k) => [memory, riddle, mirror, anagram, caisse, sequence][k](k);

    function memory(k) {
      const body = shell(k, "Retrouve les paires : retourne deux cartes à la fois.");
      const pairs = set.memory.pairs;
      const cards = shuffle(pairs.flatMap((p, i) => [{ t: p[0], id: i }, { t: p[1], id: i }]), r);
      const cols = cards.length <= 12 ? 3 : 4;
      body.innerHTML = `<div class="mem" style="--cols:${cols}">${cards.map((c, i) => `<button class="card" data-i="${i}">?</button>`).join("")}</div>`;
      const els = [...body.querySelectorAll(".card")];
      let first = -1, busy = false, left = pairs.length;
      els.forEach((b, i) => g.on(b, "click", () => {
        if (busy || b.classList.contains("up") || b.classList.contains("done")) return;
        b.classList.add("up");
        b.textContent = fr(cards[i].t);
        if (first < 0) { first = i; return; }
        const a = first;
        first = -1;
        if (cards[a].id === cards[i].id) {
          Sfx.ok();
          els[a].classList.remove("up"); els[a].classList.add("done");
          b.classList.remove("up"); b.classList.add("done");
          left--;
          if (!left) g.t(() => win(k), 500);
        } else {
          busy = true;
          g.t(() => { [els[a], b].forEach((x) => { x.classList.remove("up"); x.textContent = "?"; }); busy = false; }, 900);
        }
      }));
    }

    function quiz(k, instr, items, style) {
      const body = shell(k, instr);
      let i = 0;
      const show = () => {
        const it = items[i];
        const opts = shuffle([it.a, ...it.o], r);
        const reversed = style === "reverse" ? it.t.split("").reverse().join("") : it.t;
        const cls = style === "mirror" ? "mirror" : style === "flip" ? "flip" : "";
        body.innerHTML = `<div class="q"><span class="${cls}">${esc(reversed)}</span></div>
        <div class="hud"><span class="small muted">${i + 1} / ${items.length}</span></div>
        <div class="opts">${opts.map((o, n) => `<button class="opt" data-n="${n}">${esc(o)}</button>`).join("")}</div>`;
        body.querySelectorAll(".opt").forEach((b) => g.on(b, "click", () => {
          if (opts[+b.dataset.n] === it.a) {
            Sfx.ok();
            i++;
            if (i >= items.length) win(k); else show();
          } else {
            wrong();
            b.classList.add("bad", "shake");
            b.disabled = true;
          }
        }));
      };
      show();
    }
    const riddle = (k) => quiz(k, "Qui suis-je ? Choisis la bonne réponse.", set.riddle.items);
    const mirror = (k) => {
      const st = set.mirror.style;
      const instr = st === "mirror" ? "Le message est écrit en miroir. Quel métier y est caché ?" : st === "reverse" ? "Le message est écrit à l'envers. Quel métier y est caché ?" : "Le message est retourné. Quel métier y est caché ?";
      quiz(k, instr, set.mirror.items, st);
    };

    function anagram(k) {
      const body = shell(k, "Remets les lettres dans l'ordre.");
      let i = 0;
      const show = () => {
        const [word, hint] = set.anagram.items[i];
        const chars = word.split("");
        const pool = shuffle(chars.map((c, n) => ({ c, n })).filter((x) => x.c !== " "), r);
        let picked = [];
        const render = () => {
          let p = 0;
          const shown = chars.map((c) => {
            if (c === " ") return `<span class="sp"></span>`;
            const v = picked[p++];
            return `<span>${v ? v.c : ""}</span>`;
          }).join("");
          body.innerHTML = `<div class="q" style="font-size:19px;min-height:80px">${esc(hint)}</div>
          <div class="answer">${shown}</div>
          <div class="letters">${pool.map((x, n) => `<button class="letter" data-n="${n}" ${picked.includes(x) ? "disabled" : ""}>${x.c}</button>`).join("")}</div>
          <button class="link" id="clear">Tout effacer</button>`;
          body.querySelectorAll(".letter").forEach((b) => g.on(b, "click", () => {
            picked.push(pool[+b.dataset.n]);
            const needed = chars.filter((c) => c !== " ").length;
            if (picked.length === needed) {
              const typed = picked.map((x) => x.c).join("");
              if (typed === word.replace(/ /g, "")) {
                Sfx.ok();
                i++;
                if (i >= set.anagram.items.length) return win(k);
                return show();
              }
              wrong();
              picked = [];
            }
            render();
          }));
          g.on(body.querySelector("#clear"), "click", () => { picked = []; render(); });
        };
        render();
      };
      show();
    }

    function caisse(k) {
      const body = shell(k, "À la caisse, calcule juste. Utilise le pavé numérique.");
      let i = 0, val = "";
      const show = () => {
        const it = set.caisse.items[i];
        body.innerHTML = `<div class="q" style="font-size:20px">${esc(it.q)}</div>
        <div class="display" id="d">${val || "0"}</div>
        <div class="keypad">${["7", "8", "9", "4", "5", "6", "1", "2", "3", ",", "0", "⌫"].map((x) => `<button data-k="${x}">${x}</button>`).join("")}
        <button class="ok" id="v" style="grid-column:1/-1">Valider</button></div>`;
        const d = body.querySelector("#d");
        body.querySelectorAll("[data-k]").forEach((b) => g.on(b, "click", () => {
          const x = b.dataset.k;
          if (x === "⌫") val = val.slice(0, -1);
          else if (x === "," ? !val.includes(",") && val : val.length < 8) val += x;
          d.textContent = val || "0";
        }));
        g.on(body.querySelector("#v"), "click", () => {
          const n = parseFloat(val.replace(",", "."));
          if (Math.abs(n - it.a) < 0.001) {
            Sfx.ok();
            val = "";
            i++;
            if (i >= set.caisse.items.length) win(k); else show();
          } else if (val) {
            wrong();
            val = "";
            d.textContent = "0";
            d.classList.add("shake");
          }
        });
      };
      show();
    }

    function sequence(k) {
      const body = shell(k, set.sequence.title);
      const steps = set.sequence.steps;
      const order = shuffle(steps, r);
      let n = 0;
      const render = () => {
        body.innerHTML = `<div class="seq">${order.map((s) => {
          const at = steps.indexOf(s);
          const done = at < n;
          return `<button class="step ${done ? "done" : ""}" data-s="${esc(s)}" ${done ? "disabled" : ""}>${done ? at + 1 + ". " : ""}${esc(s)}</button>`;
        }).join("")}</div><div class="muted small">Touche les étapes de la première à la dernière.</div>`;
        body.querySelectorAll(".step:not([disabled])").forEach((b) => g.on(b, "click", () => {
          const s = order.find((x) => esc(x) === b.dataset.s);
          if (steps.indexOf(s) === n) {
            Sfx.ok();
            n++;
            if (n >= steps.length) win(k); else render();
          } else {
            wrong();
            b.classList.add("shake");
          }
        }));
      };
      render();
    }

    function finalDoor() {
      m.innerHTML = `<div class="puzzle"><div class="hud"><button class="link" id="back">← Retour</button><span>Chrono <b id="clk">0:00</b></span></div>
      <h3>La porte</h3><div class="q" style="font-size:20px">${esc(set.clue)}</div><div id="f" style="display:flex;flex-direction:column;gap:12px"></div></div>`;
      g.on(m.querySelector("#back"), "click", room);
      clock();
      const body = m.querySelector("#f");
      let picked = [];
      const target = norm(set.word);
      const pool = shuffle(letters.map((c, n) => ({ c, n })), r);
      const render = () => {
        body.innerHTML = `<div class="answer">${letters.map((_, i) => `<span>${picked[i] ? picked[i].c : ""}</span>`).join("")}</div>
        <div class="letters">${pool.map((x, n) => `<button class="letter" data-n="${n}" ${picked.includes(x) ? "disabled" : ""}>${x.c}</button>`).join("")}</div>
        <button class="link" id="clear">Tout effacer</button>`;
        body.querySelectorAll(".letter").forEach((b) => g.on(b, "click", () => {
          picked.push(pool[+b.dataset.n]);
          if (picked.length === letters.length) {
            if (norm(picked.map((x) => x.c).join("")) === target) return escaped();
            wrong();
            picked = [];
          }
          render();
        }));
        g.on(body.querySelector("#clear"), "click", () => { picked = []; render(); });
      };
      render();
    }

    function escaped() {
      if (finished) return;
      finished = true;
      Sfx.win();
      const e = elapsed();
      const score = 3000 + 1000 + Math.round(Math.max(0, limit - e) * 2);
      const lab = `Évadé en ${fmt(e)}`;
      cb.report(score, lab, true);
      cb.end({ score, label: lab, big: fmt(e), unit: "pour t'évader", note: `Le mot de la porte : ${set.word}. ${errors} erreur${errors > 1 ? "s" : ""}.` });
    }
    room();
  }

  const IMPL = { dates, clic, snake, escape };

  function start(key, level, seed, mount, cb) {
    const g = kit();
    const info = INFO[key];
    mount.innerHTML = `<div class="g" style="--c:${info.c}"></div>`;
    const m = mount.firstChild;
    IMPL[key](level, seed >>> 0, m, cb, g);
    return { stop() { g.stop(); } };
  }

  return { start, LEVELS, INFO, esc, fr, Sfx, fmt };
})();
