/**
 * Uzbekistan-specific search normalization.
 * Users type the same name three ways: "лагман" (Cyrillic), "lagman" (Latin),
 * "lag'mon" (Latin with apostrophe letters). We index a normalized form of every
 * name in BOTH scripts inside Restaurant.searchText and query with the same
 * normalizer, so pg_trgm matches across scripts.
 */

const CYR_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "", ь: "", ы: "i", э: "e", ю: "yu", я: "ya",
  ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

/** Fold every apostrophe variant used for oʻ/gʻ and drop it: o' oʻ o` ’ ʼ → plain letter. */
const APOSTROPHES = /[\u2018\u2019\u02BB\u02BC\u0060\u00B4']/g;

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .split("")
    .map((ch) => CYR_TO_LAT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build the searchText document for a restaurant from all its names + dish names. */
export function buildSearchText(parts: (string | null | undefined)[]): string {
  const seen = new Set<string>();
  for (const p of parts) {
    if (!p) continue;
    seen.add(normalize(p));
    seen.add(p.toLowerCase().replace(APOSTROPHES, "")); // keep original script too
  }
  return [...seen].join(" ");
}
