// app/api/chat/route.js
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createClient } from "@supabase/supabase-js";

// Import your decoupled logic
import { ELLIE_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import { getAgentTools } from "@/lib/agent/tools";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { messages, sessionId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      stopWhen: stepCountIs(10), // ← replaces maxSteps
      system: ELLIE_SYSTEM_PROMPT,
      messages: modelMessages,
      tools: getAgentTools(supabase, sessionId),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("API Crash:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
