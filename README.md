# CV

My CV, kept as data. The YAML files in `data/` are the only source: a script turns them into LaTeX, GitHub Actions compiles the PDFs and publishes a release every time `develop` is merged into `main`. The website will be generated from the same files.

| File | Contents |
|---|---|
| `data/contact.yaml` | Name, location, email, phone and links. The same in every language. |
| `data/cv.es.yaml` | Everything written in Spanish: headline, profile, experience, projects, education, skills. |
| `data/cv.en.yaml` | The same in English. |
| `templates/cv.tex` | The LaTeX layout: preamble, colors and the `\cventry`, `\cvproject` and `\cvskill` blocks. |
| `src/`, `scripts/` | The schema, the loader and the LaTeX generator (TypeScript, run by Node without a build step). |

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

## Adding a language

1. Add `data/cv.<lang>.yaml`, a translation of an existing file with the same entries.
2. Add the language to [`src/locales.ts`](src/locales.ts) with its babel options.
3. If babel needs a package that is not installed yet (for example `texlive-lang-german`), add it to the `Install TeX Live` step of the workflow.

## Building locally

Requires Node 24 or later. For the PDFs, also `pdflatex` and `latexmk` with the packages listed in the `Install TeX Live` step of the workflow (on Ubuntu, the same apt packages).

```bash
npm ci
npm test        # validate the data and the generator
npm run tex     # write build/cv-es.tex and build/cv-en.tex
npm run pdf     # the above, then compile them to build/cv-es.pdf and build/cv-en.pdf
```

Without `latexmk`, run `pdflatex cv-es.tex` twice inside `build/`. Everything in `build/` is ignored by git.
