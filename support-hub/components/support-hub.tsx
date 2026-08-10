"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { alphabet, articles, categories } from "../lib/kb-data";
import { curatedUpdates } from "../lib/updates";
import knowledgeIndex from "../data/tutorial-index.json";
import { Icon } from "./icons";

const categoryIcons = ["spark", "users", "layers", "book", "pulse", "shield"] as const;

export function SupportHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const [letter, setLetter] = useState("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesQuery = !needle || `${article.title} ${article.summary} ${article.category}`.toLowerCase().includes(needle);
      const matchesCategory = category === "All topics" || article.category === category;
      const matchesLetter = letter === "All" || article.letter === letter;
      return matchesQuery && matchesCategory && matchesLetter;
    });
  }, [query, category, letter]);

  return (
    <>
      <section className="hero">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> Answers, without the wait</div>
            <h1>Find your way around<br/><em>every part</em> of your workspace.</h1>
            <p>Step-by-step guidance, practical fixes and the latest improvements—written in plain language for TalkTuit clients.</p>
            <div className="hero-search">
              <Icon name="search" />
              <input id="kb-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") document.getElementById("knowledge")?.scrollIntoView({ behavior: "smooth" }); }} placeholder="Search contacts, calendars, workflows…" aria-label="Search the knowledge base" />
              <kbd>Enter</kbd>
            </div>
            <div className="popular-searches"><span>Popular:</span><button onClick={() => setQuery("contacts")}>contacts</button><button onClick={() => setQuery("calendar")}>calendars</button><button onClick={() => setQuery("workflow")}>workflows</button></div>
          </div>
          <div className="hero-panel-wrap">
            <div className="hero-panel">
              <div className="panel-top"><span className="panel-icon"><Icon name="pulse" /></span><div><small>Update signal</small><strong>Fresh this week</strong></div><span className="status-pill">LIVE</span></div>
              <div className="update-preview">
                {curatedUpdates.slice(0, 3).map((update, index) => <Link href="/updates" key={update.id} className="update-preview-row"><span className={`update-number n${index + 1}`}>{String(index + 1).padStart(2, "0")}</span><span><small>{update.category} · {update.date.replace(", 2026", "")}</small><strong>{update.title}</strong></span><Icon name="chevron" /></Link>)}
              </div>
              <Link href="/updates" className="panel-link">See every recent improvement <Icon name="arrow" /></Link>
            </div>
            <div className="floating-note"><Icon name="shield" /><span><strong>100% TalkTuit</strong>Client-safe guidance</span></div>
          </div>
        </div>
        <div className="hero-stats page-shell">
          <div><strong>26</strong><span>essential A–Z guides</span></div><div><strong>{knowledgeIndex.meta.total}</strong><span>source-backed topics</span></div><div><strong>Live</strong><span>product update monitor</span></div><div><strong>Human</strong><span>support when you need it</span></div>
        </div>
      </section>

      <section id="categories" className="section page-shell">
        <div className="section-heading"><div><span className="section-kicker">Choose a topic</span><h2>What can we help with?</h2></div><p>Start with the area you’re working in, or use search for a specific answer.</p></div>
        <div className="category-grid">
          {categories.map((item, index) => <button key={item.name} className={`category-card tone-${item.color}`} onClick={() => { setCategory(item.name); setLetter("All"); document.getElementById("knowledge")?.scrollIntoView({ behavior: "smooth" }); }}><span className="category-icon"><Icon name={categoryIcons[index]} /></span><span className="category-copy"><strong>{item.name}</strong><small>{item.description}</small><em>{item.count} guides <Icon name="arrow" /></em></span></button>)}
        </div>
      </section>

      <section className="source-library page-shell">
        <div className="source-library-copy"><span className="section-kicker">Expanded learning index</span><h2>Can’t find the exact feature?</h2><p>Search {knowledgeIndex.meta.total} real-world tutorial topics gathered from current help documentation and a specialist learning library. Everything is rewritten into TalkTuit language before clients see it.</p><Link href="/topics">Search the full topic library <Icon name="arrow" /></Link></div>
        <div className="source-library-count"><span><Icon name="book" /></span><strong>{knowledgeIndex.meta.total}</strong><small>indexed topics</small><div>{knowledgeIndex.categories.slice(0, 6).map((item) => <em key={item.name}>{item.name} <b>{item.count}</b></em>)}</div></div>
      </section>

      <section id="knowledge" className="knowledge-section">
        <div className="page-shell">
          <div className="section-heading knowledge-heading"><div><span className="section-kicker">Knowledge base</span><h2>Everything, from A to Z.</h2></div><div className="result-count"><Icon name="book" /> {filtered.length} {filtered.length === 1 ? "guide" : "guides"}</div></div>
          <div className="filter-bar">
            <div className="compact-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every guide" aria-label="Filter guides" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</div>
            <label className="select-wrap"><Icon name="filter" /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All topics</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
            {(query || category !== "All topics" || letter !== "All") && <button className="clear-filters" onClick={() => { setQuery(""); setCategory("All topics"); setLetter("All"); }}>Reset filters</button>}
          </div>
          <div className="alphabet" aria-label="Browse by letter"><button className={letter === "All" ? "selected" : ""} onClick={() => setLetter("All")}>All</button>{alphabet.map((item) => <button key={item} className={letter === item ? "selected" : ""} onClick={() => setLetter(item)}>{item}</button>)}</div>
          {filtered.length ? <div className="article-grid">{filtered.map((article) => <Link href={`/articles/${article.slug}`} className="article-card" key={article.slug}><span className="article-letter">{article.letter}</span><span className="article-main"><span className="article-meta"><em>{article.category}</em><small><Icon name="clock" /> {article.readTime}</small></span><strong>{article.title}</strong><p>{article.summary}</p><span className="read-link">Read guide <Icon name="arrow" /></span></span></Link>)}</div> : <div className="empty-state"><span><Icon name="search" /></span><h3>No guides match that search—yet.</h3><p>Try a broader phrase, browse all topics, or ask our support team.</p><div><button onClick={() => { setQuery(""); setCategory("All topics"); setLetter("All"); }}>Show all guides</button><a href="mailto:support@talktuit.com">Ask support</a></div></div>}
        </div>
      </section>

      <section className="help-banner page-shell">
        <div className="help-illustration"><span className="bubble b1" /><span className="bubble b2" /><Icon name="chat" /></div>
        <div><span className="section-kicker light">Still stuck?</span><h2>Let a real person take a look.</h2><p>Tell us what you expected, what happened and where you saw it. Screenshots help, too.</p></div>
        <a href="mailto:support@talktuit.com?subject=TalkTuit%20support%20request">Start a support request <Icon name="arrow" /></a>
      </section>
    </>
  );
}
