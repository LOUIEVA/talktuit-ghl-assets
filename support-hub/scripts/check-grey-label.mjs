import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const projectRoot = new URL("../", import.meta.url);
const scanRoots = ["components", "data", "lib", "public"];
const directFiles = ["app/page.tsx", "app/layout.tsx", "app/not-found.tsx", "app/updates/page.tsx", "app/topics/page.tsx", "app/articles/[slug]/page.tsx"];
const forbidden = [
  ["g", "h", "l"].join(""),
  ["go", "high", "level"].join(""),
  ["high", "level"].join(""),
  ["lead", "connector"].join(""),
];
const readable = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".svg", ".txt"]);

async function walk(directory) {
  const absolute = new URL(`${directory}/`, projectRoot);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = join(directory, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) files.push(...await walk(child));
    else if (readable.has(extname(entry.name))) files.push(child);
  }
  return files;
}

const files = [...directFiles];
for (const root of scanRoots) files.push(...await walk(root));

const violations = [];
for (const file of files) {
  if (file === "scripts/check-grey-label.mjs") continue;
  const content = await readFile(new URL(file, projectRoot), "utf8");
  for (const term of forbidden) {
    const pattern = new RegExp(`\\b${term.replace(/\s+/g, "\\s*")}\\b`, "i");
    if (pattern.test(content)) violations.push(`${relative(".", file)} contains a blocked vendor term`);
  }
}

if (violations.length) {
  console.error("Grey-label check failed:\n" + violations.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Grey-label check passed across ${files.length} public content files.`);
