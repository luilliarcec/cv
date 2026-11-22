// Languages the CV can be generated in. Adding one means adding an entry here and a data/cv.<lang>.yaml file.
export const LOCALES = {
  es: {
    // Options for \usepackage[...]{babel}.
    babel: "spanish,es-noshorthands,es-nolists,es-noquoting",
    // Spanish typesetting uses \frenchspacing, so a period never needs a spacing hint.
    englishSpacing: false,
  },
  en: {
    babel: "english",
    // English uses wider spaces after sentences, so periods next to capitals or abbreviations need a hint.
    englishSpacing: true,
  },
} as const;

export type Lang = keyof typeof LOCALES;
export type Locale = (typeof LOCALES)[Lang];

export const LANGS = Object.keys(LOCALES) as [Lang, ...Lang[]];
