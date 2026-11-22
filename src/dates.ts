import type { Lang } from "./locales.ts";

/** "2026-02" → "Febrero 2026" (es) or "February 2026" (en); "2026" → "2026". */
export function formatDate(value: string, lang: Lang): string {
  const [year, month] = value.split("-").map(Number);
  if (!month) return String(year);
  const name = new Intl.DateTimeFormat(lang, { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year ?? 0, month - 1, 1)),
  );
  return `${name.charAt(0).toLocaleUpperCase(lang)}${name.slice(1)} ${year}`;
}

/** A start–end range, a single date when only one is known, or "" when neither is. */
export function formatPeriod(
  start: string | undefined,
  end: string | undefined,
  lang: Lang,
  present: string,
): string {
  const from = start === undefined ? undefined : formatDate(start, lang);
  const to = end === undefined ? undefined : end === "present" ? present : formatDate(end, lang);
  if (from && to) return `${from} – ${to}`;
  return from ?? to ?? "";
}
