import type { Lang } from "./locales.ts";

export type MonthStyle = "long" | "short";

/** "2026-02" → "Febrero 2026" (es) or "February 2026" (en), or "Feb 2026" with the short style; "2026" → "2026". */
export function formatDate(value: string, lang: Lang, month: MonthStyle = "long"): string {
  const [year, monthNumber] = value.split("-").map(Number);
  if (!monthNumber) return String(year);
  const name = new Intl.DateTimeFormat(lang, { month, timeZone: "UTC" }).format(
    new Date(Date.UTC(year ?? 0, monthNumber - 1, 1)),
  );
  return `${name.charAt(0).toLocaleUpperCase(lang)}${name.slice(1)} ${year}`;
}

/** A start–end range, a single date when only one is known, or "" when neither is. */
export function formatPeriod(
  start: string | undefined,
  end: string | undefined,
  lang: Lang,
  present: string,
  month: MonthStyle = "long",
): string {
  const from = start === undefined ? undefined : formatDate(start, lang, month);
  const to = end === undefined ? undefined : end === "present" ? present : formatDate(end, lang, month);
  if (from && to) return `${from} – ${to}`;
  return from ?? to ?? "";
}
