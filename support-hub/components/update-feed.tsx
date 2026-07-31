"use client";

import { useEffect, useMemo, useState } from "react";
import { curatedUpdates, type ProductUpdate } from "../lib/updates";
import { Icon } from "./icons";

export function UpdateFeed() {
  const [updates, setUpdates] = useState<ProductUpdate[]>(curatedUpdates);
  const [filter, setFilter] = useState("All updates");
  const [live, setLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/updates", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { updates?: ProductUpdate[] }) => { if (data.updates?.length) { setUpdates(data.updates); setLive(true); } })
      .catch(() => setLive(false));
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => ["All updates", ...Array.from(new Set(updates.map((item) => item.category)))], [updates]);
  const shown = filter === "All updates" ? updates : updates.filter((item) => item.category === filter);

  return (
    <>
      <div className="update-toolbar"><div className="update-status"><span className={live ? "live-dot" : "live-dot standby"} /><strong>{live ? "Live update monitor connected" : "Latest verified digest"}</strong><small>{live ? "New releases are checked automatically" : "The live feed will reconnect automatically"}</small></div><label className="select-wrap"><Icon name="filter" /><select value={filter} onChange={(event) => setFilter(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <div className="timeline">{shown.map((update, index) => <article className="timeline-item" id={update.id} key={update.id}><div className="timeline-rail"><span>{index + 1}</span></div><div className="timeline-card"><div className="update-card-meta"><time>{update.date}</time><span className={update.type === "New" ? "type-new" : "type-improved"}>{update.type}</span><em>{update.category}</em></div><h2>{update.title}</h2><p>{update.summary}</p><div className="update-note"><Icon name="spark" /><span><strong>What this means for you</strong>{update.type === "New" ? "There’s a new option available when you need it; your existing setup stays in place unless noted." : "Your familiar workflow now has a faster or more flexible path."}</span></div></div></article>)}</div>
    </>
  );
}

