/* Accueil, mode solo, salles en direct et classements. */
(function () {
  const { start: startGame, LEVELS, INFO, esc, fr, Sfx, fmt } = window.Games;
  const app = document.getElementById("app");
  const KEYS = window.ARENA_DATA.keys || ["dates", "escape", "snake", "clic"];
  const qs = new URLSearchParams(location.search);
  const EDITIONS = { imrt: "IMRT", prepa: "Prépa" };
  const EDITION = (location.pathname.match(/^\/(imrt|prepa)(\/|$)/) || [])[1] || "escp";
  const editionHome = (e) => (EDITIONS[e] ? `/${e}` : "/");
  const BASE = EDITIONS[EDITION] ? `/${EDITION}` : "";
  const HOME_PATH = BASE || "/";
  const BRAND = EDITIONS[EDITION] || "Memorall";
  const SOLO_ONLY = location.pathname.slice(BASE.length).replace(/\/$/, "") === "/solo";
  const recordKey = (k) => (EDITIONS[EDITION] ? `${EDITION}-${k}` : k);

  /* Typographie française sur tout le texte affiché */
  const fixTypo = (t) => t.replace(/'/g, "\u2019").replace(/ ([:;!?»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");
  function typoNode(node) {
    if (node.nodeType === 3) { const n = fixTypo(node.nodeValue); if (n !== node.nodeValue) node.nodeValue = n; return; }
    if (node.nodeType !== 1 || node.tagName === "SCRIPT" || node.tagName === "STYLE") return;
    node.childNodes.forEach(typoNode);
  }
  new MutationObserver((list) => list.forEach((m) => { if (m.type === "characterData") typoNode(m.target); else m.addedNodes.forEach(typoNode); })).observe(app, { childList: true, subtree: true, characterData: true });

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } },
  };
  function playerId() {
    let v = store.get("arena:id", "");
    if (!v) { v = "p" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36); store.set("arena:id", v); }
    return v;
  }
  let lock = null;
  async function keepAwake() { try { lock = await navigator.wakeLock?.request("screen"); } catch (e) { /* non pris en charge */ } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && lock) keepAwake(); });

  const logo = `<span class="logo">memor<b>all</b></span>`;
  function header(right) {
    return `<div class="top">${logo}<div style="display:flex;gap:6px;align-items:center">${right || ""}<button class="link" id="snd">${Sfx.muted ? "Son coupé" : "Son actif"}</button></div></div>`;
  }
  function bindHeader() {
    const s = document.getElementById("snd");
    if (s) s.onclick = () => { Sfx.toggle(); s.textContent = Sfx.muted ? "Son coupé" : "Son actif"; };
    const h = document.getElementById("home");
    if (h) h.onclick = () => {
      if (conn && !h.dataset.sure) {
        h.dataset.sure = "1";
        h.textContent = "Quitter la salle ?";
        setTimeout(() => { if (h.isConnected) { delete h.dataset.sure; h.textContent = "Accueil"; } }, 3500);
        return;
      }
      leave(); home();
    };
  }
  const homeBtn = `<button class="link" id="home">Accueil</button>`;
  const footer = `<div class="foot">Memorall · <button id="legal">Mentions légales</button></div>`;
  function view(html) {
    app.innerHTML = html;
    window.scrollTo(0, 0);
    bindHeader();
    const l = document.getElementById("legal");
    if (l) l.onclick = legal;
  }
  function setUrl(q) { history.replaceState(null, "", q ? "?" + q : location.pathname); }

  function drawQR(text) {
    const q = qrcode(0, "M");
    q.addData(text);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
    return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" role="img" aria-label="QR code pour rejoindre la salle" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#0a1236"/></svg>`;
  }

  /* ---------- Connexion à une salle ---------- */
  function Connection(code, onState, onError) {
    let ws = null, retry = 0, dead = false;
    const self = {
      clock: 0, connected: false,
      send(action) { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "action", action })); },
      close() { dead = true; clearInterval(ping); if (ws) ws.close(); },
    };
    function connect() {
      if (dead) return;
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${proto}//${location.host}/ws/${code}`);
      ws.onopen = () => { retry = 0; self.connected = true; ws.send(JSON.stringify({ type: "join", playerId: playerId() })); };
      ws.onmessage = (e) => {
        if (e.data === "__pong") return;
        let m;
        try { m = JSON.parse(e.data); } catch (err) { return; }
        if (m.type === "state") {
          if (m.now) self.clock = m.now - Date.now();
          if (m.view && m.view.exists && m.view.edition !== EDITION) {
            location.replace(`${editionHome(m.view.edition)}?salle=${code}`);
            return;
          }
          onState(m.view, self);
        }
        else if (m.type === "error") onError(m.error);
      };
      ws.onclose = () => {
        self.connected = false;
        if (dead) return;
        retry = Math.min(retry + 1, 5);
        setTimeout(connect, 400 * 2 ** (retry - 1));
      };
    }
    const ping = setInterval(() => { if (ws && ws.readyState === 1) ws.send("__ping"); }, 25000);
    connect();
    return self;
  }
  let conn = null, game = null, ticker = null;
  function stopGame() { if (game) { game.stop(); game = null; } }
  function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }
  function leave() { stopGame(); stopTicker(); if (conn) { conn.close(); conn = null; } setUrl(""); }

  /* ---------- Accueil ---------- */
  function soloHome() {
    leave();
    const url = `${location.origin}${BASE}/solo`;
    const bests = (k) => LEVELS.map((l, i) => {
      const b = +store.get(bestKey(k, i), 0);
      return `<span>${l} <b>${b || "–"}</b></span>`;
    }).join("");
    view(`<div class="wrap">${header(`<button class="link" id="rec">Classements</button>`)}
      <section class="hero">
        <div><h1>L’Arène${EDITIONS[EDITION] ? " " + BRAND : ""} <em>en solo</em></h1>
        <p>Choisis un jeu et un niveau, puis bats tes records. Ton pseudo sert au classement général.</p>
        <div style="max-width:380px;margin-top:16px"><input class="field" id="me" maxlength="16" autocomplete="off" placeholder="Ton pseudo" value="${esc(store.get("arena:pseudo", ""))}" aria-label="Ton pseudo"></div></div>
        <div class="qr-card homeqr"><div class="lbl">Scanne pour jouer sur ton téléphone</div>${drawQR(url)}</div>
      </section>
      <div class="games">${KEYS.map((k) => `<button class="game" style="--c:${INFO[k].c}" data-k="${k}"><h3>${esc(INFO[k].name)}</h3><p>${esc(INFO[k].desc)}</p><div class="bests">${bests(k)}</div></button>`).join("")}</div>
      ${footer}</div>`);
    document.getElementById("me").onchange = (e) => store.set("arena:pseudo", e.target.value.trim());
    document.getElementById("rec").onclick = () => records("clic", 0);
    app.querySelectorAll(".game").forEach((b) => { b.onclick = () => pickLevel(b.dataset.k); });
  }

  function home() {
    if (SOLO_ONLY) return soloHome();
    leave();
    view(`<div class="wrap">${header(`<button class="link" id="solo">Mode individuel</button><button class="link" id="rec">Classements</button>`)}
      <section class="hero">
        <div><h1>L’Arène <em>${BRAND}</em></h1>
        <p>Quatre jeux, quatre niveaux. Joue seul pour battre ton record, ou lance une compétition en direct : chacun scanne le QR code et joue sur son téléphone.</p></div>
        <form class="join" id="jf">
          <h2>Rejoindre une compétition</h2>
          <input class="field" id="code" autocomplete="off" autocapitalize="characters" maxlength="5" placeholder="Code de la salle" aria-label="Code de la salle">
          <button class="btn primary big" type="submit">Entrer</button>
          <button class="btn" type="button" id="host">Animer une compétition</button>
        </form>
      </section>
      <h2 class="section-h">Jouer seul</h2>
      <div class="games">${KEYS.map((k) => `<button class="game" style="--c:${INFO[k].c}" data-k="${k}"><h3>${esc(INFO[k].name)}</h3><p>${esc(INFO[k].desc)}</p></button>`).join("")}</div>
      ${footer}</div>`);
    document.getElementById("jf").onsubmit = (e) => { e.preventDefault(); const c = cleanCode(document.getElementById("code").value); if (c) joinForm(c); };
    document.getElementById("host").onclick = createRoom;
    document.getElementById("solo").onclick = () => { location.href = `${BASE}/solo`; };
    document.getElementById("rec").onclick = () => records("clic", 0);
    app.querySelectorAll(".game").forEach((b) => { b.onclick = () => pickLevel(b.dataset.k); });
  }
  const cleanCode = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);

  const LEVEL_NOTE = ["Pour commencer", "Pour les habitués", "Pour les costauds", "Pour les experts"];
  function pickLevel(k) {
    view(`<div class="wrap narrow">${header(homeBtn)}
      <h2 style="font-size:30px;color:${INFO[k].c}">${esc(INFO[k].name)}</h2>
      <p class="muted">${esc(INFO[k].desc)}</p>
      <div class="levels" style="--accent:${INFO[k].c}">${LEVELS.map((l, i) => `<button class="level" data-l="${i}">${l}<small>${LEVEL_NOTE[i]}</small></button>`).join("")}</div>
      <button class="btn" id="rec">Voir les records</button>
      ${footer}</div>`);
    app.querySelectorAll(".level").forEach((b) => { b.onclick = () => playSolo(k, +b.dataset.l); });
    document.getElementById("rec").onclick = () => records(k, 0);
  }

  /* ---------- Mode solo ---------- */
  function playSolo(k, l) {
    leave();
    keepAwake();
    const seed = (Math.random() * 2 ** 32) >>> 0;
    view(`<div class="wrap narrow" style="flex:1">${header(homeBtn)}<div id="stage" style="flex:1;display:flex;flex-direction:column"></div></div>`);
    game = startGame(k, l, seed, document.getElementById("stage"), {
      report() {},
      end(res) { soloEnd(k, l, res); },
    });
  }
  function bestKey(k, l) { return `arena:best:${recordKey(k)}:${l}`; }
  function soloEnd(k, l, res) {
    stopGame();
    const prev = +store.get(bestKey(k, l), 0);
    const beat = res.score > prev;
    if (beat) store.set(bestKey(k, l), res.score);
    view(`<div class="wrap narrow">${header(homeBtn)}
      <div class="center" style="flex:0">
        <div class="badge" style="color:${INFO[k].c}">${esc(INFO[k].name)} · ${LEVELS[l]}</div>
        <div class="resultN">${esc(res.big)}</div>
        <div style="font-weight:700">${esc(res.unit)}</div>
        <div class="muted">${esc(res.note)}</div>
        <div class="muted">${res.score} points${beat && prev ? " · nouveau record personnel" : ""}</div>
      </div>
      <form class="panel" id="sf">
        <h2>Entrer au classement</h2>
        <input class="field" id="ps" maxlength="16" autocomplete="off" placeholder="Ton pseudo" value="${esc(store.get("arena:pseudo", ""))}" aria-label="Ton pseudo">
        <button class="btn primary" type="submit">Enregistrer mon score</button>
        <div id="msg" class="muted small"></div>
      </form>
      <div class="row"><button class="btn" id="again">Rejouer</button><button class="btn" id="lvl">Changer de niveau</button></div>
      <div id="list"></div>
      ${footer}</div>`);
    document.getElementById("again").onclick = () => playSolo(k, l);
    document.getElementById("lvl").onclick = () => pickLevel(k);
    const form = document.getElementById("sf");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const pseudo = document.getElementById("ps").value.trim();
      const msg = document.getElementById("msg");
      if (!pseudo) { msg.textContent = "Écris un pseudo pour enregistrer ton score."; return; }
      store.set("arena:pseudo", pseudo);
      msg.textContent = "Envoi…";
      try {
        const r = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ g: recordKey(k), l, pseudo, score: res.score, label: res.label }) });
        const j = await r.json();
        if (!r.ok) { msg.textContent = r.status === 400 ? "Ce pseudo n'est pas accepté, choisis-en un autre." : "Attends une seconde et réessaie."; return; }
        form.innerHTML = `<h2>${j.rank ? `Tu es ${j.rank}${j.rank === 1 ? "er" : "e"} du classement` : "Score enregistré, mais hors du top 20"}</h2>`;
        renderList(document.getElementById("list"), j.list);
      } catch (err) { msg.textContent = "Connexion impossible. Ton record personnel reste enregistré sur cet appareil."; }
    };
    loadList(document.getElementById("list"), k, l);
  }

  /* ---------- Classements ---------- */
  async function loadList(el, k, l) {
    el.innerHTML = `<div class="muted">Chargement…</div>`;
    try {
      const r = await fetch(`/api/records?g=${recordKey(k)}&l=${l}`);
      const j = await r.json();
      renderList(el, j.list || []);
    } catch (e) { el.innerHTML = `<div class="muted">Classement indisponible pour le moment.</div>`; }
  }
  function renderList(el, list) {
    if (!el) return;
    if (!list.length) { el.innerHTML = `<div class="panel"><div class="empty">Personne pour l'instant. Le premier score enregistré prend la tête.</div></div>`; return; }
    el.innerHTML = `<div class="panel"><table class="rank"><tr><th>#</th><th>Pseudo</th><th>Résultat</th><th class="r">Points</th></tr>${list.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.pseudo)}</td><td>${esc(r.label)}</td><td class="r">${r.score}</td></tr>`).join("")}</table></div>`;
  }
  function records(k, l) {
    leave();
    view(`<div class="wrap narrow">${header(homeBtn)}
      <h2 style="font-size:30px">Classements</h2>
      <div class="tabs" id="tg">${KEYS.map((x) => `<button data-k="${x}" class="${x === k ? "on" : ""}">${esc(INFO[x].name)}</button>`).join("")}</div>
      <div class="tabs" id="tl">${LEVELS.map((x, i) => `<button data-l="${i}" class="${i === l ? "on" : ""}">${x}</button>`).join("")}</div>
      <div class="muted small" id="mine"></div>
      <div id="list"></div>${footer}</div>`);
    app.querySelectorAll("#tg button").forEach((b) => { b.onclick = () => records(b.dataset.k, l); });
    app.querySelectorAll("#tl button").forEach((b) => { b.onclick = () => records(k, +b.dataset.l); });
    const best = +store.get(bestKey(k, l), 0);
    if (best) document.getElementById("mine").textContent = fr(`Ton meilleur score sur cet appareil : ${best} points`);
    loadList(document.getElementById("list"), k, l);
  }

  /* ---------- Rejoindre (joueur) ---------- */
  function joinForm(code) {
    leave();
    setUrl(`salle=${code}`);
    view(`<div class="wrap narrow">${header(homeBtn)}
      <div class="center">
        <div class="badge">Salle ${esc(code)}</div>
        <h2 class="hello">Choisis ton pseudo</h2>
        <form id="pf" style="display:flex;flex-direction:column;gap:12px;width:100%">
          <input class="field" id="ps" maxlength="16" autocomplete="off" placeholder="Ton pseudo" value="${esc(store.get("arena:pseudo", ""))}" aria-label="Ton pseudo">
          <button class="btn primary big" type="submit">Je joue</button>
          <div id="msg" class="err small"></div>
        </form>
      </div>${footer}</div>`);
    const input = document.getElementById("ps");
    input.focus();
    document.getElementById("pf").onsubmit = (e) => {
      e.preventDefault();
      const pseudo = input.value.trim();
      if (!pseudo) { document.getElementById("msg").textContent = "Écris ton pseudo pour entrer."; return; }
      store.set("arena:pseudo", pseudo);
      joinRoom(code, pseudo);
    };
  }

  function joinRoom(code, pseudo) {
    keepAwake();
    let helloed = false, shownKey = "", activeRound = 0, reportAt = 0, reportTimer = 0, pending = null, lastView = null;

    function say(html) { stopGame(); view(`<div class="wrap narrow">${header(homeBtn)}<div class="center">${html}</div>${footer}</div>`); }
    function once(key, fn) { if (shownKey !== key) { shownKey = key; fn(); } }

    function flush() {
      if (!pending || !conn) return;
      conn.send({ t: "report", round: activeRound, score: pending.score, label: pending.label, done: pending.done });
      pending = null;
      reportAt = performance.now();
    }
    function report(score, label, done) {
      pending = { score, label, done: !!done };
      if (done) { clearTimeout(reportTimer); flush(); return; }
      const wait = 700 - (performance.now() - reportAt);
      if (wait <= 0) flush();
      else if (!reportTimer) reportTimer = setTimeout(() => { reportTimer = 0; flush(); }, wait);
    }

    function enterGame(v) {
      activeRound = v.round;
      shownKey = "game" + v.round;
      stopTicker();
      view(`<div class="wrap narrow" style="flex:1"><div class="top">${logo}<span class="badge" id="pill">${v.count} joueurs</span></div><div id="stage" style="flex:1;display:flex;flex-direction:column"></div></div>`);
      game = startGame(v.game, v.level, v.seed, document.getElementById("stage"), {
        report,
        end(res) {
          flush();
          stopGame();
          shownKey = "wait" + v.round;
          view(`<div class="wrap narrow">${header("")}<div class="center"><div class="badge">${esc(INFO[v.game].name)}</div><div class="resultN">${esc(res.big)}</div><div style="font-weight:700">${esc(res.unit)}</div><div class="muted">${res.score} points</div>${res.note ? `<div class="muted small">${esc(res.note)}</div>` : ""}<div class="muted">Regarde le grand écran : le classement arrive.</div></div>${footer}</div>`);
        },
      });
    }

    function onState(v, c) {
      lastView = v;
      if (!v) return;
      if (!v.exists) { once("gone", () => say(`<h2 class="hello">Salle introuvable</h2><p class="muted">Vérifie le code affiché par l'animateur.</p><button class="btn" id="bk">Revenir</button>`)); const b = document.getElementById("bk"); if (b) b.onclick = () => joinForm(code); return; }
      if (v.role === "banned") { once("ban", () => say(`<h2 class="hello">Tu as été retiré de la salle</h2>`)); return; }
      if (v.role === "new") { if (!helloed) { helloed = true; c.send({ t: "hello", pseudo }); } return; }
      if (v.role === "host") { conn = c; return renderHost(code, v, c); }
      if (!helloed) { helloed = true; c.send({ t: "hello", pseudo }); }

      const me = v.me;
      if (v.phase === "lobby") {
        once("lobby", () => say(`<div class="badge">Salle ${esc(code)}</div><h2 class="hello">Bienvenue ${esc(me.pseudo)} !</h2><p class="muted">L'animateur va lancer la partie. Garde cette page ouverte.</p><p class="muted" id="n"></p>`));
        const n = document.getElementById("n");
        if (n) n.textContent = `${v.count} joueur${v.count > 1 ? "s" : ""} dans la salle`;
      } else if (v.phase === "countdown") {
        if (!me.playing) return once("late", () => say(`<h2 class="hello">Manche en cours</h2><p class="muted">Tu joueras à la prochaine manche.</p>`));
        once("cd" + v.round, () => {
          say(`<div class="badge" style="color:${INFO[v.game].c}">${esc(INFO[v.game].name)} · ${LEVELS[v.level]}</div><div class="count" id="cnt"></div><div class="muted">Prépare-toi</div>`);
          const tick = () => { const left = Math.ceil((v.startAt - (Date.now() + c.clock)) / 1000); const e = document.getElementById("cnt"); if (e) e.textContent = Math.max(left, 1); };
          tick();
          stopTicker();
          ticker = setInterval(tick, 150);
        });
      } else if (v.phase === "live") {
        if (!me.playing) return once("late", () => say(`<h2 class="hello">Manche en cours</h2><p class="muted">Tu joueras à la prochaine manche.</p>`));
        if (activeRound !== v.round && !me.done) { enterGame(v); }
        else if (me.done && activeRound !== v.round) { once("wait" + v.round, () => say(`<h2 class="hello">Terminé</h2><p class="muted">Regarde le grand écran : le classement arrive.</p>`)); }
        const pill = document.getElementById("pill");
        if (pill && v.rank) pill.textContent = `${v.rank}${v.rank === 1 ? "er" : "e"} sur ${v.count}`;
      } else if (v.phase === "results") {
        activeRound = 0;
        stopTicker();
        const mine = v.mine;
        once("res" + v.round, () => {
          say(`<div class="badge">Manche ${v.round} · ${esc(INFO[v.game].name)}</div>
            ${mine && mine.played ? `<div class="resultN">${mine.rank}${mine.rank === 1 ? "er" : "e"}</div><div style="font-weight:700">sur ${v.count}</div><div class="muted">${esc(mine.label)} · ${mine.score} points</div><div class="muted">+${mine.points} points au classement général</div>` : `<h2 class="hello">Manche terminée</h2>`}
            <div class="muted">Prochaine manche bientôt.</div>`);
        });
      }
    }
    function onError(err) {
      if (err === "retiré par l'animateur") once("ban", () => say(`<h2 class="hello">Tu as été retiré de la salle</h2>`));
      else if (err === "salle introuvable") once("gone", () => say(`<h2 class="hello">Salle introuvable</h2><p class="muted">Vérifie le code affiché par l'animateur.</p>`));
    }
    conn = Connection(code, onState, onError);
    view(`<div class="wrap narrow">${header(homeBtn)}<div class="center"><div class="badge">Connexion à la salle ${esc(code)}…</div></div></div>`);
    return lastView;
  }

  /* ---------- Animateur ---------- */
  const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  function newCode() { let c = ""; for (let i = 0; i < 5; i++) c += CHARS[Math.floor(Math.random() * CHARS.length)]; return c; }

  function createRoom() { openHost(newCode()); }
  function openHost(code) {
    leave();
    keepAwake();
    setUrl(`animer=${code}`);
    let asked = false;
    view(`<div class="wrap wide">${header(homeBtn)}<div class="center"><div class="badge">Ouverture de la salle…</div></div></div>`);
    conn = Connection(code, (v, c) => {
      if (!v) return;
      if (!v.exists && !asked) { asked = true; c.send({ t: "create", edition: EDITION }); return; }
      if (v.role === "host") renderHost(code, v, c);
      else if (v.exists) { leave(); joinForm(code); }
    }, () => {});
  }

  let hostUi = { key: "", game: "dates", level: 0 };

  function renderHost(code, v, c) {
    const key = v.phase === "lobby" ? "lobby" : `${v.phase}${v.round}`;
    if (hostUi.key !== key) { hostUi.key = key; stopTicker(); paintHost(code, v, c); }
    updateHost(v, c);
  }

  function paintHost(code, v, c) {
    const url = `${location.origin}${HOME_PATH}?salle=${code}`;
    if (v.phase === "lobby") {
      view(`<div class="wrap wide">${header(homeBtn)}
        <div class="host">
          <div class="qr-card">
            <div class="lbl">Scanne pour jouer</div>${drawQR(url)}
            <div class="lbl">ou entre le code</div><div class="code">${esc(code)}</div>
            <div class="url">${esc(url.replace(/^https?:\/\//, ""))}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
            <div class="panel"><h2>Joueurs dans la salle : <span id="cnt">0</span></h2><div class="chips" id="chips"></div></div>
            <div class="panel"><h2>Quel jeu ?</h2>
              <div class="pick" id="pg">${KEYS.map((k) => `<button data-k="${k}" style="--c:${INFO[k].c}">${esc(INFO[k].name)}</button>`).join("")}</div>
              <h2>Quel niveau ?</h2>
              <div class="levels" id="pl" style="grid-template-columns:repeat(4,minmax(0,1fr));--accent:var(--cyan)">${LEVELS.map((l, i) => `<button class="level" data-l="${i}" style="min-height:58px">${l}</button>`).join("")}</div>
              <button class="btn primary big" id="go">Lancer la manche</button>
              <button class="link" id="clr" style="align-self:flex-start">Remettre le classement général à zéro</button>
            </div>
          </div>
        </div>${footer}</div>`);
      const syncPick = () => {
        app.querySelectorAll("#pg button").forEach((b) => b.classList.toggle("on", b.dataset.k === hostUi.game));
        app.querySelectorAll("#pl button").forEach((b) => b.classList.toggle("on", +b.dataset.l === hostUi.level));
      };
      app.querySelectorAll("#pg button").forEach((b) => { b.onclick = () => { hostUi.game = b.dataset.k; syncPick(); }; });
      app.querySelectorAll("#pl button").forEach((b) => { b.onclick = () => { hostUi.level = +b.dataset.l; syncPick(); }; });
      syncPick();
      document.getElementById("go").onclick = () => c.send({ t: "start", game: hostUi.game, level: hostUi.level });
      document.getElementById("clr").onclick = (e) => {
        const b = e.currentTarget;
        if (b.dataset.sure) { c.send({ t: "clear" }); b.textContent = "Classement général remis à zéro"; delete b.dataset.sure; }
        else { b.dataset.sure = "1"; b.textContent = "Clique à nouveau pour confirmer"; }
      };
    } else if (v.phase === "countdown" || v.phase === "live") {
      view(`<div class="wrap wide" style="--accent:${INFO[v.game].c}">${header(homeBtn)}
        <div class="live-head"><div><div class="muted" style="font-weight:700">Manche ${v.round} · ${LEVELS[v.level]} · code ${esc(code)}</div><h2 style="font-size:clamp(30px,4vw,48px);color:var(--accent)">${esc(INFO[v.game].name)}</h2></div>
        <div class="big-time" id="tmr"></div></div>
        <div class="board" id="board"></div>
        <button class="btn" id="stop" style="align-self:flex-start">Terminer la manche</button></div>`);
      document.getElementById("stop").onclick = () => c.send({ t: "stop" });
      const tick = () => {
        const now = Date.now() + c.clock;
        const el = document.getElementById("tmr");
        if (!el) return;
        const sv = hostUi.view || v;
        if (sv.phase === "countdown") el.textContent = `Départ ${Math.max(1, Math.ceil((sv.startAt - now) / 1000))}`;
        else el.textContent = fmt(Math.max(0, (sv.endsAt - now) / 1000));
      };
      tick();
      ticker = setInterval(tick, 250);
    } else if (v.phase === "results") {
      const last = v.last || [];
      const pod = [last[1], last[0], last[2]];
      const cls = ["p2", "p1", "p3"];
      const num = [2, 1, 3];
      view(`<div class="wrap wide" style="--accent:${INFO[v.game].c}">${header(homeBtn)}
        <h2 style="font-size:clamp(30px,4vw,48px);text-align:center">${esc(INFO[v.game].name)} · ${LEVELS[v.level]}</h2>
        <div class="podium" style="max-width:760px;width:100%;margin:0 auto">${pod.map((p, i) => p && p.played ? `<div class="pod ${cls[i]}"><div class="n">${num[i]}</div><div class="p">${esc(p.pseudo)}</div><div class="small">${esc(p.label)}</div></div>` : `<div class="pod" style="background:transparent"></div>`).join("")}</div>
        <div class="host" style="grid-template-columns:repeat(2,minmax(0,1fr))">
          <div class="panel"><h2>Cette manche</h2><table class="rank"><tr><th>#</th><th>Pseudo</th><th>Résultat</th><th class="r">Pts</th></tr>${last.map((r) => `<tr><td>${r.rank}</td><td>${esc(r.pseudo)}</td><td>${esc(r.label)}</td><td class="r">+${r.points}</td></tr>`).join("")}</table></div>
          <div class="panel"><h2>Classement général</h2><table class="rank"><tr><th>#</th><th>Pseudo</th><th class="r">Points</th></tr>${(v.general || []).map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.pseudo)}</td><td class="r">${r.total}</td></tr>`).join("")}</table></div>
        </div>
        <div class="row" style="max-width:500px"><button class="btn primary big" id="nxt">Manche suivante</button></div></div>`);
      document.getElementById("nxt").onclick = () => c.send({ t: "lobby" });
    }
  }

  const ROW_H = 58;
  function updateHost(v, c) {
    hostUi.view = v;
    if (v.phase === "lobby") {
      const chips = document.getElementById("chips");
      if (!chips) return;
      document.getElementById("cnt").textContent = v.count;
      const list = v.all || [];
      chips.innerHTML = list.length ? list.map((p) => `<span class="chip">${esc(p.pseudo)}<button data-id="${esc(p.id)}" aria-label="Retirer ${esc(p.pseudo)}">×</button></span>`).join("") : `<span class="empty">En attente des premiers joueurs…</span>`;
      chips.querySelectorAll("button").forEach((b) => { b.onclick = () => c.send({ t: "kick", id: b.dataset.id }); });
    } else if (v.phase === "countdown" || v.phase === "live") {
      const board = document.getElementById("board");
      if (!board) return;
      const list = v.all || [];
      const max = Math.max(1, ...list.map((p) => p.score));
      board.style.height = list.length * ROW_H + "px";
      const seen = new Set();
      list.forEach((p, i) => {
        seen.add(p.id);
        let row = board.querySelector(`[data-id="${CSS.escape(p.id)}"]`);
        if (!row) {
          row = document.createElement("div");
          row.className = "lrow";
          row.dataset.id = p.id;
          row.innerHTML = `<div class="bar"></div><span class="rk"></span><span class="nm"></span><span class="val"></span>`;
          board.appendChild(row);
        }
        row.style.transform = `translateY(${i * ROW_H}px)`;
        row.querySelector(".rk").textContent = i + 1;
        row.querySelector(".nm").textContent = p.pseudo;
        row.querySelector(".val").textContent = p.label ? fr(p.label) : "…";
        row.querySelector(".bar").style.width = (p.score / max) * 100 + "%";
        row.classList.toggle("done", !!p.done);
      });
      board.querySelectorAll(".lrow").forEach((r) => { if (!seen.has(r.dataset.id)) r.remove(); });
    }
  }

  /* ---------- Mentions légales ---------- */
  function legal() {
    leave();
    view(`<div class="wrap narrow">${header(homeBtn)}<h2 style="font-size:30px">Mentions légales</h2>
      <div class="prose">
      <p><b>Éditeur.</b> MEMORALL SAS, SIREN 943 720 250, 3 rue Cassette, 75006 Paris. Directeur de la publication : Florian Manicardi. Contact : contact@memorall.fr</p>
      <p><b>Hébergement.</b> Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis.</p>
      <p><b>Données.</b> Aucun compte n'est demandé. Seul le pseudo que vous choisissez est utilisé, pour afficher le classement. Une salle et ses pseudos sont effacés au bout de 24 heures d'inactivité. Les pseudos enregistrés au classement général y restent affichés. Votre navigateur conserve votre dernier pseudo, vos records personnels et votre réglage du son.</p>
      <p>N'utilisez pas votre nom complet comme pseudo. Pour faire retirer un pseudo du classement, écrivez à l'adresse de contact.</p>
      </div>${footer}</div>`);
  }

  /* ---------- Fond étoilé ---------- */
  (function stars() {
    const cv = document.getElementById("stars");
    const ctx = cv.getContext("2d");
    let W, H, pts;
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 16000);
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.6 + 0.2 }));
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => { ctx.fillStyle = `rgba(210,225,255,${p.a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
    }
    addEventListener("resize", size);
    size();
  })();

  /* ---------- Démarrage ---------- */
  const salle = cleanCode(qs.get("salle") || "");
  const animer = cleanCode(qs.get("animer") || "");
  if (animer) openHost(animer);
  else if (salle) joinForm(salle);
  else home();
})();
