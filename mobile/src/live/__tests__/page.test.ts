// Guards a failure mode nothing else catches: a syntax error in the WebView page itself.
//
// liveHtml() builds one big HTML string with two inline <script> blocks. If either has a typo the
// page renders black on the phone with no error anywhere -- the React side only sees "the coach
// page could not load". TypeScript cannot catch it because the script bodies are string literals.
//
// So the page is rendered and both blocks are parsed here. The classic block is checked with
// `new Function`; the module block has to go through the real module parser, which is why it is
// written to a .mjs file and checked with `node --check` (parses, never executes).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { liveHtml } from "../liveHtml.ts";
import { RUBRICS } from "../rubrics.generated.ts";

const dir = mkdtempSync(join(tmpdir(), "ff-page-"));

function parseBlocks(html: string, label: string): number {
  const tags = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.ok(tags.length >= 2, `${label}: expected an inline runtime script and a module script, got ${tags.length}`);
  let i = 0;
  for (const [, attrs, body] of tags) {
    const isModule = /type\s*=\s*["']module["']/.test(attrs);
    if (!isModule) {
      // A classic script is parsed, not run: a reference error is fine, a typo is not.
      new Function(body);
      continue;
    }
    const file = join(dir, `${label.replace(/\W+/g, "-")}-${i++}.mjs`);
    writeFileSync(file, body);
    try {
      execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    } catch (e: any) {
      assert.fail(`${label}: module script does not parse:\n${e.stderr?.toString() || e.message}`);
    }
  }
  return tags.length;
}

try {
  // Every exercise that has a rubric gets its page checked, because the page is built from the
  // rubric's own check list -- a rubric with an odd id is a real way to break the render.
  for (const id of Object.keys(RUBRICS)) {
    const html = liveHtml({ exerciseId: id, lang: "en", facing: "environment" });
    const n = parseBlocks(html, id);
    assert.ok(html.length > 20000, `${id}: page is suspiciously short (${html.length} chars)`);
    assert.ok(html.includes(`"${id}"`) || html.includes(`'${id}'`), `${id}: page does not carry the exercise id`);
    console.log(`  ${id}: ${n} script blocks parse (${html.length} chars)`);
  }

  // Bilingual pages are a separate code path (every T() call flips), so check one of those too.
  const hi = liveHtml({ exerciseId: Object.keys(RUBRICS)[0], lang: "hi", facing: "environment" });
  parseBlocks(hi, "hinglish");
  console.log("PAGE_PARSE_OK");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
