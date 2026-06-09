import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { getSystemPrompt } from "@/lib/agent/prompt";
import { getAgentTools } from "@/lib/agent/tools";
import { supabase } from "@/lib/supabase";

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

    // Check if intake is completed dynamically by querying the database and checking message history
    let isCompleted = false;
    if (sessionId) {
      try {
        let { data: lead, error: dbError } = await supabase
          .from("leads")
          .select("location, email, phone, insurance_provider, parent_name, child_name, updated_at")
          .eq("session_id", sessionId)
          .maybeSingle();

        // Fallback in case updated_at column is missing in the database schema
        if (dbError && dbError.message && dbError.message.includes("updated_at")) {
          const retry = await supabase
            .from("leads")
            .select("location, email, phone, insurance_provider, parent_name, child_name")
            .eq("session_id", sessionId)
            .maybeSingle();
          lead = retry.data;
          dbError = retry.error;
        }

        if (dbError) {
          console.error("Database query error:", dbError);
        } else if (lead) {
          // Check if all required fields are filled (not null, not undefined, and not empty strings)
          const hasRequiredFields = !!(
            lead.location?.trim() &&
            lead.email?.trim() &&
            lead.phone?.trim() &&
            lead.insurance_provider?.trim() &&
            lead.parent_name?.trim() &&
            lead.child_name?.trim()
          );

          if (hasRequiredFields) {
            // Check for 10 minutes of inactivity (600,000 ms)
            let isInactive = false;
            const TEN_MINUTES_MS = 10 * 60 * 1000;

            // 1. Check database last update timestamp
            if (lead.updated_at) {
              const lastUpdate = new Date(lead.updated_at).getTime();
              if (Date.now() - lastUpdate >= TEN_MINUTES_MS) {
                isInactive = true;
                console.log(`Locking session due to DB inactivity: ${Date.now() - lastUpdate}ms`);
              }
            }

            // 2. Check message history timestamp (fallback/supplement)
            if (!isInactive && messages.length >= 2) {
              const prevMsg = messages[messages.length - 2];
              if (prevMsg && prevMsg.createdAt) {
                const prevTime = new Date(prevMsg.createdAt).getTime();
                if (Date.now() - prevTime >= TEN_MINUTES_MS) {
                  isInactive = true;
                  console.log(`Locking session due to message history inactivity: ${Date.now() - prevTime}ms`);
                }
              }
            }

            // If the user has been inactive for 10 minutes after completing the required fields, lock it
            if (isInactive) {
              isCompleted = true;
            }

            // Also check if they finished the optional steps normally
            if (!isCompleted) {
              // Check if we have asked the last optional checklist question (goals) and the user has responded.
              const hasAskedGoals = messages.some(msg => 
                msg.role === "assistant" && 
                (msg.content.toLowerCase().includes("goals") || msg.content.toLowerCase().includes("behavioral"))
              );

              if (hasAskedGoals) {
                const lastGoalsIndex = messages.findLastIndex(msg =>
                  msg.role === "assistant" &&
                  (msg.content.toLowerCase().includes("goals") || msg.content.toLowerCase().includes("behavioral"))
                );
                // If there is any user message after the assistant asked about goals, they answered/skipped it.
                const hasUserRespondedToGoals = messages.slice(lastGoalsIndex + 1).some(msg => msg.role === "user");
                if (hasUserRespondedToGoals) {
                  isCompleted = true;
                }
              }

              // Also check if any final completion thank-you message exists in the assistant history
              const hasCompletionMessage = messages.some(msg =>
                msg.role === "assistant" &&
                (msg.content.toLowerCase().includes("successfully received") || 
                 msg.content.toLowerCase().includes("intake is complete") ||
                 msg.content.toLowerCase().includes("thank you! we have everything") ||
                 msg.content.toLowerCase().includes("intake process is complete"))
              );
              if (hasCompletionMessage) {
                isCompleted = true;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error checking lead completion:", err);
      }
    }


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

    const allTools = getAgentTools(sessionId);
    const tools = { ...allTools };
    if (isCompleted) {
      delete tools.updateLeadProgress;
      console.log("Intake is complete: updateLeadProgress tool removed from agent.");
    }

    const result = streamText({
      model: google("gemini-3.1-flash-lite"),
      stopWhen: stepCountIs(10),
      system: getSystemPrompt(isCompleted),
      messages: modelMessages,
      tools,
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
