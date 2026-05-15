import { tool } from "ai";
import { z } from "zod";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function saveLead(sessionId, data) {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v?.toString().trim()),
  );

  if (Object.keys(clean).length === 0) return "Nothing to save.";

  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ session_id: sessionId, ...clean }),
  });

  return res.ok ? "Progress saved successfully." : `Error: ${res.statusText}`;
}

export const getAgentTools = (sessionId) => ({
  updateLeadProgress: tool({
    description:
      "Updates the database with lead information. Call this whenever the user provides location, insurance, name, email, phone, or child details.",
    inputSchema: z.object({
      location: z.string().optional(),
      insurance_provider: z.string().optional(),
      parent_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      child_name: z.string().optional(),
      child_dob: z.string().optional(),
    }),
    execute: async (data) => saveLead(sessionId, data),
  }),

  queryKnowledgeBase: tool({
    description:
      "Answers questions about ABA therapy or company services. Only call for ABA questions, NOT for saving user data.",
    inputSchema: z.object({
      query: z.string(),
    }),
    execute: async () =>
      "ABA therapy is a personalized, evidence-based method to teach skills and reduce challenging behaviors in children. Achievement Behavior Services offers ABA therapy in NY, NJ, CT, GA, and NC.",
  }),
});
