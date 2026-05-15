// lib/agent/tools.js
import { tool } from "ai";
import { z } from "zod";

console.log("Tools loaded");
console.log("tool function keys:", Object.keys(tool.toString().slice(0, 200)));

export const getAgentTools = (supabase, sessionId) => ({
  updateLeadProgress: tool({
    description:
      "Updates the database with lead information. Call this whenever the user provides location, insurance, name, email, phone, or child details.",
    inputSchema: z.object({
      // ← NOT "parameters"
      location: z.string().optional(),
      insurance_provider: z.string().optional(),
      parent_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      child_name: z.string().optional(),
      child_dob: z.string().optional(),
    }),
    execute: async (data) => {
      const clean = Object.fromEntries(
        Object.entries(data).filter(
          ([_, v]) => v && v.toString().trim() !== "",
        ),
      );

      console.log(">>> DB UPDATE:", clean);

      if (Object.keys(clean).length === 0) {
        return "Nothing to save.";
      }

      const { error } = await supabase.from("leads").upsert({
        session_id: sessionId,
        ...clean,
        updated_at: new Date().toISOString(),
      });
      return error ? `Error: ${error.message}` : "Progress saved successfully.";
    },
  }),

  queryKnowledgeBase: tool({
    description: "Answers questions about ABA therapy or company services.",
    inputSchema: z.object({
      // ← NOT "parameters"
      query: z.string(),
    }),
    execute: async ({ query }) => {
      return "ABA therapy is a personalized method to teach skills and reduce behaviors.";
    },
  }),
});
