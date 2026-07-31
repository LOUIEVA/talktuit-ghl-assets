"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { KnowledgeIndex } from "../internal/knowledge-index";
import { Icon } from "./icons";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const initialLimit = 36;

export function TopicLibrary({ knowledgeIndex }: { knowledgeIndex: KnowledgeIndex }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const [letter, setLetter] = useState("All");
  const [limit, setLimit] = useState(initialLimit);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return knowledgeIndex.tutorials
      .filter((topic) => !needle || `${topic.title} ${topic.category}`.toLowerCase().includes(needle))
      .filter((topic) => category === "All topics" || topic.category === category)
      .filter((topic) => letter === "All" || topic.title[0]?.toUpperCase() === letter)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [query, category, letter, knowledgeIndex.tutorials]);

  const reset = () => { setQuery(""); setCategory("All topics"); setLetter("All"); setLimit(initialLimit); };
  const checkedDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(knowledgeIndex.meta.sourceCheckedAt));

  return (
    <>
      <div className="topic-source-note"><span><Icon name="shield" /></span><div><strong>TalkTuit source review</strong><p>{knowledgeIndex.meta.total} real-world topics were checked against current official documentation and a specialist tutorial library on {checkedDate}. Titles are rewritten before they appear here.</p></div></div>
      <div className="topic-controls">
        <div className="topic-search"><Icon name="search" /><input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(initialLimit); }} placeholder={`Search ${knowledgeIndex.meta.total} tutorial topics…`} aria-label="Search tutorial topics" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</div>
        <label className="select-wrap"><Icon name="filter" /><select value={category} onChange={(event) => { setCategory(event.target.value); setLimit(initialLimit); }}><option>All topics</option>{knowledgeIndex.categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
      </div>
      <div className="topic-category-strip" aria-label="Popular topic categories">{knowledgeIndex.categories.slice(0, 12).map((item) => <button key={item.name} className={category === item.name ? "selected" : ""} onClick={() => { setCategory(category === item.name ? "All topics" : item.name); setLimit(initialLimit); }}><span>{item.name}</span><em>{item.count}</em></button>)}</div>
      <div className="alphabet topic-alphabet" aria-label="Browse tutorial topics by letter"><button className={letter === "All" ? "selected" : ""} onClick={() => setLetter("All")}>All</button>{letters.map((item) => <button key={item} className={letter === item ? "selected" : ""} onClick={() => { setLetter(item); setLimit(initialLimit); }}>{item}</button>)}</div>
      <div className="topic-result-line"><span><strong>{filtered.length}</strong> {filtered.length === 1 ? "topic" : "topics"} found</span>{(query || category !== "All topics" || letter !== "All") && <button onClick={reset}>Reset filters</button>}</div>
      {filtered.length ? <div className="topic-grid">{filtered.slice(0, limit).map((topic) => <article className="topic-card" key={topic.id}><div className="topic-card-top"><span>{topic.category}</span><em><Icon name="shield" /> Source checked</em></div><h2>{topic.title}</h2><div className="topic-card-actions"><Link href={`/articles/${topic.guideSlug}`}>Open related guide <Icon name="arrow" /></Link><a href={`mailto:support@talktuit.com?subject=${encodeURIComponent(`Help with: ${topic.title}`)}`}>Ask about this</a></div></article>)}</div> : <div className="empty-state"><span><Icon name="search" /></span><h3>No topics match that search.</h3><p>Try fewer words or ask the support team directly.</p><div><button onClick={reset}>Show all topics</button><a href="mailto:support@talktuit.com">Ask support</a></div></div>}
      {limit < filtered.length && <button className="load-topics" onClick={() => setLimit((current) => current + initialLimit)}>Show {Math.min(initialLimit, filtered.length - limit)} more topics <Icon name="arrow" /></button>}
    </>
  );
}
