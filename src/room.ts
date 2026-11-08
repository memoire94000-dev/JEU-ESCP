/**
 * Une salle de compétition = un Durable Object.
 * Il possède les connexions et l'état ; les règles sont dans ./logic.js.
 * Le même objet, sous le nom réservé `__records`, tient le classement général.
 */

import { DurableObject } from "cloudflare:workers";

import type { Env } from "./env";
import * as logic from "./logic.js";
import { GAME_CAPS, cleanPseudo } from "./names";
import { parseClientMessage } from "./protocol";

interface Game {
  status: "waiting" | "playing" | "over";
  seats: string[];
  state: unknown;
  result: unknown;
}
type Conns = Record<string, string>;
interface Out {
  to: string | string[];
  data: unknown;
}
type Dispatchable = Out[] | { out?: Out[]; wakeIn?: number | null } | void;
interface Clock {
  deadline?: number;
  expired?: boolean;
  host?: string | null;
}
interface RecordRow {
  pseudo: string;
  score: number;
  label: string;
  at: number;
}

export function freshGame(): Game {
  return { status: "waiting", seats: [], state: null, result: null };
}

export function resolveMeta(raw: unknown): { game: string; minPlayers: number; maxPlayers: number } {
  const meta = (raw ?? {}) as Record<string, unknown>;
  const seats = (value: unknown, fallback: number): number =>
    Number.isInteger(value) && (value as number) >= 1 ? (value as number) : fallback;
  const minPlayers = seats(meta.minPlayers, 1);
  return {
    game: typeof meta.game === "string" ? meta.game : "Game",
    minPlayers,
    maxPlayers: Math.max(minPlayers, seats(meta.maxPlayers, minPlayers)),
  };
}

const META = resolveMeta(logic.meta);
const PING = "__ping";
const PONG = "__pong";
const RECORDS_KEPT = 20;
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

