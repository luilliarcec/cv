// Turns the CV data into what the page renders: plain values and HTML strings, already localised.
import { join } from "node:path";
import { formatPeriod } from "../../src/dates.ts";
import { toHtml, toPlain, toText } from "../../src/html.ts";
import { type CvData, loadCv } from "../../src/load.ts";
import { LANGS, type Lang } from "../../src/locales.ts";
import type { Edition, Project } from "../../src/schema.ts";
import { DEFAULT_LANG, UI, type Ui } from "./i18n.ts";

let cached: CvData | undefined;
function data(): CvData {
  // Astro runs from the repository root, where data/ lives.
  cached ??= loadCv(join(process.cwd(), "data"));
  return cached;
}

export type Metric = { value: string; label: string };
export type Card = {
  id: string;
  name: string;
  description?: string;
  role?: string;
  period: string;
  highlights: string[];
  metrics: Metric[];
  stack: string[];
};
export type Skill = { name: string; items: string[]; level?: number; rank?: string };
export type Pin = { id: string; label: string; place: string; lat: number; lon: number };

function rank(level: number, ui: Ui): string {
  if (level >= 95) return ui.levels.max;
  if (level >= 88) return ui.levels.elite;
  if (level >= 80) return ui.levels.pro;
  return ui.levels.skilled;
}

/** Path of a language's page relative to the site base: "" for the default language, "es/" for the others. */
export function langPath(lang: Lang): string {
  return lang === DEFAULT_LANG ? "" : `${lang}/`;
}

export function view(lang: Lang) {
  const { contact, site, editions } = data();
  const edition = editions.find((e) => e.lang === lang);
  if (!edition) throw new Error(`no data/cv.${lang}.yaml`);
  const ui = UI[lang];
  const period = (start?: string, end?: string) => formatPeriod(start, end, lang, edition.labels.present, "short");

  const card = (p: Project): Card => ({
    id: p.id,
    name: toText(p.name),
    description: p.description && toText(p.description),
    role: p.role && toText(p.role),
    period: period(p.start, p.end),
    highlights: p.highlights.map(toHtml),
    metrics: (p.metrics ?? []).map((m) => ({ value: toText(m.value), label: toText(m.label) })),
    stack: site.stack[p.id] ?? [],
  });

  const [first, ...others] = edition.experience;
  if (!first) throw new Error("the CV has no experience entries");
  const entry = (e: Edition["experience"][number]) => ({
    id: e.id,
    company: toText(e.company),
    role: toText(e.role),
    location: toText(e.location),
    period: period(e.start, e.end),
    current: e.end === "present",
    summary: e.summary && toHtml(e.summary),
    highlights: (e.highlights ?? []).map(toHtml),
    cards: (e.projects ?? []).map(card),
    stack: site.stack[e.id] ?? [],
  });

  // Names for map pins: the experience entry or project with that id.
  const names = new Map<string, string>();
  for (const e of edition.experience) {
    names.set(e.id, e.company);
    for (const p of e.projects ?? []) names.set(p.id, p.name);
  }
  for (const p of edition.projects) names.set(p.id, p.name);

  const featured = entry(first);
  const pdfUrl = (l: Lang) => `${site.repository}/releases/latest/download/${site.pdfPrefix}-${l.toUpperCase()}.pdf`;
  const pageUrl = (l: Lang) => `${site.url.replace(/\/$/, "")}/${langPath(l)}`;

  return {
    lang,
    ui,
    name: toText(contact.name),
    location: toText(contact.location),
    email: contact.email,
    phone: toText(contact.phone),
    tel: `+${contact.phone.replace(/\D/g, "")}`,
    links: contact.links.map((l) => ({ label: toText(l.label), url: l.url })),
    headline: edition.headline.map(toText),
    intro: toHtml(edition.web.intro),
    description: toPlain(edition.web.intro),
    pitch: toHtml(edition.web.pitch),
    counters: edition.web.counters.map((m) => ({ value: toText(m.value), label: toText(m.label) })),
    ticker: site.ticker,
    featured,
    rewards: featured.cards.flatMap((c) => c.metrics),
    groups: others.filter((e) => e.projects).map(entry),
    chapters: others.filter((e) => !e.projects).map(entry),
    training: edition.education.map((e) => ({
      institution: toText(e.institution),
      degree: toText(e.degree),
      period: period(e.start, e.end),
      current: e.end === "present",
    })),
    side: edition.projects.map(card),
    skills: edition.skills.map((s): Skill => {
      const level = site.levels[s.id];
      return { name: toText(s.name), items: s.items.map(toText), level, rank: level === undefined ? undefined : rank(level, ui) };
    }),
    pins: Object.entries(site.places).map(
      ([id, [lat, lon]]): Pin => ({
        id,
        label: id === "home" ? ui.home : toText(names.get(id) ?? id),
        place: toText(edition.web.places[id] ?? ""),
        lat,
        lon,
      }),
    ),
    pdf: pdfUrl(lang),
    // The page's own language first.
    pdfs: [lang, ...LANGS.filter((l) => l !== lang)].map((l) => ({ lang: l, label: UI[l].langName, url: pdfUrl(l) })),
    repository: site.repository,
    url: pageUrl(lang),
    alternates: LANGS.map((l) => ({ lang: l, url: pageUrl(l), path: langPath(l), label: l.toUpperCase() })),
  };
}

export type View = ReturnType<typeof view>;
