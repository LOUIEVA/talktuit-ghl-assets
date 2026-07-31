import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

const blocked = new RegExp(`\\b(?:${["g" + "h" + "l", "go" + "high" + "level", "high" + "level", "lead" + "connector"].join("|")})\\b`, "i");

test("renders the TalkTuit support hub with a complete A–Z library", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>TalkTuit Support Hub \| Answers from A to Z<\/title>/i);
  assert.match(html, /Everything, from A to Z/);
  assert.match(html, />26<\/strong><span>essential A–Z guides<\/span>/);
  assert.match(html, /href="\/articles\/appointment-calendars"/);
  assert.match(html, /href="\/articles\/zero-inbox-routine"/);
  assert.doesNotMatch(html, blocked);
});

test("renders article and update routes without vendor branding", async () => {
  for (const pathname of ["/articles/contacts-records", "/topics", "/updates"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /TalkTuit/);
    assert.doesNotMatch(html, blocked);
  }
});

test("ships the complete source-backed tutorial index", async () => {
  const index = (await import("../data/tutorial-index.json", { with: { type: "json" } })).default;
  assert.equal(index.meta.total, 853);
  assert.equal(index.tutorials.length, 853);
  assert.equal(index.categories.length, 25);
  assert.doesNotMatch(JSON.stringify(index), blocked);

  const response = await render("/topics");
  const html = await response.text();
  assert.match(html, /853(?:<!-- -->)? topics/);
  assert.match(html, /Source-backed learning/);
});
