// lib/agent/retrieval.js
import compiledKnowledge from "./compiled-knowledge.json";

function scoreEntry(searchTerms, rawQuery, entry) {
  let score = 0;
  const titleLower = (entry.title || "").toLowerCase();
  const tagsLower = (entry.tags || []).map((t) => t.toLowerCase());

  // 1. MASSIVE BONUS: If the exact full phrase is in the title (e.g., "discrete trial training")
  if (titleLower.includes(rawQuery)) {
    score += 100;
  }

  // 2. Iterate through isolated nouns/keywords
  searchTerms.forEach((term) => {
    // Penalize generic terms so they don't rig the search
    if (
      ["autism", "aba", "therapy", "center", "child", "children"].includes(term)
    ) {
      if (titleLower.includes(term)) score += 1;
    } else {
      // High value for unique words matching title (e.g., "flapping", "timeline")
      if (titleLower.includes(term)) score += 15;

      // Massive value for hitting explicit tags (e.g., "warner robins", "medicaid")
      if (tagsLower.includes(term)) score += 40;
      else if (tagsLower.some((tag) => tag.includes(term))) score += 15;
    }
  });

  return score;
}

export function retrieveKnowledge(category, searchQuery, limit = 3) {
  // 1. Instantly throw away files from the wrong folder (Category Isolation)
  const filteredKnowledge = compiledKnowledge.filter(
    (entry) => !category || entry.category === category,
  );

  // 2. Clean the query and strip conversational stop-words
  const rawQuery = (searchQuery || "").toLowerCase();
  const stopWords = new Set([
    "do",
    "you",
    "provide",
    "in",
    "home",
    "therapy",
    "and",
    "accept",
    "state",
    "the",
    "for",
    "is",
    "a",
    "an",
    "to",
    "our",
    "we",
    "here",
    "guys",
    "live",
    "my",
    "what",
    "how",
    "why",
  ]);

  const searchTerms = rawQuery
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // 3. Score and Sort
  const ranked = filteredKnowledge
    .map((entry) => ({
      ...entry,
      score: scoreEntry(searchTerms, rawQuery, entry),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // ─── DIAGNOSTIC LOG ──────────────────────────────────────────────
  console.log("\n=================== RAG RETRIEVAL ENGINE ===================");
  console.log(
    `Category Filter: [${category ? category.toUpperCase() : "NONE"}]`,
  );
  console.log(`Query Terms: [${searchTerms.join(", ")}]`);
  console.log(`Matched Documents: ${ranked.length}`);
  ranked.forEach((doc, idx) => {
    console.log(
      `  [${idx + 1}] Title: "${doc.title}" | Score: ${doc.score} | File: ${doc.file}`,
    );
  });
  console.log("============================================================\n");
  // ─────────────────────────────────────────────────────────────────

  if (ranked.length === 0) {
    return "No relevant company documents found for this specific topic. Ask the user to clarify or collect their contact info.";
  }

  let context = "";
  ranked.forEach((entry) => {
    context += `\n\n===== DOCUMENT: ${entry.title} =====\n\n${entry.content}\n\n`;
  });

  return context;
}
