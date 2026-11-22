# CV

My CV, kept as data. The YAML files in `data/` are the only source for both outputs:

- **PDF**: a script turns the data into LaTeX, and GitHub Actions compiles the PDFs and publishes a release every time `develop` is merged into `main`.
- **Website**: an [Astro](https://astro.build) site in `site/` renders the same data, in English at `/` and in Spanish at `/es/`. CI builds it on every pull request. Publishing it to GitHub Pages needs a public repository and is not set up yet.

| File | Contents |
|---|---|
| `data/contact.yaml` | Name, location, email, phone and links. The same in every language. |
| `data/cv.es.yaml` | Everything written in Spanish: headline, profile, experience, projects, education, skills, and the website-only texts under `web`. |
| `data/cv.en.yaml` | The same in English. |
| `data/site.yaml` | Website settings that are the same in every language: URL, ticker, stack per entry, skill bar levels, map pins. |
| `templates/cv.tex` | The LaTeX layout: preamble, colors and the `\cventry`, `\cvproject` and `\cvskill` blocks. |
| `src/`, `scripts/` | The schema, the loader and the LaTeX and HTML text converters (TypeScript, run by Node without a build step). |
| `site/` | The website: pages, components, styles, the avatar and the interface text in both languages (`site/lib/i18n.ts`). |

## Workflow

1. Edit the data on `develop`, run `npm test` and `npm run tex`, and commit.
2. Open a pull request from `develop` to `main`. CI validates the data, generates `build/cv-<lang>.tex`, compiles every one of them and attaches the PDFs to the run as the `cv-pdf` artifact, so the result can be reviewed before merging.
3. Merge. CI builds again and creates a GitHub Release tagged `cv-YYYY-MM-DD-N`, where `N` is a sequential release number. The release holds one PDF per language, named `Luis-Arce-CV-<LANG>.pdf` (for example `Luis-Arce-CV-ES.pdf`), and `Luis-Arce-CV.zip` with all of them.

The latest PDFs are always on the [latest release](https://github.com/luilliarcec/cv/releases/latest). The release job also runs when the workflow is started manually on `main` (Actions, Build CV, Run workflow).

The workflow lives in [`.github/workflows/build-cv.yml`](.github/workflows/build-cv.yml). It only runs when the data, the generator, the template, the dependencies or the workflow itself change, so a README-only merge does not create a release.

## Editing the data

Every language file has the same entries in the same order, with the same `id`s, dates and number of bullets. `npm test` fails when one file was changed and the other was not, and the error names the first entry that differs.

- **Dates** are `YYYY-MM` (`2026-02`) or `YYYY`, and `end: present` for current roles. They are printed in each language ("Febrero 2026 – Actualidad", "February 2026 – Present").
- **Bold and code**: `**ERIS**` and `` `teamq-laravel-datatables` ``. Nothing else is markup.
- **Typographic characters** go in as they are: `·` `–` `—` `→` `«»` `“”`. The generator converts them to LaTeX.
- **Special spaces** are written as entities so they stay visible: `&nbsp;` for a non-breaking space (`13&nbsp;s`) and `&thinsp;` for a thin one (`EE.&thinsp;UU.`, `97,3&thinsp;%`).
- **LaTeX characters** (`% & # _ $ { } ~ ^ \`) can be typed normally; they are escaped.
- **Sentence spacing** in English is handled for you: a period after a capital followed by a capitalised word ends a sentence ("SAMM. Resolved"), and a period after a lowercase letter followed by a lowercase word ends an abbreviation ("B.Eng. in").

The schema in [`src/schema.ts`](src/schema.ts) lists every field. Unknown fields are rejected, so a typo in a field name fails instead of disappearing silently.

Some fields only feed the website and never reach the PDF:

- `web` in each language file: the short `intro` under the name, the contact `pitch`, the `counters` under the hero and the map's place names (`places`).
- `metrics` on a project: headline numbers shown as chips (`value: "4,801"`, `label: automated tests`). The rewards panel of the current mission collects the metrics of its projects.
- `data/site.yaml`: the `stack` tags of each entry or project, the skill bar `levels` (0–100; a skill without a level, like languages, is listed as text) and the map pins (`places`, as `[latitude, longitude]`, with `home` for the contact location). `npm test` fails if any of these points at an id that does not exist.

On the website, the first experience entry is the current mission, the other entries with projects become mission cards, and entries without projects are listed with the education as previous chapters.

## Adding a language

1. Add `data/cv.<lang>.yaml`, a translation of an existing file with the same entries.
2. Add the language to [`src/locales.ts`](src/locales.ts) with its babel options.
3. If babel needs a package that is not installed yet (for example `texlive-lang-german`), add it to the `Install TeX Live` step of the workflow.

## Building locally

Requires Node 24 or later. For the PDFs, also `pdflatex` and `latexmk` with the packages listed in the `Install TeX Live` step of the workflow (on Ubuntu, the same apt packages).

```bash
npm ci
npm test        # validate the data and the generators
npm run tex     # write build/cv-es.tex and build/cv-en.tex
npm run pdf     # the above, then compile them to build/cv-es.pdf and build/cv-en.pdf
npm run dev     # the website with live reload, at http://localhost:4321/cv/
npm run site    # build the website into build/site/ (npm run preview serves it)
```

Without `latexmk`, run `pdflatex cv-es.tex` twice inside `build/`. Everything in `build/` is ignored by git.

The website's PDF buttons point at the latest release's assets (`releases/latest/download/Luis-Arce-CV-<LANG>.pdf`), so they only work once the repository is public.
