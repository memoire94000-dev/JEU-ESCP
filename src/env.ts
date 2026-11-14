export interface Env {
  ASSETS: Fetcher;
  ROOMS: DurableObjectNamespace;
  DSCG_SALONS: DurableObjectNamespace;
  DSCG_RECORDS: DurableObjectNamespace;
  HF_ENV?: string;
  APP_SLUG?: string;
}
