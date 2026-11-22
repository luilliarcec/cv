import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { Contact, Edition, type Project } from "./schema.ts";

export type CvData = { contact: Contact; editions: Edition[] };

const EDITION_FILE = /^cv\.([a-z]{2})\.yaml$/;

function validate<T>(schema: z.ZodType<T>, file: string, dataDir: string): T {
  const value: unknown = parse(readFileSync(join(dataDir, file), "utf8"));
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`data/${file} is invalid:\n${z.prettifyError(result.error)}`);
  return result.data;
}

/** Reads data/contact.yaml and every data/cv.<lang>.yaml, validates them and checks that the languages line up. */
export function loadCv(dataDir: string): CvData {
  const contact = validate(Contact, "contact.yaml", dataDir);

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
  return { contact, editions };
}

// Every language is a translation of the others: same entries in the same order, same dates and the same
// number of bullets. Anything else means one file was edited and the other was not.
function shape(edition: Edition): string[] {
  const facts: string[] = [`headline items=${edition.headline.length}`];
  const project = (path: string, p: Project) =>
    facts.push(
      `${path}.${p.id} start=${p.start ?? "-"} end=${p.end ?? "-"} description=${p.description ? "yes" : "no"}` +
        ` role=${p.role ? "yes" : "no"} highlights=${p.highlights.length}`,
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
