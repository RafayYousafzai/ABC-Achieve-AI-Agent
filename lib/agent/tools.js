import { tool } from "ai";
import { z } from "zod";
import { retrieveKnowledge } from "./retrieval"; // Fixed import name

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function saveLead(sessionId, data) {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v?.toString().trim()),
  );

  if (Object.keys(clean).length === 0) return "Nothing to save.";

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?on_conflict=session_id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ session_id: sessionId, ...clean }),
    },
  );

  if (!res.ok) {
    const errBody = await res.json();
    console.error("Supabase saveLead error:", errBody);
    return `Error: ${JSON.stringify(errBody)}`;
  }

  return "Progress saved successfully.";
}

export const getAgentTools = (sessionId) => ({
  updateLeadProgress: tool({
    description:
      "Updates the database with lead information. Call this whenever new funnel info is provided.",
    inputSchema: z.object({
      location: z.string().optional(),
      insurance_provider: z.string().optional(),
      parent_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      child_name: z.string().optional(),
      child_dob: z.string().optional(),
      address: z.string().optional(),
      preferred_schedule: z.string().optional(),
      behavior_goals: z.string().optional(),
      insurance_card_url: z.string().optional(),
    }),
    execute: async (data) => saveLead(sessionId, data),
  }),

  queryKnowledgeBase: tool({
    description:
      "Answers questions about ABA therapy, insurance, locations, or company services. Only call for answering questions, NOT for saving user data.",
    inputSchema: z.object({
      category: z
        .enum(["insurance", "locations", "clinical", "company", "guides"])
        .describe(
          "The matching directory category based on the user's question.",
        ),
      searchQuery: z
        .string()
        .describe(
          "The precise nouns from the user query to search against tags (e.g., 'warner robins medicaid', 'discrete trial training').",
        ),
    }),
    execute: async ({ category, searchQuery }) => {
      console.log(`>>> ROUTED RAG TRIGGERED: [${category}] - ${searchQuery}`);

      if (!searchQuery) {
        return "Please ask the user to clarify what specific information they are seeking.";
      }

      // Pass both the isolated category and the query to the new engine
      const context = retrieveKnowledge(category, searchQuery);
      return `Use the following verified company documents to answer the user's question:\n${context}`;
    },
  }),
});
