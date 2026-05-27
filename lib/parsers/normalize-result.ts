import { NormalizedParseResult } from "@/types/parser";

/**
 * Normalizes LlamaParse v2 get() response data.
 * Expected to have been fetched with `expand=markdown_full,text_full,items,job_metadata,metadata`
 */
export function normalizeLlamaParseResult(data: any): NormalizedParseResult {
  const pagesCount = data.metadata?.pages?.length || null;

  return {
    raw_markdown: data.markdown_full || "",
    raw_text: data.text_full || "",
    parsed_items: data.items?.pages || [],
    metadata: {
      job_metadata: data.job_metadata || {},
      page_metadata: data.metadata || {}
    },
    pages_count:
      data.metadata?.pages?.length ??
      data.items?.pages?.length ??
      data.markdown?.pages?.length ??
      null,
  };
}

/**
 * Normalizes Reducto Job API response data.
 * Handles both inline chunk results and URL-based results.
 */
export async function normalizeReductoResult(data: any): Promise<NormalizedParseResult> {
  const parseResponse = data.result ?? data;
  const innerResult = parseResponse.result ?? parseResponse;

  let chunks = innerResult?.chunks || [];
  let blocks = innerResult?.blocks || [];

  if (innerResult?.type === "url" && innerResult?.url) {
    try {
      const res = await fetch(innerResult.url);

      if (!res.ok) {
        throw new Error(`Failed to fetch Reducto URL result: ${res.status}`);
      }

      const payload = await res.json();
      chunks = payload.chunks || payload.result?.chunks || [];
      blocks = payload.blocks || payload.result?.blocks || [];
    } catch (error) {
      console.error("[Reducto Normalize] Failed to fetch URL result:", error);
    }
  }

  const raw_markdown = chunks
    .map((c: any) => c.content)
    .filter(Boolean)
    .join("\n\n");

  return {
    raw_markdown,
    raw_text: raw_markdown,
    parsed_items: blocks.length > 0 ? blocks : chunks,
    metadata: {
      usage: parseResponse.usage || data.usage || {},
      studio_link: parseResponse.studio_link || null,
      job_type: data.type || "Parse",
    },
    pages_count:
      parseResponse.usage?.num_pages ??
      data.usage?.num_pages ??
      data.num_pages ??
      null,
  };
}