import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Force the Edge Runtime to eliminate cold starts
export const runtime = "edge";

// Initialize Supabase (Use REST-compatible client for Edge)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    system: `You are Ellie, the intake assistant for Achievement Behavior Services.
             Your goal is to qualify leads for ABA therapy through a specific funnel:
             1. Confirm Interest
             2. Location (NY, NJ, CT, GA, NC only)
             3. Insurance Provider
             4. Contact Info (Name, Phone, Email)
             5. Child Details (Name, DOB)

             VALIDATION RULES:
             - Rejest non-date formats for DOB (e.g., "7 years").
             - Reject invalid emails/phones.
             - If off-topic, steer back to ABA. If they persist, end chat.
             - ALWAYS call 'updateLeadProgress' as soon as you get a new piece of info.`,
    messages,
    tools: {
      // THE PROGRESSIVE SAVING TOOL
      updateLeadProgress: tool({
        description:
          "Updates the database with lead information as it is collected.",
        parameters: z.object({
          location: z.string().optional(),
          insurance_provider: z.string().optional(),
          parent_name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          child_name: z.string().optional(),
          child_dob: z.string().optional(),
        }),
        execute: async (data) => {
          // Progressive Upserting: Updates only the fields provided
          const { error } = await supabase
            .from("leads")
            .upsert({ session_id: sessionId, ...data, updated_at: new Date() });

          return error ? "Error saving data" : "Progress saved.";
        },
      }),

      // THE FAST RAG TOOL
      queryKnowledgeBase: tool({
        description: "Answers questions about ABA therapy or company services.",
        parameters: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          // Semantic search logic would go here
          return "ABA therapy is a personalized method to teach skills and reduce behaviors.";
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
