/**
 * Règles d'une salle de compétition en direct.
 * L'heure (`at`) est ajoutée par le serveur à chaque action, jamais par le téléphone.
 */

export const meta = { game: "Arène Memorall", minPlayers: 1, maxPlayers: 250 };

const GAMES = ["dates", "escape", "snake", "clic"];
const MAX_SCORE = { dates: 5000, escape: 7000, snake: 6000, clic: 12000 };
const DURATION = {
  dates: [300, 240, 180, 130],
  escape: [480, 600, 720, 900],
  snake: [170, 170, 190, 190],
  clic: [100, 100, 100, 100],
};
const COUNTDOWN = 5000;
const DAY = 86400000;
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export function setup() {
  return {
    host: null, phase: "lobby", round: 0, game: null, level: 0, seed: 0,
    startAt: 0, endsAt: 0, deadline: 0, expireAt: 0,
    players: {}, banned: {}, last: [],
  };
}

const isObj = (a) => a && typeof a === "object" && !Array.isArray(a);

export function validateAction(s, id, a) {
  if (!isObj(a) || typeof a.t !== "string") return { ok: false, error: "action invalide" };
  const isHost = s.host === id;
  switch (a.t) {
    case "tick":
      return id === "__system" ? { ok: true } : { ok: false, error: "réservé" };
    case "create":
      return !s.host || isHost ? { ok: true } : { ok: false, error: "salle déjà prise" };
    case "hello":
      if (!s.host) return { ok: false, error: "salle introuvable" };
      if (isHost) return { ok: false, error: "tu animes cette salle" };
      if (s.banned[id]) return { ok: false, error: "retiré par l'animateur" };
      if (typeof a.pseudo !== "string" || !a.pseudo.trim()) return { ok: false, error: "pseudo requis" };
      return { ok: true };
    case "start":
      if (!isHost) return { ok: false, error: "réservé à l'animateur" };
      if (s.phase !== "lobby" && s.phase !== "results") return { ok: false, error: "manche en cours" };
      if (!GAMES.includes(a.game)) return { ok: false, error: "jeu inconnu" };
      if (![0, 1, 2, 3].includes(a.level)) return { ok: false, error: "niveau inconnu" };
      return { ok: true };
    case "stop":
      if (!isHost) return { ok: false, error: "réservé à l'animateur" };
      return s.phase === "live" || s.phase === "countdown" ? { ok: true } : { ok: false, error: "aucune manche" };
    case "lobby":
    case "clear":
      if (!isHost) return { ok: false, error: "réservé à l'animateur" };
      return s.phase === "live" || s.phase === "countdown" ? { ok: false, error: "manche en cours" } : { ok: true };
    case "kick":
      return isHost && typeof a.id === "string" && s.players[a.id] ? { ok: true } : { ok: false, error: "joueur inconnu" };
    case "report": {
      const p = s.players[id];
      if (!p) return { ok: false, error: "inconnu" };
      if (s.phase !== "live") return { ok: false, error: "pas de manche" };
      if (a.round !== s.round || !p.playing) return { ok: false, error: "autre manche" };
      if (!Number.isFinite(a.score) || a.score < 0 || a.score > MAX_SCORE[s.game]) return { ok: false, error: "score invalide" };
      if (typeof a.label !== "string" || a.label.length > 40) return { ok: false, error: "résultat invalide" };
      return { ok: true };
    }
    default:
      return { ok: false, error: "action inconnue" };
  }
}

function norm(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function uniquePseudo(s, id, pseudo) {
  const taken = new Set(Object.entries(s.players).filter(([k]) => k !== id).map(([, p]) => norm(p.pseudo)));
  if (!taken.has(norm(pseudo))) return pseudo;
  for (let i = 2; i < 300; i++) {
    const c = `${pseudo.slice(0, 13)} ${i}`;
    if (!taken.has(norm(c))) return c;
  }
  return pseudo;
}

const ranked = (players) =>
  Object.entries(players)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => b.score - a.score || (a.doneAt || 9e15) - (b.doneAt || 9e15) || a.pseudo.localeCompare(b.pseudo));

function finish(s, at) {
  const list = ranked(s.players);
  const players = { ...s.players };
  let awarded = 0;
  const last = list.map((p, i) => {
    const played = p.label !== "";
    const pts = played ? POINTS[awarded] || 0 : 0;
    if (played) awarded++;
    players[p.id] = { ...players[p.id], total: p.total + pts, playing: false };
    return { id: p.id, pseudo: p.pseudo, score: p.score, label: p.label || "absent", rank: i + 1, points: pts, played };
  });
  return { ...s, phase: "results", players, last, deadline: at + DAY, expireAt: at + DAY };
}

