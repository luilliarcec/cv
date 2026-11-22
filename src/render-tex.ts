import { formatPeriod } from "./dates.ts";
import { toLatex, toLatexUrl } from "./latex.ts";
import { LOCALES } from "./locales.ts";
import type { Contact, Edition, Project } from "./schema.ts";

/** Renders one language of the CV into templates/cv.tex. The output compiles with pdflatex. */
export function renderTex(edition: Edition, contact: Contact, template: string): string {
  const { lang, labels } = edition;
  const locale = LOCALES[lang];
  const t = (text: string) => toLatex(text, locale);
  const period = (start?: string, end?: string) => t(formatPeriod(start, end, lang, labels.present));

  const itemize = (items: string[]) => ["\\begin{itemize}", ...items.map((item) => `  \\item ${t(item)}`), "\\end{itemize}"];
  const project = (p: Project) => [
    "",
    `\\cvproject{${t(p.name)}}{${t([p.description, p.role].filter(Boolean).join(" · "))}}{${period(p.start, p.end)}}`,
    ...itemize(p.highlights),
  ];

  const contactLine = [
    t(contact.location),
    `\\href{mailto:${toLatexUrl(contact.email)}}{${t(contact.email)}}`,
    t(contact.phone),
    ...contact.links.map((link) => `\\href{${toLatexUrl(link.url)}}{${t(link.label)}}`),
  ];

  const body = [
    `{\\fontsize{22}{26}\\selectfont\\bfseries ${t(contact.name)}}\\par`,
    "\\vspace{5pt}",
    `{\\color{accent}${t(edition.headline.join(" · "))}}\\par`,
    "\\vspace{5pt}",
    "{\\small\\color{muted}%",
    `${contactLine.map((part) => `  ${part}`).join("\\sep\n")}}\\par`,
    "",
    `\\cvsection{${t(labels.profile)}}`,
    "{\\small",
    t(edition.profile),
    "\\par}",
    "",
    `\\cvsection{${t(labels.experience)}}`,
    ...edition.experience.flatMap((entry) => [
      "",
      `\\cventry{${t(entry.company)}}{${t(entry.location)}}{${t(entry.role)}}{${period(entry.start, entry.end)}}`,
      ...(entry.summary ? [`{\\small ${t(entry.summary)}\\par}`] : []),
      ...(entry.highlights ? itemize(entry.highlights) : []),
      ...(entry.projects ?? []).flatMap(project),
    ]),
    "",
    `\\cvsection{${t(labels.projects)}}`,
    ...edition.projects.flatMap(project),
    "",
    `\\cvsection{${t(labels.education)}}`,
    "",
    ...edition.education.map(
      (entry) =>
        `\\cventry{${t(entry.institution)}}{${t(entry.location)}}{${t(entry.degree)}}{${period(entry.start, entry.end)}}`,
    ),
    "",
    `\\cvsection{${t(labels.skills)}}`,
    "\\vspace{2pt}",
    ...edition.skills.map((skill) => `\\cvskill{${t(skill.name)}}{${t(`${skill.items.join(", ")}.`)}}`),
  ].join("\n");

  return template
    .replaceAll("@@LANG@@", lang)
    .replaceAll("@@BABEL@@", locale.babel)
    .replaceAll("@@NAME@@", t(contact.name))
    .replace("@@BODY@@", () => body);
}
