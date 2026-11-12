# CV

LaTeX source of my CV. Only the `.tex` files live here; GitHub Actions compiles them to PDF and publishes a release every time `develop` is merged into `main`.

| File | Language | Status |
|---|---|---|
| `cv-es.tex` | Spanish | Active |
| `cv-en.tex` | English | Active |

## Workflow

1. Commit changes to `develop`.
2. Open a pull request from `develop` to `main`. CI compiles every `cv-*.tex` and attaches the PDFs to the run as the `cv-pdf` artifact, so the result can be reviewed before merging.
3. Merge. CI compiles again and creates a GitHub Release tagged `cv-YYYY-MM-DD-N`, where `N` is a sequential release number. The release holds one PDF per language, named `Luis-Arce-CV-<LANG>.pdf` (for example `Luis-Arce-CV-ES.pdf`), and `Luis-Arce-CV.zip` with all of them.

The latest PDFs are always on the [latest release](https://github.com/luilliarcec/cv/releases/latest). The release job also runs when the workflow is started manually on `main` (Actions, Build CV, Run workflow).

The workflow lives in [`.github/workflows/build-cv.yml`](.github/workflows/build-cv.yml). It only runs when a `.tex` file or the workflow itself changes, so a README-only merge does not create a release.

## Adding a language

Add `cv-<lang>.tex` at the repository root. The workflow compiles every file matching `cv-*.tex`, so no workflow change is needed. If the new language needs a babel package that is not installed yet (for example `texlive-lang-german`), add it to the `Install TeX Live` step.

## Building locally

Requires `pdflatex` with the packages listed in the `Install TeX Live` step of the workflow (on Ubuntu, the same apt packages).

```bash
latexmk -pdf -output-directory=build cv-es.tex
```

Without `latexmk`, run `pdflatex cv-es.tex` twice. PDFs and LaTeX build files are ignored by git.
