import { db } from "../../db";
import { faqs, brandSettings } from "../../schema";
import { ilike, or } from "drizzle-orm";

export interface KnowledgeChunk {
  source: string;
  content: string;
}

export async function searchWebsiteKnowledge(userQuery: string): Promise<KnowledgeChunk[]> {
  const chunks: KnowledgeChunk[] = [];
  const queryLower = userQuery.toLowerCase().trim();

  try {
    // 1. Fetch relevant FAQs from database
    const faqResults = await db
      .select()
      .from(faqs)
      .where(
        or(
          ilike(faqs.question, `%${queryLower}%`),
          ilike(faqs.answer, `%${queryLower}%`)
        )
      )
      .limit(5);

    for (const faq of faqResults) {
      chunks.push({
        source: "Website FAQ",
        content: `Q: ${faq.question}\nA: ${faq.answer}`,
      });
    }

    // 2. Fetch Brand Info
    const brandInfo = await db.select().from(brandSettings).limit(1);
    if (brandInfo.length > 0) {
      chunks.push({
        source: "Brand Information",
        content: `Store Name: ${brandInfo[0].brandName}. We specialize in luxury fragrance, festive events, and curated lifestyle products.`,
      });
    }

    // 3. Static policies fallback if no FAQ hit
    if (chunks.length === 0 || queryLower.includes("shipping") || queryLower.includes("return")) {
      chunks.push({
        source: "Shipping & Return Policy",
        content:
          "We offer express insured shipping globally. Orders are dispatched within 24 hours. Returns & exchanges are accepted within 14 days of delivery for unopened items.",
      });
    }
  } catch (err) {
    console.error("RAG search error:", err);
  }

  return chunks;
}
