// Bundles the live-coach TypeScript into one plain-JS string for the WebView.
//
// The WebView has no module loader and the app has no bundler, so the page must receive source
// as a string. The obvious shortcut -- hand-maintaining a second copy in a JS template literal --
// is exactly how the old coach drifted from the backend and started judging a squat with press
// thresholds. So the string is GENERATED from engine.ts / overlay.ts / segment.ts /
// rubrics.generated.ts, and each module is wrapped in its own closure. That isolation matters:
// engine.ts and overlay.ts both declare a top-level DEG and a plausible(), which a naive
// concatenation would turn into a duplicate-declaration SyntaxError.
//
//   node src/live/buildRuntime.mjs
//
// Emits runtime.generated.ts. The emitted bundle is exercised by tests against the same
// TypeScript, so a fix in engine.ts cannot silently miss the page the user actually runs.
import { readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "runtime.generated.ts");

// Dependency order: a module may only import one declared before it.
const MODULES = ["rubrics.generated", "overlay", "engine", "segment"];

function exportsOf(src) {
  const names = new Set();
  const re = /^export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of src.matchAll(re)) names.add(m[1]);
  return [...names];
}

// `import { A, B } from "./x.ts";` -> destructure from that sibling's namespace object.
function stripImports(src) {
  return src.replace(
    /^import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["'];?[ \t]*$/gm,
    (_, names, path) => {
      const mod = path.replace(/^\.\//, "").replace(/\.ts$/, "");
      const list = names
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !s.startsWith("type "))
        .map((s) => s.replace(/\s+as\s+/, ": "))
        .join(", ");
      return list ? `const { ${list} } = __MODS[${JSON.stringify(mod)}];` : "";
    },
  );
}

function compile(name) {
  const raw = readFileSync(join(HERE, `${name}.ts`), "utf8");
  const names = exportsOf(raw);
  // `mode: "strip"` erases type syntax and leaves runtime code byte-for-byte, so downstream
  // behaviour cannot change just because the code took a detour through the bundler.
  let js = stripTypeScriptTypes(raw, { mode: "strip" });
  js = stripImports(js);
  js = js.replace(/^export\s+(?=(const|let|var|function|class)\b)/gm, "");
  return { name, js, names };
}

const compiled = MODULES.map(compile);

const parts = compiled.map(
  (m) => `__MODS[${JSON.stringify(m.name)}] = (function () {
${m.js}
return { ${m.names.join(", ")} };
})();`,
);

// Namespaced, not flattened: engine and overlay both export plausible(), and a silent
// last-one-wins merge is the kind of ambiguity this whole rewrite exists to remove.
const bundle = `var LIVE = (function () {
var __MODS = {};
${parts.join("\n\n")}
return {
  rubrics: __MODS["rubrics.generated"].RUBRICS,
  overlay: __MODS["overlay"],
  engine: __MODS["engine"],
  segment: __MODS["segment"],
};
})();`;

// The bundle is only useful if it parses. Check it here, at build time, so a syntax error is a
// failed build instead of a blank black screen on the user's phone.
new Function(bundle);

const header = `// GENERATED FILE -- do not edit by hand.
// Source: src/live/{rubrics.generated,overlay,engine,segment}.ts
// Regenerate: node src/live/buildRuntime.mjs

export const RUNTIME_JS = ${JSON.stringify(bundle)};
`;

writeFileSync(OUT, header, "utf8");
console.log(`RUNTIME_OK ${OUT} ${header.length} bytes`);
