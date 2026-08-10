import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle } from "../../../lib/kb-data";
import { SiteHeader } from "../../../components/site-header";
import { SiteFooter } from "../../../components/site-footer";
import { ArticleShell } from "../../../components/article-shell";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: article.title, description: article.summary } : { title: "Guide not found" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <><SiteHeader active="article" /><ArticleShell article={article} /><SiteFooter /></>;
}

