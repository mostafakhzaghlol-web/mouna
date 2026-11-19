import { test } from "node:test";
import assert from "node:assert/strict";
import { direction, formatSar, isLocale, pick } from "./index.ts";

test("arabic is rtl, english is ltr", () => {
  assert.equal(direction("ar"), "rtl");
  assert.equal(direction("en"), "ltr");
});

test("isLocale accepts only ar and en", () => {
  assert.ok(isLocale("ar"));
  assert.ok(!isLocale("fr"));
  assert.ok(!isLocale(undefined));
});

test("pick falls back when a translation is missing", () => {
  assert.equal(pick({ ar: "", en: "Soap" }, "ar"), "Soap");
});

test("formatSar works from halalas", () => {
  assert.match(formatSar(342000, "en"), /3,420\.00/);
});
