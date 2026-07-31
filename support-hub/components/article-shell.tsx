import Link from "next/link";
import type { Article } from "../lib/kb-data";
import { Icon } from "./icons";

export function ArticleShell({ article }: { article: Article }) {
  return (
    <main>
      <section className="article-hero">
        <div className="page-shell article-hero-inner">
          <div className="breadcrumbs"><Link href="/">Support Hub</Link><Icon name="chevron" /><Link href="/#knowledge">{article.category}</Link><Icon name="chevron" /><span>{article.title}</span></div>
          <div className="article-title-grid"><div><span className="article-kicker"><b>{article.letter}</b>{article.category}</span><h1>{article.title}</h1><p>{article.summary}</p><div className="article-byline"><span><Icon name="clock" /> {article.readTime} read</span><span>Updated {article.updated}</span><span><Icon name="shield" /> TalkTuit verified</span></div></div><aside className="article-outcome"><span><Icon name="spark" /></span><div><small>By the end</small><strong>{article.outcome}</strong></div></aside></div>
        </div>
      </section>
      <section className="article-layout page-shell">
        <article className="article-body">
          <div className="article-intro"><span>Before you begin</span><p>Sign in to your workspace in another tab. Use a test contact or low-risk example whenever the guide asks you to check a customer-facing step.</p></div>
          <h2 id="steps">Step by step</h2>
          <ol className="steps-list">{article.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
          {article.sections?.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
          <div className="tips-box" id="tips"><div className="tips-heading"><span><Icon name="spark" /></span><div><small>TalkTuit tips</small><h2>Small details that make this work better</h2></div></div><ul>{article.tips.map((tip) => <li key={tip}><Icon name="check" />{tip}</li>)}</ul></div>
          <div className="article-feedback"><div><strong>Was this guide useful?</strong><span>Help us keep the knowledge base sharp.</span></div><div><a href={`mailto:support@talktuit.com?subject=Helpful%20guide:%20${encodeURIComponent(article.title)}`}>Yes, it helped</a><a href={`mailto:support@talktuit.com?subject=Improve%20guide:%20${encodeURIComponent(article.title)}`}>It needs work</a></div></div>
        </article>
        <aside className="article-sidebar"><div className="on-this-page"><span>On this page</span><a href="#steps">Step by step</a><a href="#tips">TalkTuit tips</a><a href="#support">Get more help</a></div><div className="sidebar-help" id="support"><span><Icon name="chat" /></span><strong>Need a hand?</strong><p>Send us the page name and a screenshot. We’ll help you find the next step.</p><a href="mailto:support@talktuit.com">Contact support <Icon name="arrow" /></a></div><Link className="back-to-kb" href="/#knowledge"><Icon name="book" /> Browse all A–Z guides</Link></aside>
      </section>
    </main>
  );
}