export function applyAction(s, id, a) {
  const at = a.at || 0;
  switch (a.t) {
    case "tick": {
      if (s.expireAt && at >= s.expireAt) return { ...s, expired: true };
      if (s.phase === "countdown" && at >= s.startAt - 100) return { ...s, phase: "live", deadline: s.endsAt };
      if (s.phase === "live" && at >= s.endsAt - 100) return finish(s, at);
      return s;
    }
    case "create":
      return { ...s, host: id, edition: a.edition === "imrt" ? "imrt" : "escp", expireAt: at + DAY, deadline: s.deadline || at + DAY };
    case "hello": {
      const prev = s.players[id];
      const pseudo = uniquePseudo(s, id, a.pseudo.trim().slice(0, 16));
      const inRound = s.phase === "lobby" || s.phase === "results" ? false : !!prev?.playing;
      return {
        ...s,
        players: {
          ...s.players,
          [id]: prev ? { ...prev, pseudo, playing: inRound } : { pseudo, total: 0, score: 0, label: "", done: false, doneAt: 0, playing: false },
        },
      };
    }
    case "start": {
      const players = {};
      for (const [k, p] of Object.entries(s.players)) players[k] = { ...p, score: 0, label: "", done: false, doneAt: 0, playing: true };
      const round = s.round + 1;
      const startAt = at + COUNTDOWN;
      const seed = (Math.floor(at / 7) ^ (round * 2654435761)) >>> 0;
      return {
        ...s, phase: "countdown", round, game: a.game, level: a.level, seed,
        startAt, endsAt: startAt + DURATION[a.game][a.level] * 1000,
        deadline: startAt, expireAt: at + DAY, players, last: [],
      };
    }
    case "stop":
      return finish(s, at);
    case "lobby":
      return { ...s, phase: "lobby", last: [], deadline: at + DAY, expireAt: at + DAY };
    case "clear": {
      const players = {};
      for (const [k, p] of Object.entries(s.players)) players[k] = { ...p, total: 0, score: 0, label: "" };
      return { ...s, players, round: 0, last: [], phase: "lobby" };
    }
    case "kick": {
      const players = { ...s.players };
      delete players[a.id];
      return { ...s, players, banned: { ...s.banned, [a.id]: true } };
    }
    case "report": {
      const p = s.players[id];
      const better = a.score >= p.score;
      const done = p.done || !!a.done;
      const next = {
        ...p,
        score: better ? a.score : p.score,
        label: better ? a.label : p.label,
        done,
        doneAt: done && !p.done ? at : p.doneAt,
      };
      const players = { ...s.players, [id]: next };
      const state = { ...s, players };
      const everyone = Object.values(players).filter((x) => x.playing);
      return everyone.length && everyone.every((x) => x.done) ? finish(state, at) : state;
    }
    default:
      return s;
  }
}

export function isGameOver() {
  return { over: false };
}

export function viewFor(s, id) {
  const list = ranked(s.players).map((p) => ({ id: p.id, pseudo: p.pseudo, score: p.score, label: p.label, done: p.done, total: p.total }));
  const me = s.players[id];
  const isHost = s.host === id;
  const pub = (p) => ({ pseudo: p.pseudo, score: p.score, label: p.label, done: p.done, total: p.total });
  const rank = me ? list.findIndex((p) => p.id === id) + 1 : 0;
  const base = {
    exists: !!s.host,
    edition: s.edition || "escp",
    role: isHost ? "host" : me ? "player" : s.banned[id] ? "banned" : "new",
    phase: s.phase, round: s.round, game: s.game, level: s.level, seed: s.seed,
    startAt: s.startAt, endsAt: s.endsAt, count: list.length,
    me: me ? { pseudo: me.pseudo, score: me.score, label: me.label, total: me.total, done: me.done, playing: me.playing } : null,
    rank,
    top: list.slice(0, 5).map(pub),
  };
  if (isHost) {
    base.all = list.map((p) => ({ ...pub(p), id: p.id }));
    base.last = s.last;
    base.general = list.map((p) => pub(p)).sort((a, b) => b.total - a.total).slice(0, 30);
  } else if (s.phase === "results") {
    base.last = s.last.slice(0, 10).map(({ id: _id, ...r }) => r);
    base.mine = s.last.find((r) => r.id === id) ? (({ id: _id, ...r }) => r)(s.last.find((r) => r.id === id)) : null;
  }
  return base;
}
