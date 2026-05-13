import { openai } from "@ai-sdk/openai";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { messages, sessionId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // ✅ Docs: convertToModelMessages must be awaited
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `You are Ellie, the intake assistant for Achievement Behavior Services.
               Your goal is to qualify leads for ABA therapy through a specific funnel:
               1. Confirm Interest
               2. Location (NY, NJ, CT, GA, NC only)
               3. Insurance Provider
               4. Contact Info (Name, Phone, Email)
               5. Child Details (Name, DOB)

               VALIDATION RULES:
               - Reject non-date formats for DOB (e.g., "7 years").
               - Reject invalid emails/phones.
               - If off-topic, steer back to ABA. If they persist, end chat.
               - ALWAYS call 'updateLeadProgress' as soon as you get a new piece of info.`,
      messages: modelMessages,
      tools: {
        updateLeadProgress: tool({
          description:
            "Updates the database with lead information as it is collected.",
          // ✅ SDK 5.0 docs: 'parameters' renamed to 'inputSchema'
          inputSchema: z.object({
            location: z.string().optional(),
            insurance_provider: z.string().optional(),
            parent_name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            child_name: z.string().optional(),
            child_dob: z.string().optional(),
          }),
          execute: async (data) => {
            const { error } = await supabase.from("leads").upsert({
              session_id: sessionId,
              ...data,
              updated_at: new Date().toISOString(),
            });
            return error
              ? `Error saving data: ${error.message}`
              : "Progress saved.";
          },
        }),

        queryKnowledgeBase: tool({
          description:
            "Answers questions about ABA therapy or company services.",
          // ✅ SDK 5.0 docs: 'parameters' renamed to 'inputSchema'
          inputSchema: z.object({ query: z.string() }),
          execute: async ({ query }) => {
            return "ABA therapy is a personalized method to teach skills and reduce behaviors.";
          },
        }),
      },
    });

    // ✅ SDK 5.0 docs: toDataStreamResponse() → toUIMessageStreamResponse()
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("API Crash:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
