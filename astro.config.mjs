// The website. Its public URL comes from data/site.yaml, so the origin and the base path are set in one place.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { parse } from "yaml";

const { url } = parse(readFileSync(new URL("./data/site.yaml", import.meta.url), "utf8"));
const { origin, pathname } = new URL(url);
const dataDir = fileURLToPath(new URL("./data/", import.meta.url));

// The pages read data/ with fs, outside Vite's module graph, so the dev server would not notice an edit.
// This watches the folder and reloads the browser when a data file changes.
const reloadOnDataChange = {
  name: "reload-on-data-change",
  configureServer(server) {
    server.watcher.add(dataDir);
    server.watcher.on("change", (file) => {
      if (file.startsWith(dataDir)) server.ws.send({ type: "full-reload" });
    });
  },
};

export default defineConfig({
  site: origin,
  base: pathname,
  // src/ holds the data loader and the LaTeX generator, so the site lives in site/.
  srcDir: "./site",
  publicDir: "./site/public",
  outDir: "./build/site",
  trailingSlash: "ignore",
  vite: { plugins: [reloadOnDataChange] },
});
