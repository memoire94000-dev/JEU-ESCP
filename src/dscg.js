/* Défi DSCG | Memorall, servi sous /dscg
   Serveur temps réel : une salle (Durable Object) par code de salon,
   et un registre des records en ligne. */

const JSON_HDR = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: JSON_HDR });
const JEUX = ['qcm', 'escape', 'reflexe'];
const UNE_JOURNEE = 24 * 3600 * 1000;

const chemin = p => String(p || '').split('/').filter(Boolean);
const cloner = v => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
function lireA(arbre, ks) { let n = arbre; for (const k of ks) { if (n == null || typeof n !== 'object') return null; n = n[k]; } return n === undefined ? null : n; }
function ecrireA(arbre, ks, v) {
  if (!ks.length) return v && typeof v === 'object' ? cloner(v) : {};
  let n = arbre;
  for (let i = 0; i < ks.length - 1; i++) { if (n[ks[i]] == null || typeof n[ks[i]] !== 'object') n[ks[i]] = {}; n = n[ks[i]]; }
  const d = ks[ks.length - 1];
  if (v === null || v === undefined) delete n[d]; else n[d] = cloner(v);
  return arbre;
}
function nettoyer(n) {
  if (n && typeof n === 'object') for (const k of Object.keys(n)) { n[k] = nettoyer(n[k]); if (n[k] === null || (typeof n[k] === 'object' && !Object.keys(n[k]).length)) delete n[k]; }
  return n;
}
function horodater(v, t) {
  if (v && typeof v === 'object') {
    if (v['.sv'] === 'timestamp') return t;
    for (const k of Object.keys(v)) v[k] = horodater(v[k], t);
  }
  return v;
}
const lies = (a, b) => { const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) if (a[i] !== b[i]) return false; return true; };
const cleValide = k => typeof k === 'string' && k.length > 0 && k.length <= 64 && !/[.#$\[\]\/]/.test(k);

export class DscgSalon {
  constructor(state, env) {
    this.state = state; this.env = env;
    this.clients = new Set();
    this.arbre = {}; this.hote = null; this.secrets = {};
    state.blockConcurrencyWhile(async () => {
      this.arbre = (await state.storage.get('arbre')) || {};
      this.hote = (await state.storage.get('hote')) || null;
      this.secrets = (await state.storage.get('secrets')) || {};
    });
  }

  async fetch(req) {
    const url = new URL(req.url);
    if (req.headers.get('Upgrade') === 'websocket') return this.connecter(url);
    if (url.pathname.endsWith('/lire')) return json({ v: lireA(this.arbre, chemin(url.searchParams.get('p'))) });
    return json({ erreur: 'inconnu' }, 404);
  }

  connecter(url) {
    const id = url.searchParams.get('id') || '', secret = url.searchParams.get('secret') || '';
    if (!cleValide(id) || secret.length < 16) return new Response('identifiant invalide', { status: 400 });
    if (this.secrets[id] && this.secrets[id] !== secret) return new Response('identifiant déjà utilisé', { status: 403 });
    if (!this.secrets[id]) { this.secrets[id] = secret; this.state.storage.put('secrets', this.secrets); }
    const [cote, serveur] = Object.values(new WebSocketPair());
    serveur.accept();
    const c = { ws: serveur, id, abos: new Map(), depart: [] };
    this.clients.add(c);
    serveur.addEventListener('message', e => this.message(c, e.data));
    const fin = () => {
      if (!this.clients.has(c)) return;
      this.clients.delete(c);
      if (c.depart.length) this.ecrire(c.id, c.depart.map(d => ({ p: d.p, v: d.v })), true);
    };
    serveur.addEventListener('close', fin);
    serveur.addEventListener('error', fin);
    serveur.send(JSON.stringify({ t: 'bonjour', now: Date.now() }));
    return new Response(null, { status: 101, webSocket: cote });
  }

  envoyer(c, m) { try { c.ws.send(JSON.stringify(m)); } catch (e) { } }

  message(c, brut) {
    if (typeof brut !== 'string' || brut.length > 64000) return;
    let m; try { m = JSON.parse(brut); } catch (e) { return; }
    const r = m.r;
    switch (m.t) {
      case 'ping': return this.envoyer(c, { t: 'pong', r, now: Date.now() });
      case 'abo': {
        const p = chemin(m.p).join('/');
        const v = lireA(this.arbre, chemin(p)), s = JSON.stringify(v);
        c.abos.set(p, s);
        return this.envoyer(c, { t: 'val', p, v });
      }
      case 'desabo': c.abos.delete(chemin(m.p).join('/')); return;
      case 'lire': return this.envoyer(c, { t: 'res', r, v: lireA(this.arbre, chemin(m.p)) });
      case 'set': case 'remove': case 'update': {
        const base = chemin(m.p);
        let ecr;
        if (m.t === 'update') {
          if (!m.v || typeof m.v !== 'object') return this.envoyer(c, { t: 'res', r, err: 'données invalides' });
          ecr = Object.entries(m.v).map(([k, v]) => ({ p: base.concat(chemin(k)), v }));
        } else ecr = [{ p: base, v: m.t === 'remove' ? null : m.v }];
        const err = this.ecrire(c.id, ecr);
        return this.envoyer(c, { t: 'res', r, err: err || undefined });
      }
      case 'depart': {
        c.depart = c.depart.filter(d => d.p.join('/') !== chemin(m.p).join('/'));
        c.depart.push({ p: chemin(m.p), v: m.v });
        return this.envoyer(c, { t: 'res', r });
      }
    }
  }

  autorise(id, ks, v) {
    if (!this.hote) return ks.length === 0 && v && v.hote === id;
    if (id === this.hote) return true;
    if (ks[0] === 'joueurs' && ks[1] === id && ks.length >= 2) return !lireA(this.arbre, ['exclus', id]);
    if (ks[0] === 'parties' && ks[2] === 'res' && ks[3] === id && ks.length >= 4) return true;
    return false;
  }

  ecrire(id, ecritures, silencieux) {
    const t = Date.now();
    for (const e of ecritures) {
      if (e.p.length > 8 || !e.p.every(cleValide)) return 'chemin invalide';
      e.v = horodater(cloner(e.v), t);
      if (!this.autorise(id, e.p, e.v)) return 'opération refusée';
    }
    let essai = cloner(this.arbre);
    let racineVide = false;
    for (const e of ecritures) {
      if (!e.p.length && e.v === null) racineVide = true;
      essai = ecrireA(essai, e.p, e.v);
    }
    nettoyer(essai);
    if (id !== this.hote || !this.hote) {
      const j = lireA(essai, ['joueurs', id]);
      if (j && (typeof j.pseudo !== 'string' || j.pseudo.length > 20)) return 'pseudo invalide';
      for (const [, partie] of Object.entries(essai.parties || {})) {
        const res = partie && partie.res && partie.res[id];
        if (res && (typeof res.p !== 'string' || res.p.length > 20 || typeof res.k !== 'number')) return 'score invalide';
      }
    }
    if (!this.hote) this.hote = ecritures[0].v.hote;
    this.arbre = essai;
    if (racineVide) { this.arbre = {}; this.hote = null; this.secrets = {}; }
    this.diffuser(ecritures.map(e => e.p));
    this.sauver(racineVide);
    return null;
  }

  diffuser(chemins) {
    for (const c of this.clients) {
      for (const [p, avant] of c.abos) {
        const ks = chemin(p);
        if (!chemins.some(w => lies(w, ks))) continue;
        const v = lireA(this.arbre, ks), s = JSON.stringify(v);
        if (s === avant) continue;
        c.abos.set(p, s);
        this.envoyer(c, { t: 'val', p, v });
      }
    }
  }

  sauver(effacer) {
    if (effacer) { clearTimeout(this.minuteur); this.minuteur = null; this.state.storage.deleteAll(); return; }
    if (this.minuteur) return;
    this.minuteur = setTimeout(async () => {
      this.minuteur = null;
      await this.state.storage.put({ arbre: this.arbre, hote: this.hote, secrets: this.secrets });
      await this.state.storage.setAlarm(Date.now() + UNE_JOURNEE);
    }, 1500);
  }

  async alarm() {
    if (this.clients.size) { await this.state.storage.setAlarm(Date.now() + UNE_JOURNEE); return; }
    await this.state.storage.deleteAll();
    this.arbre = {}; this.hote = null; this.secrets = {};
  }
}

export class DscgRecords {
  constructor(state) { this.state = state; }
  async fetch(req) {
    const url = new URL(req.url);
    const [jeu, niv] = url.pathname.split('/').slice(-2);
    const cle = `rec:${jeu}:${niv}`;
    let liste = (await this.state.storage.get(cle)) || [];
    if (req.method === 'POST') {
      let b; try { b = await req.json(); } catch (e) { return json({ erreur: 'données invalides' }, 400); }
      const p = String(b.p || '').trim().slice(0, 20), k = Number(b.k), x = String(b.x || '').slice(0, 60);
      if (!p || !Number.isFinite(k) || k < 0 || k > 2e9) return json({ erreur: 'score invalide' }, 400);
      liste.push({ p, k, x, t: Date.now() });
      liste.sort((a, b) => b.k - a.k); liste = liste.slice(0, 50);
      await this.state.storage.put(cle, liste);
      return json({ ok: true });
    }
    const n = Math.min(50, Math.max(1, Number(url.searchParams.get('n')) || 10));
    return json({ v: liste.slice(0, n) });
  }
}

const PREFIXE = '/dscg';

/* Rend une réponse pour les routes /dscg/api/… et /dscg/ws/…, sinon null. */
export function dscgFetch(req, env) {
  const url = new URL(req.url);
  if (!url.pathname.startsWith(PREFIXE + '/api/') && !url.pathname.startsWith(PREFIXE + '/ws/')) return null;
  const chemin = url.pathname.slice(PREFIXE.length);
  if (chemin === '/api/ping') return json({ service: 'defi-dscg', now: Date.now() });
  let m = chemin.match(/^\/ws\/(\d{4})$/);
  if (m) return env.DSCG_SALONS.get(env.DSCG_SALONS.idFromName(m[1])).fetch(req);
  m = chemin.match(/^\/api\/salon\/(\d{4})$/);
  if (m) return env.DSCG_SALONS.get(env.DSCG_SALONS.idFromName(m[1])).fetch(new Request(new URL(`/lire?${url.searchParams}`, req.url)));
  m = chemin.match(/^\/api\/records\/([a-z]+)\/([1-4])$/);
  if (m && JEUX.includes(m[1])) return env.DSCG_RECORDS.get(env.DSCG_RECORDS.idFromName('records')).fetch(req);
  return json({ erreur: 'introuvable' }, 404);
}
