import type { Env } from "./env";
export declare class DscgSalon {
  constructor(state: DurableObjectState, env: Env);
  fetch(req: Request): Promise<Response> | Response;
  alarm(): Promise<void>;
}
export declare class DscgRecords {
  constructor(state: DurableObjectState);
  fetch(req: Request): Promise<Response>;
}
export declare function dscgFetch(req: Request, env: Env): Promise<Response> | Response | null;
