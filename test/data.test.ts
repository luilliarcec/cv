import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadCv } from "../src/load.ts";
import { renderTex } from "../src/render-tex.ts";

const root = join(import.meta.dirname, "..");
const dataDir = join(root, "data");

test("the data files are valid and every language lines up", () => {
  const { editions } = loadCv(dataDir);
  assert.deepEqual(editions.map((edition) => edition.lang).sort(), ["en", "es"]);
});

test("every language renders a complete LaTeX document", () => {
  const { contact, editions } = loadCv(dataDir);
  const template = readFileSync(join(root, "templates", "cv.tex"), "utf8");
  for (const edition of editions) {
    const tex = renderTex(edition, contact, template);
    assert.doesNotMatch(tex, /@@[A-Z]+@@/, `${edition.lang}: a template placeholder was left unfilled`);
    assert.match(tex, /\\begin\{document\}[\s\S]+\\cvskill[\s\S]+\\end\{document\}\s*$/);
    assert.ok(tex.includes(contact.phone), `${edition.lang}: the phone number is missing`);
  }
});

function copyData(edit: (file: string, text: string) => string): string {
  const dir = mkdtempSync(join(tmpdir(), "cv-data-"));
  for (const file of ["contact.yaml", "cv.es.yaml", "cv.en.yaml"]) {
    writeFileSync(join(dir, file), edit(file, readFileSync(join(dataDir, file), "utf8")));
  }
  return dir;
}

test("rejects a language whose dates drift from the others", () => {
  const dir = copyData((file, text) => (file === "cv.en.yaml" ? text.replace("start: 2020-08", "start: 2020-09") : text));
  assert.throws(() => loadCv(dir), /cv\.es\.yaml does not line up with data\/cv\.en\.yaml/);
});

test("rejects unknown fields with the file name in the message", () => {
  const dir = copyData((file, text) => (file === "cv.es.yaml" ? text.replace("lang: es", "lang: es\nfoo: bar") : text));
  assert.throws(() => loadCv(dir), /data\/cv\.es\.yaml is invalid/);
});
