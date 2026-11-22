// The HTML counterpart of latex.ts: the same data-file text, rendered for the website.

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const ENTITIES: Record<string, string> = { "&nbsp;": " ", "&thinsp;": " " };

/** Plain text: the data-file entities become their characters and nothing is left for HTML to interpret. */
export function toText(text: string): string {
  return text.replace(/&(?:nbsp|thinsp);/g, (entity) => ENTITIES[entity] ?? entity);
}

function escape(text: string): string {
  return toText(text).replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

/** Converts one line of data-file text to HTML: **bold** and `code`, everything else escaped. */
export function toHtml(text: string): string {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    .map((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return `<strong>${escape(part.slice(2, -2))}</strong>`;
      if (/^`[^`]+`$/.test(part)) return `<code>${escape(part.slice(1, -1))}</code>`;
      return escape(part);
    })
    .join("");
}

/** The same text with the markup removed, for attributes and metadata. */
export function toPlain(text: string): string {
  return toText(text).replace(/\*\*([^*]+)\*\*|`([^`]+)`/g, (_, bold, code) => bold ?? code);
}
