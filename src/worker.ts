/**
 * Routage : `/ws/<salle>` vers la salle, `/api/records` vers le classement.
 * Les fichiers statiques sont servis avant ce code.
 */

import type { Env } from "./env";
import { Room } from "./room";

export { Room };

const WS_PREFIX = "/ws";
const ROOM_RE = /^[A-Za-z0-9_-]{1,64}$/;
const DEFAULT_ROOM = "main";
const RECORDS_ROOM = "__records";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/records") {
      return env.ROOMS.get(env.ROOMS.idFromName(RECORDS_ROOM)).fetch(request);
    }

    if (url.pathname === WS_PREFIX || url.pathname.startsWith(WS_PREFIX + "/")) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("expected a websocket upgrade", { status: 426 });
      }
      const raw = url.pathname.slice(WS_PREFIX.length).replace(/^\/+/, "");
      const room = raw === "" ? DEFAULT_ROOM : raw;
      if (!ROOM_RE.test(room) || room.startsWith("__")) {
        return new Response("invalid room name", { status: 400 });
      }
      return env.ROOMS.get(env.ROOMS.idFromName(room)).fetch(request);
    }

    if (request.method === "GET" && request.headers.get("Accept")?.includes("text/html")) {
      const home = /^\/imrt(\/|$)/.test(url.pathname) ? "/imrt" : "/";
      return env.ASSETS.fetch(new Request(new URL(home, url), request));
    }
    return new Response("not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