export class Room extends DurableObject<Env> {
  private lastPost = new Map<string, number>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
  }

  private async load(): Promise<{ game: Game; conns: Conns }> {
    const [game, conns] = await Promise.all([
      this.ctx.storage.get<Game>("game"),
      this.ctx.storage.get<Conns>("conns"),
    ]);
    return { game: game ?? freshGame(), conns: conns ?? {} };
  }

  private async save(game: Game, conns: Conns): Promise<void> {
    await this.ctx.storage.put({ game, conns });
  }

  /** Vue de chacun. `only` limite l'envoi à certains joueurs (mise à jour de score). */
  private broadcast(game: Game, conns: Conns, only?: Set<string>): Out[] {
    const connected = Object.keys(conns).length;
    const now = Date.now();
    return Object.entries(conns)
      .filter(([, playerId]) => !only || only.has(playerId))
      .map(([connId, playerId]) => ({
        to: connId,
        data: {
          type: "state",
          status: game.status,
          you: playerId,
          connected,
          now,
          view: game.state ? logic.viewFor(game.state, playerId) : null,
          meta: META,
        },
      }));
  }

  private error(connId: string, error: string): Out[] {
    return [{ to: connId, data: { type: "error", error } }];
  }

  override async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).pathname === "/api/records") return this.records(request);
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected a websocket upgrade", { status: 426 });
    }
    const pair = new WebSocketPair();
    const server = pair[1]!;
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ connId: crypto.randomUUID().slice(0, 8) });
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  private async records(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
    const key = (g: string, l: number) => `records:${g}:${l}`;

    if (request.method === "GET") {
      const g = url.searchParams.get("g") ?? "";
      const l = Number(url.searchParams.get("l"));
      if (!(g in GAME_CAPS) || ![0, 1, 2, 3].includes(l)) return reply({ error: "paramètres invalides" }, 400);
      return reply({ list: (await this.ctx.storage.get<RecordRow[]>(key(g, l))) ?? [] });
    }
    if (request.method !== "POST") return reply({ error: "méthode non prise en charge" }, 405);

    const ip = request.headers.get("CF-Connecting-IP") ?? "local";
    const now = Date.now();
    if (now - (this.lastPost.get(ip) ?? 0) < 1500) return reply({ error: "trop rapide" }, 429);
    this.lastPost.set(ip, now);

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return reply({ error: "requête invalide" }, 400);
    }
    const g = String(body.g ?? "");
    const l = Number(body.l);
    const score = Number(body.score);
    const label = typeof body.label === "string" ? body.label.slice(0, 40) : "";
    const pseudo = cleanPseudo(body.pseudo);
    const cap = GAME_CAPS[g];
    if (cap === undefined || ![0, 1, 2, 3].includes(l) || !pseudo || !Number.isFinite(score) || score <= 0 || score > cap) {
      return reply({ error: "résultat refusé" }, 400);
    }
    const list = ((await this.ctx.storage.get<RecordRow[]>(key(g, l))) ?? []).slice();
    const row: RecordRow = { pseudo, score: Math.round(score), label, at: now };
    list.push(row);
    list.sort((a, b) => b.score - a.score || a.at - b.at);
    const kept = list.slice(0, RECORDS_KEPT);
    await this.ctx.storage.put(key(g, l), kept);
    return reply({ list: kept, rank: kept.indexOf(row) + 1 });
  }

  private connIdOf(ws: WebSocket): string | undefined {
    const att = ws.deserializeAttachment() as { connId?: string } | null;
    return att?.connId;
  }

  override async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const connId = this.connIdOf(ws);
    if (!connId) return;
    try {
      await this.dispatch(await this.onMessage(connId, raw));
    } catch (err) {
      console.error("room message failed:", err instanceof Error ? err.stack : String(err));
      try {
        ws.send(JSON.stringify({ type: "error", error: "server error" }));
      } catch {
        /* socket déjà fermée */
      }
    }
  }

  override async webSocketClose(ws: WebSocket): Promise<void> {
    const connId = this.connIdOf(ws);
    if (!connId) return;
    const { game, conns } = await this.load();
    if (conns[connId] === undefined) return;
    delete conns[connId];
    await this.save(game, conns);
    await this.dispatch(this.broadcast(game, conns, this.hostOnly(game)));
  }

  override async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws);
  }

  override async alarm(): Promise<void> {
    try {
      const { game, conns } = await this.load();
      if (!game.state) return;
      const state = logic.applyAction(game.state, "__system", { t: "tick", at: Date.now() });
      if ((state as Clock).expired) {
        for (const ws of this.ctx.getWebSockets()) {
          try {
            ws.close(1000, "expired");
          } catch {
            /* déjà fermée */
          }
        }
        await this.ctx.storage.deleteAll();
        return;
      }
      game.state = state;
      await this.save(game, conns);
      await this.dispatch(this.broadcast(game, conns));
      await this.scheduleClock(game);
    } catch (err) {
      console.error("room alarm failed:", err instanceof Error ? err.stack : String(err));
    }
  }

  private async scheduleClock(game: Game): Promise<void> {
    const deadline = (game.state as Clock | null)?.deadline;
    if (deadline && deadline > Date.now() - 2000) {
      const current = await this.ctx.storage.getAlarm();
      if (current !== deadline) await this.ctx.storage.setAlarm(Math.max(deadline, Date.now() + 50));
    }
  }

  private hostOnly(game: Game): Set<string> {
    const host = (game.state as Clock | null)?.host;
    return new Set(host ? [host] : []);
  }

  private async onMessage(connId: string, raw: string | ArrayBuffer): Promise<Dispatchable> {
    const parsed = parseClientMessage(raw);
    if (!parsed.ok) return this.error(connId, parsed.error);
    const msg = parsed.msg;
    const { game, conns } = await this.load();

    if (msg.type === "join") {
      if (msg.playerId.startsWith("__")) return this.error(connId, "identifiant invalide");
      conns[connId] = msg.playerId;
      if (!game.seats.includes(msg.playerId) && game.seats.length < META.maxPlayers) {
        game.seats.push(msg.playerId);
      }
      if (game.status === "waiting" && game.seats.length >= META.minPlayers) {
        game.state = logic.setup(game.seats);
        game.status = "playing";
      }
      await this.save(game, conns);
      return this.broadcast(game, conns, new Set([msg.playerId, ...this.hostOnly(game)]));
    }

    const playerId = conns[connId];
    if (!playerId) return this.error(connId, "join first");

    if (msg.type !== "action") return this.error(connId, "action non disponible");
    if (game.status !== "playing") return this.error(connId, "salle non ouverte");
    if (!game.seats.includes(playerId)) return this.error(connId, "salle complète");

    const action: Record<string, unknown> = {
      ...((typeof msg.action === "object" && msg.action) || {}),
      at: Date.now(),
    };
    if (action.t === "hello") {
      action.pseudo = cleanPseudo(action.pseudo);
    }
    const verdict = logic.validateAction(game.state, playerId, action);
    if (!verdict.ok) return this.error(connId, verdict.error ?? "action invalide");

    const before = game.state;
    game.state = logic.applyAction(game.state, playerId, action);
    await this.save(game, conns);
    await this.scheduleClock(game);

    const phaseChanged = (before as { phase?: string }).phase !== (game.state as { phase?: string }).phase;
    if (action.t === "report" && !phaseChanged) {
      return this.broadcast(game, conns, new Set([playerId, ...this.hostOnly(game)]));
    }
    return this.broadcast(game, conns);
  }

  private async dispatch(res: Dispatchable): Promise<void> {
    if (!res) return;
    const msgs = Array.isArray(res) ? res : (res.out ?? []);
    if (!msgs.length) return;
    const byId = new Map<string, WebSocket>();
    for (const s of this.ctx.getWebSockets()) {
      const id = this.connIdOf(s);
      if (id) byId.set(id, s);
    }
    for (const m of msgs) {
      if (!m) continue;
      const data = typeof m.data === "string" ? m.data : JSON.stringify(m.data);
      const ids = Array.isArray(m.to) ? m.to : [m.to];
      for (const id of ids) {
        try {
          byId.get(id)?.send(data);
        } catch {
          /* connexion fermée pendant l'envoi */
        }
      }
    }
  }
}
