import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { Contact, Edition, type Project, Site } from "./schema.ts";

export type CvData = { contact: Contact; site: Site; editions: Edition[] };

const EDITION_FILE = /^cv\.([a-z]{2})\.yaml$/;

function validate<T>(schema: z.ZodType<T>, file: string, dataDir: string): T {
  const value: unknown = parse(readFileSync(join(dataDir, file), "utf8"));
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`data/${file} is invalid:\n${z.prettifyError(result.error)}`);
  return result.data;
}

/**
 * Reads data/contact.yaml, data/site.yaml and every data/cv.<lang>.yaml, validates them, checks that the languages
 * line up and that data/site.yaml only refers to ids that exist.
 */
export function loadCv(dataDir: string): CvData {
  const contact = validate(Contact, "contact.yaml", dataDir);
  const site = validate(Site, "site.yaml", dataDir);

  const files = readdirSync(dataDir).filter((file) => EDITION_FILE.test(file)).sort();
  if (files.length === 0) throw new Error(`no cv.<lang>.yaml files in ${dataDir}`);

  const editions = files.map((file) => {
    const edition = validate(Edition, file, dataDir);
    const fromName = EDITION_FILE.exec(file)?.[1];
    if (edition.lang !== fromName) {
      throw new Error(`data/${file} says lang: ${edition.lang}, but its file name says ${fromName}`);
    }
    return edition;
  });

  checkAligned(editions);
  checkSiteIds(site, editions);
  return { contact, site, editions };
}

function checkSiteIds(site: Site, editions: Edition[]): void {
  // Ids are the same in every language once checkAligned has passed, so the first edition is enough.
  const [edition] = editions;
  if (!edition) return;
  const entries = new Set([
    ...edition.experience.flatMap((entry) => [entry.id, ...(entry.projects ?? []).map((p) => p.id)]),
    ...edition.projects.map((p) => p.id),
  ]);
  const skills = new Set(edition.skills.map((skill) => skill.id));
  const unknown = (keys: string[], known: Set<string>, field: string) => {
    const missing = keys.filter((key) => !known.has(key));
    if (missing.length) throw new Error(`data/site.yaml: ${field} refers to unknown ids: ${missing.join(", ")}`);
  };
  unknown(Object.keys(site.stack), entries, "stack");
  unknown(Object.keys(site.levels), skills, "levels");
  unknown(Object.keys(site.places), new Set(["home", ...entries]), "places");
  for (const e of editions) {
    const names = Object.keys(e.web.places).sort().join(", ");
    const pins = Object.keys(site.places).sort().join(", ");
    if (names !== pins) {
      throw new Error(`data/cv.${e.lang}.yaml: web.places has [${names}] but data/site.yaml places has [${pins}]`);
    }
  }
}

// Every language is a translation of the others: same entries in the same order, same dates and the same
// number of bullets. Anything else means one file was edited and the other was not.
function shape(edition: Edition): string[] {
  const facts: string[] = [
    `headline items=${edition.headline.length}`,
    `web.counters=${edition.web.counters.length}`,
    `web.places=${Object.keys(edition.web.places).sort().join(",")}`,
  ];
  const project = (path: string, p: Project) =>
    facts.push(
      `${path}.${p.id} start=${p.start ?? "-"} end=${p.end ?? "-"} description=${p.description ? "yes" : "no"}` +
        ` role=${p.role ? "yes" : "no"} highlights=${p.highlights.length} metrics=${p.metrics?.length ?? 0}`,
    );

  for (const entry of edition.experience) {
    facts.push(
      `experience.${entry.id} start=${entry.start} end=${entry.end} summary=${entry.summary ? "yes" : "no"}` +
        ` highlights=${entry.highlights?.length ?? 0}`,
    );
    for (const p of entry.projects ?? []) project(`experience.${entry.id}.projects`, p);
  }
  for (const p of edition.projects) project("projects", p);
  for (const entry of edition.education) facts.push(`education.${entry.id} start=${entry.start ?? "-"} end=${entry.end}`);
  for (const skill of edition.skills) facts.push(`skills.${skill.id}`);
  return facts;
}

function checkAligned([reference, ...others]: Edition[]): void {
  if (!reference) return;
  const expected = shape(reference);
  for (const other of others) {
    const actual = shape(other);
    for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
      if (expected[i] !== actual[i]) {
        throw new Error(
          `data/cv.${other.lang}.yaml does not line up with data/cv.${reference.lang}.yaml:\n` +
            `  ${reference.lang}: ${expected[i] ?? "(missing)"}\n  ${other.lang}: ${actual[i] ?? "(missing)"}`,
        );
      }
    }
  }
}
