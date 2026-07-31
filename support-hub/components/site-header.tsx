"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";

export function SiteHeader({ active = "home" }: { active?: "home" | "topics" | "updates" | "article" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label="TalkTuit Support Hub home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span className="brand-copy"><strong>TalkTuit</strong><small>Support Hub</small></span>
        </Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          <Icon name={open ? "close" : "menu"} />
        </button>
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Primary navigation">
          <Link href="/" className={active === "home" ? "active" : ""}>Overview</Link>
          <Link href="/#knowledge">Knowledge A–Z</Link>
          <Link href="/topics" className={active === "topics" ? "active" : ""}>Topic library</Link>
          <Link href="/updates" className={active === "updates" ? "active" : ""}>What’s new</Link>
          <a className="nav-cta" href="mailto:support@talktuit.com?subject=TalkTuit%20support%20request"><Icon name="ticket" /> Get support</a>
        </nav>
      </div>
    </header>
  );
}
