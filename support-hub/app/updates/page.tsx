import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { UpdateFeed } from "../../components/update-feed";
import { Icon } from "../../components/icons";

export const metadata: Metadata = { title: "What’s New", description: "A client-friendly digest of the latest improvements in your TalkTuit workspace." };

export default function UpdatesPage() {
  return <><SiteHeader active="updates" /><main><section className="updates-hero"><div className="page-shell"><div className="breadcrumbs light-crumbs"><Link href="/">Support Hub</Link><Icon name="chevron" /><span>What’s new</span></div><div className="updates-hero-grid"><div><span className="eyebrow"><span className="live-dot" /> Product updates</span><h1>What changed.<br/><em>Why it matters.</em></h1><p>A plain-language view of the latest improvements, with the details your team needs and none of the release-note noise.</p></div><div className="update-hero-card"><span><Icon name="update" /></span><strong>Always current</strong><p>The update monitor checks the source feed automatically, then rewrites each item into client-safe TalkTuit language.</p><small><Icon name="shield" /> Brand names are removed before publishing</small></div></div></div></section><section className="updates-content page-shell"><div className="updates-intro"><span className="section-kicker">Release digest</span><h2>The latest improvements</h2><p>New items appear first. Existing settings stay as they are unless an update specifically requires action.</p></div><UpdateFeed /></section><section className="update-help page-shell"><div><Icon name="chat" /></div><span><strong>Not sure whether an update affects you?</strong><p>Send us the feature name and what you’re trying to accomplish.</p></span><a href="mailto:support@talktuit.com?subject=Question%20about%20a%20workspace%20update">Ask TalkTuit support <Icon name="arrow" /></a></section></main><SiteFooter /></>;
}

