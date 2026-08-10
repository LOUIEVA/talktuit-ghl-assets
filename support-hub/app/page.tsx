import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import { SupportHub } from "../components/support-hub";
import { SiteFooter } from "../components/site-footer";

export const metadata: Metadata = {
  title: { absolute: "TalkTuit Support Hub | Answers from A to Z" },
  description: "Search TalkTuit guides, follow step-by-step instructions and see what’s new in your workspace.",
};

export default function Home() {
  return <><SiteHeader active="home" /><main><SupportHub /></main><SiteFooter /></>;
}
