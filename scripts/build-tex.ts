// Generates build/cv-<lang>.tex for every data/cv.<lang>.yaml.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadCv } from "../src/load.ts";
import { renderTex } from "../src/render-tex.ts";

const root = join(import.meta.dirname, "..");
const outDir = join(root, "build");

try {
  const { contact, editions } = loadCv(join(root, "data"));
  const template = readFileSync(join(root, "templates", "cv.tex"), "utf8");
  mkdirSync(outDir, { recursive: true });
  for (const edition of editions) {
    const file = join(outDir, `cv-${edition.lang}.tex`);
    writeFileSync(file, renderTex(edition, contact, template));
    console.log(`wrote build/cv-${edition.lang}.tex`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
