import localKnowledgeIndex from "../data/tutorial-index.json";

export type KnowledgeIndex = typeof localKnowledgeIndex;

const remoteCatalogUrl =
  "https://raw.githubusercontent.com/LOUIEVA/talktuit-ghl-assets/main/support-hub/data/tutorial-index.json";

function isValidCatalog(value: unknown): value is KnowledgeIndex {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<KnowledgeIndex>;
  return Boolean(
    candidate.meta &&
      typeof candidate.meta.total === "number" &&
      Array.isArray(candidate.categories) &&
      Array.isArray(candidate.tutorials) &&
      candidate.meta.total === candidate.tutorials.length,
  );
}

export async function getKnowledgeIndex(): Promise<KnowledgeIndex> {
  try {
    const response = await fetch(remoteCatalogUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return localKnowledgeIndex;

    const catalog: unknown = await response.json();
    return isValidCatalog(catalog) ? catalog : localKnowledgeIndex;
  } catch {
    return localKnowledgeIndex;
  }
}
