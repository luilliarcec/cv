import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDate, formatPeriod } from "../src/dates.ts";
import { toLatex, toLatexUrl } from "../src/latex.ts";
import { LOCALES } from "../src/locales.ts";

const es = LOCALES.es;
const en = LOCALES.en;

test("escapes LaTeX special characters", () => {
  assert.equal(toLatex("C#/.NET, 50% R&D, a_b, $5, {x}, ^, ~, \\", es), "C\\#/.NET, 50\\% R\\&D, a\\_b, \\$5, \\{x\\}, \\^{}, \\textasciitilde{}, \\textbackslash{}");
});

test("maps typographic characters", () => {
  assert.equal(toLatex("Colombia · Remoto", es), "Colombia \\textperiodcentered{} Remoto");
  assert.equal(toLatex("2024–2026 — Keycloak → RabbitMQ", es), "2024--2026 --- Keycloak $\\rightarrow$ RabbitMQ");
  assert.equal(toLatex("the “design-first” gate", en), "the ``design-first'' gate");
  assert.equal(toLatex("«diseño primero»", es), "«diseño primero»");
});

test("turns &nbsp; and &thinsp; into LaTeX spaces", () => {
  assert.equal(toLatex("13&nbsp;s", es), "13~s");
  assert.equal(toLatex("EE.&thinsp;UU. y 97,3&thinsp;%", es), "EE.\\,UU. y 97,3\\,\\%");
  assert.equal(toLatex("R&amp;D", es), "R\\&amp;D");
});

test("supports **bold** and `code`", () => {
  assert.equal(toLatex("**ERIS**: plataforma", es), "\\textbf{ERIS}: plataforma");
  assert.equal(toLatex("Autor de `teamq-laravel-datatables`", es), "Autor de \\texttt{teamq-laravel-datatables}");
  assert.equal(toLatex("**C#** y `a_b`", es), "\\textbf{C\\#} y \\texttt{a\\_b}");
});

test("adds English sentence-spacing hints only in English", () => {
  assert.equal(toLatex("OWASP SAMM. Resolved all", en), "OWASP SAMM\\@. Resolved all");
  assert.equal(toLatex("B.Eng. in Systems", en), "B.Eng.\\ in Systems");
  assert.equal(toLatex("the U.S. and Germany", en), "the U.S. and Germany");
  assert.equal(toLatex("on deploy. Agent", en), "on deploy. Agent");
  assert.equal(toLatex("con OWASP SAMM. Resueltos", es), "con OWASP SAMM. Resueltos");
});

test("escapes only % and # in URLs", () => {
  assert.equal(toLatexUrl("https://example.com/a_b?q=1%20#top"), "https://example.com/a_b?q=1\\%20\\#top");
});

test("formats dates and periods per language", () => {
  assert.equal(formatDate("2026-02", "es"), "Febrero 2026");
  assert.equal(formatDate("2026-02", "en"), "February 2026");
  assert.equal(formatDate("2026", "es"), "2026");
  assert.equal(formatPeriod("2020-08", "2023-02", "es", "Actualidad"), "Agosto 2020 – Febrero 2023");
  assert.equal(formatPeriod("2025-10", "present", "en", "Present"), "October 2025 – Present");
  assert.equal(formatPeriod(undefined, "2020-02", "es", "Actualidad"), "Febrero 2020");
  assert.equal(formatPeriod("2026", undefined, "es", "Actualidad"), "2026");
  assert.equal(formatPeriod(undefined, undefined, "es", "Actualidad"), "");
});
