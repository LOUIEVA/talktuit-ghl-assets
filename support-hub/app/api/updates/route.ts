import { curatedUpdates, type ProductUpdate } from "../../../lib/updates";

const SOURCE_FEED = "https://ideas.gohighlevel.com/api/changelog/feed.rss";
const replacements: Array<[RegExp, string]> = [
  [/\bgo\s*high\s*level\b/gi, "the platform"],
  [/\bhighlevel\b/gi, "the platform"],
  [/\bghl\b/gi, "the workspace"],
  [/\bleadconnector\b/gi, "the communications service"],
  [/\bgokollab\b/gi, "the community portal"],
  [/\bwhite[ -]?label\b/gi, "branded"],
  [/\bLC\s+(?:Phone|Email|Communications?)\b/gi, "communications"],
  [/\b[\w.+-]+@(?:gohighlevel|leadconnectorhq)\.com\b/gi, "the support team"],
];

function decodeEntities(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim();
}

function clientSafe(value: string) {
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value).replace(/\s+([,.;!?])/g, "$1").trim();
}

function tag(item: string, name: string) {
  return item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "";
}

function summarize(description: string) {
  const clean = clientSafe(decodeEntities(description)).replace(/^(what'?s new|overview|introducing)[:?\s-]*/i, "");
  const sentence = clean.match(/^(.{70,260}?[.!?])(?:\s|$)/)?.[1] ?? clean.slice(0, 220);
  return sentence.length < clean.length && !/[.!?]$/.test(sentence) ? `${sentence}…` : sentence;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

function parseFeed(xml: string): ProductUpdate[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  return items.slice(0, 18).map((item, index) => {
    const rawTitle = decodeEntities(tag(item, "title"));
    const title = clientSafe(rawTitle).replace(/[✨🎉🚀📁🤔🏆🛠️💬]/gu, "").replace(/\s+/g, " ").trim();
    const rawCategory = decodeEntities(tag(item, "category"));
    const category = clientSafe(rawCategory || "Workspace").split(",")[0].trim();
    const description = summarize(tag(item, "description") || tag(item, "content:encoded"));
    const type: ProductUpdate["type"] = /improv|enhanc|redesign|faster|fix/i.test(`${rawTitle} ${description}`) ? "Improved" : "New";
    return { id: slug(title) || `update-${index + 1}`, date: formatDate(decodeEntities(tag(item, "pubDate"))), type, category, title, summary: description || "A new workspace improvement is now available. Open the relevant area to review the latest options." };
  }).filter((item) => item.title.length > 3);
}

export async function GET() {
  try {
    const response = await fetch(SOURCE_FEED, { headers: { Accept: "application/rss+xml" }, next: { revalidate: 900 } });
    if (!response.ok) throw new Error("Feed unavailable");
    const updates = parseFeed(await response.text());
    return Response.json({ updates: updates.length ? updates : curatedUpdates, checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return Response.json({ updates: curatedUpdates, checkedAt: new Date().toISOString(), fallback: true }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  }
}

