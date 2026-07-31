import Link from "next/link";
import { Icon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span className="brand-copy"><strong>TalkTuit</strong><small>Support Hub</small></span>
          </Link>
          <p>Clear answers for every part of your workspace.</p>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><Link href="/#knowledge">Knowledge A–Z</Link><Link href="/topics">Topic library</Link><Link href="/updates">What’s new</Link></div>
          <div><strong>Help</strong><a href="mailto:support@talktuit.com">Contact support</a><a href="mailto:support@talktuit.com?subject=Article%20feedback">Suggest an article</a><a href="https://app.talktuit.com">Open your workspace <Icon name="external" /></a></div>
        </div>
      </div>
      <div className="footer-base"><span>© {new Date().getFullYear()} TalkTuit. All rights reserved.</span><span className="grey-label-note"><Icon name="shield" /> Client-safe, TalkTuit-authored guidance</span></div>
    </footer>
  );
}
