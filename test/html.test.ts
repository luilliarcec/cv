import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPeriod } from "../src/dates.ts";
import { toHtml, toPlain, toText } from "../src/html.ts";

test("escapes HTML and keeps typographic characters", () => {
  assert.equal(toHtml(`<script>"R&D" it's</script> · → «x»`), "&lt;script&gt;&quot;R&amp;D&quot; it&#39;s&lt;/script&gt; · → «x»");
});

test("turns the data-file entities into real spaces", () => {
  assert.equal(toHtml("EE.&thinsp;UU. 13&nbsp;s"), "EE. UU. 13 s");
  assert.equal(toText("97,3&thinsp;%"), "97,3 %");
});

test("supports **bold** and `code`", () => {
  assert.equal(toHtml("**ERIS**: `a<b>`"), "<strong>ERIS</strong>: <code>a&lt;b&gt;</code>");
  assert.equal(toPlain("**ERIS**: `teamq` &nbsp;x"), "ERIS: teamq  x");
});

test("formats short periods for the website", () => {
  assert.equal(formatPeriod("2026-02", "present", "en", "Present", "short"), "Feb 2026 – Present");
  assert.equal(formatPeriod("2020-08", "2023-02", "es", "Actualidad", "short"), "Ago 2020 – Feb 2023");
});
