// The website. Its public URL comes from data/site.yaml, so the origin and the base path are set in one place.
import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import { parse } from "yaml";

const { url } = parse(readFileSync(new URL("./data/site.yaml", import.meta.url), "utf8"));
const { origin, pathname } = new URL(url);

export default defineConfig({
  site: origin,
  base: pathname,
  // src/ holds the data loader and the LaTeX generator, so the site lives in site/.
  srcDir: "./site",
  publicDir: "./site/public",
  outDir: "./build/site",
  trailingSlash: "ignore",
});
