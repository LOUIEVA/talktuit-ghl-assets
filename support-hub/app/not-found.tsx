import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { Icon } from "../components/icons";

export default function NotFound() {
  return <><SiteHeader /><main className="not-found page-shell"><span>404</span><h1>That guide stepped away.</h1><p>The link may have changed, but the answer is probably still in the knowledge base.</p><div><Link href="/#knowledge">Browse A–Z guides <Icon name="arrow" /></Link><a href="mailto:support@talktuit.com">Ask support</a></div></main><SiteFooter /></>;
}

