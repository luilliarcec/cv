import type { Locale } from "./locales.ts";

// Characters that LaTeX treats as commands. Each one is replaced in a single pass, so a replacement is never
// escaped again.
const SPECIALS: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "&": "\\&",
  "#": "\\#",
  _: "\\_",
  "%": "\\%",
  "^": "\\^{}",
  "~": "\\textasciitilde{}",
};

// Typographic characters written as-is in the data files and their LaTeX equivalents.
const TYPOGRAPHY: Record<string, string> = {
  " ": "~", // no-break space (&nbsp; in the data)
  " ": "\\,", // narrow no-break space (&thinsp; in the data)
  "·": "\\textperiodcentered{}",
  "–": "--",
  "—": "---",
  "→": "$\\rightarrow$",
  "“": "``",
  "”": "''",
};

// The two entities the data files may use, so that invisible spaces stay visible in diffs.
const ENTITIES: Record<string, string> = { "&nbsp;": " ", "&thinsp;": " " };

function plain(text: string, locale: Locale): string {
  let out = text.replace(/&(?:nbsp|thinsp);/g, (entity) => ENTITIES[entity] ?? entity);
  out = out.replace(/[\\{}$&#_%^~]/g, (ch) => SPECIALS[ch] ?? ch);
  if (locale.englishSpacing) {
    // A period after a lowercase letter followed by a lowercase word ends an abbreviation, not a sentence
    // ("B.Eng. in"): keep a normal space. A period after a capital followed by a capitalised word ends a
    // sentence ("OWASP SAMM. Resolved"): LaTeX would otherwise read it as an abbreviation.
    out = out.replace(/(\p{Ll})\. (?=\p{Ll})/gu, "$1.\\ ").replace(/(\p{Lu})\. (?=\p{Lu})/gu, "$1\\@. ");
  }
  return out.replace(/[  ·–—→“”]/g, (ch) => TYPOGRAPHY[ch] ?? ch);
}

/**
 * Converts one line of data-file text to LaTeX. Supports **bold** and `code`; everything else is literal text,
 * with LaTeX's special characters escaped and typographic characters mapped to their LaTeX forms.
 */
export function toLatex(text: string, locale: Locale): string {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    .map((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return `\\textbf{${plain(part.slice(2, -2), locale)}}`;
      if (/^`[^`]+`$/.test(part)) return `\\texttt{${plain(part.slice(1, -1), locale)}}`;
      return plain(part, locale);
    })
    .join("");
}

/** Escapes a URL for \href: only % and # need it. */
export function toLatexUrl(url: string): string {
  return url.replace(/[%#]/g, (ch) => `\\${ch}`);
}
