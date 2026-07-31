import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const sourcePage = "https://growthable.io/gohighlevel-tutorials/";
const outputPath = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "tutorial-index.json");

const categoryLabels = {
  "account-management": "Account",
  "calendar": "Calendars",
  "campaigns": "Campaigns",
  "contacts": "Contacts",
  "conversations": "Conversations",
  "email-smtp": "Email",
  "forms": "Forms",
  "funnel-builder": "Funnels",
  "general-articles": "Getting started",
  "integration-widget": "Integrations",
  "memberships": "Courses",
  "miscellaneous": "General",
  "mobile-app": "Mobile",
  "opportunities": "Opportunities",
  "payments": "Payments",
  "phone": "Phone",
  "reporting": "Reporting",
  "reputation-management-reviews": "Reputation",
  "social-media": "Social media",
  "surveys": "Surveys",
  "triggers": "Automation triggers",
  "troubleshooting": "Troubleshooting",
  "webhooks": "Webhooks",
  "websites": "Websites",
  "workflows": "Workflows",
};

const relatedGuides = {
  "account-management": "your-account-settings",
  "calendar": "appointment-calendars",
  "campaigns": "lead-capture",
  "contacts": "contacts-records",
  "conversations": "handling-conversations",
  "email-smtp": "email-sending",
  "forms": "forms-surveys",
  "funnel-builder": "templates-snapshots",
  "general-articles": "getting-started",
  "integration-widget": "your-account-settings",
  "memberships": "templates-snapshots",
  "miscellaneous": "getting-started",
  "mobile-app": "mobile-app",
  "opportunities": "opportunities-pipelines",
  "payments": "payments-invoices",
  "phone": "voice-assistant",
  "reporting": "dashboard-basics",
  "reputation-management-reviews": "reputation-reviews",
  "social-media": "social-planner",
  "surveys": "forms-surveys",
  "triggers": "workflow-builder",
  "troubleshooting": "quick-start-checklist",
  "webhooks": "workflow-builder",
  "websites": "templates-snapshots",
  "workflows": "workflow-builder",
};

function clientSafe(value) {
  return value
    .replace(/\bgo\s*high\s*level\b/gi, "TalkTuit")
    .replace(/\bhighlevel\b/gi, "TalkTuit")
    .replace(/\bghl\b/gi, "TalkTuit")
    .replace(/\bleadconnector\b/gi, "TalkTuit")
    .replace(/\bLC\s+Phone(?:\s+System)?\b/gi, "TalkTuit Phone")
    .replace(/\bLC\s+Email\b/gi, "TalkTuit Email")
    .replace(/\bwhite[ -]?label(?:ed|ing)?\b/gi, "branded")
    .replace(/\s+/g, " ")
    .trim();
}

function decodePayloadArray(value) {
  return JSON.parse(value.replace(/\\"/g, '"'));
}

function extractIndex(html) {
  const itemsMarker = '\\"items\\":';
  const categoriesMarker = ',\\"categories\\":';
  const itemsStart = html.indexOf(itemsMarker);
  const categoriesStart = html.indexOf(categoriesMarker, itemsStart);
  if (itemsStart < 0 || categoriesStart < 0) throw new Error("Tutorial data was not found in the source page.");

  const items = decodePayloadArray(html.slice(itemsStart + itemsMarker.length, categoriesStart));
  const categoryArrayStart = categoriesStart + categoriesMarker.length;
  const categoryArrayEnd = html.indexOf("}]", categoryArrayStart);
  if (categoryArrayEnd < 0) throw new Error("Tutorial categories were not found in the source page.");
  const categories = decodePayloadArray(html.slice(categoryArrayStart, categoryArrayEnd + 2));
  return { items, categories };
}

const response = await fetch(sourcePage, { headers: { "User-Agent": "TalkTuit-Knowledge-Sync/1.0" } });
if (!response.ok) throw new Error(`Tutorial sync failed with HTTP ${response.status}.`);

const { items, categories } = extractIndex(await response.text());
const tutorials = items.map((item) => {
  const categoryKey = item.c || "general-articles";
  const title = clientSafe(item.t);
  return {
    id: createHash("sha1").update(item.h).digest("hex").slice(0, 12),
    title,
    category: categoryLabels[categoryKey] || clientSafe(categoryKey.replaceAll("-", " ")),
    guideSlug: relatedGuides[categoryKey] || "getting-started",
  };
});

const counts = categories.map((category) => ({
  name: categoryLabels[category.key] || clientSafe(category.label),
  count: category.count,
}));

let sourceCheckedAt = new Date().toISOString();
try {
  const existing = JSON.parse(await readFile(outputPath, "utf8"));
  const existingContent = JSON.stringify({
    categories: existing.categories,
    tutorials: existing.tutorials,
  });
  const nextContent = JSON.stringify({ categories: counts, tutorials });
  if (existingContent === nextContent && existing.meta?.sourceCheckedAt) {
    sourceCheckedAt = existing.meta.sourceCheckedAt;
  }
} catch {
  // The first sync creates the catalog with the current timestamp.
}

const output = {
  meta: {
    total: tutorials.length,
    sourceCheckedAt,
    description: "Source-backed tutorial topics rewritten into TalkTuit language.",
  },
  categories: counts,
  tutorials,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Synced ${tutorials.length} client-safe tutorial topics across ${counts.length} categories.`);
