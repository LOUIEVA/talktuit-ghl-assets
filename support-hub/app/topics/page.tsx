import type { Metadata } from "next";
import Link from "next/link";
import localKnowledgeIndex from "../../data/tutorial-index.json";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { TopicLibrary } from "../../components/topic-library";
import { Icon } from "../../components/icons";
import { getKnowledgeIndex } from "../../internal/knowledge-index";

export const metadata: Metadata = { title: "Topic Library", description: `Search ${localKnowledgeIndex.meta.total} source-backed TalkTuit tutorial topics.` };
export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const knowledgeIndex = await getKnowledgeIndex();

  return <><SiteHeader active="topics" /><main><section className="topics-hero"><div className="page-shell"><div className="breadcrumbs light-crumbs"><Link href="/">Support Hub</Link><Icon name="chevron" /><span>Topic library</span></div><div className="topics-hero-grid"><div><span className="eyebrow"><Icon name="book" /> Source-backed learning</span><h1>{knowledgeIndex.meta.total} topics.<br/><em>One simple search.</em></h1><p>Search the full learning index for the exact feature, setting or problem you’re working on—already translated into TalkTuit language.</p></div><div className="topic-count-card"><small>Indexed coverage</small><strong>{knowledgeIndex.meta.total}</strong><span>tutorial topics</span><div>{knowledgeIndex.categories.slice(0, 4).map((item) => <p key={item.name}><b>{item.count}</b>{item.name}</p>)}</div></div></div></div></section><section className="topics-content page-shell"><div className="updates-intro"><span className="section-kicker">Explore the library</span><h2>Find the exact topic you need</h2><p>Use search, a category or the A–Z index. Every result connects to the nearest TalkTuit guide, with human support one click away.</p></div><TopicLibrary knowledgeIndex={knowledgeIndex} /></section></main><SiteFooter /></>;
}
