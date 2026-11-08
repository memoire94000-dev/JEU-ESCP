/** Nettoyage des pseudos et bornes des scores, communs aux salles et aux classements. */

const BLOCKED = new Set([
  "pute", "putes", "salope", "salopes", "connard", "connards", "connasse", "encule", "enculee", "enculer",
  "merde", "nique", "ntm", "fdp", "batard", "negro", "negre", "nazi", "hitler", "bite", "couille", "couilles",
]);

export function cleanPseudo(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const text = raw
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff<>&"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16)
    .trim();
  const words = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9]+/);
  return words.some((w) => BLOCKED.has(w)) ? "" : text;
}

export const GAME_CAPS: Record<string, number> = { dates: 5000, escape: 7000, snake: 6000, clic: 12000 };
