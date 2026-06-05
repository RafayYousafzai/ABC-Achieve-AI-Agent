import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { ELLIE_SYSTEM_PROMPT } from "@/lib/agent/prompt";
import { getAgentTools } from "@/lib/agent/tools";

export const runtime = "edge";

export async function POST(req) {
  try {
    const body = await req.json();

    // Warm-up/ping request to wake up the serverless function without calling AI APIs
    if (body?.ping) {
      return new Response(JSON.stringify({ ok: true, message: "pong" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, sessionId } = body;

    // Merge consecutive assistant messages to prevent Gemini API 400 errors due to consecutive model turns
    const mergedMessages = [];
    for (const msg of messages) {
      if (
        mergedMessages.length > 0 &&
        msg.role === "assistant" &&
        mergedMessages[mergedMessages.length - 1].role === "assistant"
      ) {
        const lastMsg = mergedMessages[mergedMessages.length - 1];
        
        // Merge contents
        if (msg.content) {
          lastMsg.content = (lastMsg.content || "") + "\n\n" + msg.content;
        }
        
        // Merge parts if they exist
        if (msg.parts && lastMsg.parts) {
          lastMsg.parts = [...lastMsg.parts, ...msg.parts];
        } else if (msg.parts) {
          lastMsg.parts = msg.parts;
        }
      } else {
        mergedMessages.push({ ...msg });
      }
    }

    // Ensure the message history starts with a user message for Gemini API compatibility.
    // If it starts with an assistant or tool message, shift them off until we find a user message.
    const sanitizedMessages = [...mergedMessages];
    while (sanitizedMessages.length > 0 && sanitizedMessages[0].role !== "user") {
      sanitizedMessages.shift();
    }
    
    const finalMessages = sanitizedMessages.length > 0 ? sanitizedMessages : mergedMessages;

    // Inject file/image URLs into user message text context so Gemini can see the Supabase URLs
    const messagesWithFileUrls = finalMessages.map(msg => {
      if (msg.role !== "user") return msg;
      
      const urls = [];
      
      // Check experimental_attachments
      if (msg.experimental_attachments && Array.isArray(msg.experimental_attachments)) {
        msg.experimental_attachments.forEach(att => {
          if (att.url) urls.push(att.url);
        });
      }
      
      // Check parts
      if (msg.parts && Array.isArray(msg.parts)) {
        msg.parts.forEach(part => {
          if (part.url) urls.push(part.url);
          else if (part.image && typeof part.image === "string" && part.image.startsWith("http")) urls.push(part.image);
        });
      }
      
      // Check files
      if (msg.files && Array.isArray(msg.files)) {
        msg.files.forEach(file => {
          if (file.url) urls.push(file.url);
        });
      }
      
      if (urls.length > 0) {
        const annotation = urls.map(url => `\n[Uploaded File URL: ${url}]`).join("");
        const newMsg = {
          ...msg,
          content: (msg.content || "") + annotation
        };
        
        // Ensure parts are updated as well since the SDK converts parts if they exist
        if (newMsg.parts && Array.isArray(newMsg.parts)) {
          newMsg.parts = newMsg.parts.map(p => ({ ...p }));
          const textPart = newMsg.parts.find(p => p.type === "text");
          if (textPart) {
            textPart.text = (textPart.text || "") + annotation;
          } else {
            newMsg.parts.push({ type: "text", text: annotation });
          }
        }
        
        return newMsg;
      }
      
      return msg;
    });

    console.log("=== DEBUG API CHAT ===");
    console.log("Original Messages Count:", messages.length);
    console.log("Original Messages:", JSON.stringify(messages, null, 2));
    console.log("Merged Messages:", JSON.stringify(mergedMessages, null, 2));
    console.log("Final Messages (Sanitized):", JSON.stringify(finalMessages, null, 2));
    console.log("Messages With File URLs:", JSON.stringify(messagesWithFileUrls, null, 2));

    const modelMessages = await convertToModelMessages(messagesWithFileUrls);
    console.log("Model Messages:", JSON.stringify(modelMessages, null, 2));

    const result = streamText({
      model: google("gemini-3.1-flash-lite"),
      stopWhen: stepCountIs(10),
      system: ELLIE_SYSTEM_PROMPT,
      messages: modelMessages,
      tools: getAgentTools(sessionId),
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
