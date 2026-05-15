import type { Message } from "./types";
import { Avatar, Button, Surface } from "@heroui/react";
import { useMemo } from "react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isEmptyConversationState: boolean;
  quickPrompts: readonly string[];
  onQuickPromptSelect: (prompt: string) => void;
  avatarSrc: string;
}

// Extracts visible text from a message's parts
function getTextContent(msg: Message): string {
  if (msg.parts) {
    return msg.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as any).text)
      .join("");
  }
  return (msg as any).content || "";
}

// Returns true if any assistant message has an active tool part
function hasActiveToolCall(messages: Message[]): boolean {
  return messages.some(
    (m) =>
      m.role === "assistant" &&
      m.parts?.some((p) => p.type.startsWith("tool-")),
  );
}

function ThinkingIndicator({ isToolActive }: { isToolActive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {isToolActive ? (
        <>
          <span className="text-[13px] text-gray-500">Thinking hard...</span>
        </>
      ) : (
        <div className="loader" />
      )}
    </div>
  );
}

export function ChatMessages({
  messages,
  isLoading,
  isEmptyConversationState,
  quickPrompts,
  onQuickPromptSelect,
  avatarSrc,
}: ChatMessagesProps) {
  const isMessageEmpty = messages.length === 0;

  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const lastAssistantHasText = lastAssistantMsg
    ? getTextContent(lastAssistantMsg).trim() !== ""
    : false;
  const showLoadingBubble = isLoading && !lastAssistantHasText;
  const isToolActive = hasActiveToolCall(messages);

  const AiAvatar = useMemo(
    () => (
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10 rounded-full border-2 border-white/20">
          <Avatar.Image alt="AI Assistant" src={avatarSrc} />
          <Avatar.Fallback>AI</Avatar.Fallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full" />
      </div>
    ),
    [avatarSrc],
  );

  const WelcomeMessage = useMemo(
    () => (
      <div className="flex items-end gap-2 w-full mt-2">
        <div className="mb-2">{AiAvatar}</div>
        <Surface
          className="p-3.5 text-[15px] leading-relaxed max-w-[80%] bg-slate-100 text-gray-800 rounded-3xl"
          variant="default"
        >
          <p className="whitespace-pre-wrap">
            Hi! 👋 Are you interested in ABA Therapy?
          </p>
        </Surface>
      </div>
    ),
    [AiAvatar],
  );

  return (
    <div
      className={`flex flex-col h-full ${isEmptyConversationState ? "pt-3 pb-2" : "py-5"}`}
    >
      {isMessageEmpty ? (
        // Empty state — welcome message + quick prompts
        <div className="flex flex-col flex-1 pl-2 pr-4 pb-1">
          {WelcomeMessage}
          <div className="flex flex-row flex-wrap justify-start gap-2 pt-3 pl-12 mt-auto">
            {quickPrompts.slice(0, 3).map((prompt) => (
              <Button
                key={prompt}
                onClick={() => onQuickPromptSelect(prompt)}
                variant="outline"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        // Conversation view
        <div className="flex flex-col gap-4 pl-2 pr-4 pb-2">
          {/* Agent profile header */}
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 rounded-full">
              <Avatar.Image alt="Agent" src={avatarSrc} />
              <Avatar.Fallback>JD</Avatar.Fallback>
            </Avatar>
            <span className="text-black text-[13px] font-semibold mt-1">
              Jennifer
            </span>
          </div>

          {/* Disclaimer */}
          <Surface
            className="flex min-w-[320px] flex-col gap-3 rounded-3xl border p-4 text-gray-400 text-[12px] leading-relaxed m-4"
            variant="transparent"
          >
            By using the chat feature, you agree to our terms and acknowledge
            our privacy policy.
            <br />
            Your chat may be recorded. {"\u24D8"}
          </Surface>

          {WelcomeMessage}

          {/* Message list */}
          {messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            const textContent = getTextContent(msg);

            // Skip assistant messages with no visible text (tool-only steps)
            if (isAssistant && !textContent.trim()) return null;

            return (
              <div
                key={msg.id}
                className={`flex w-full ${!isAssistant ? "justify-end" : "justify-start gap-2"}`}
              >
                {isAssistant && <div className="mt-auto">{AiAvatar}</div>}

                <div
                  className={`flex flex-col gap-2 max-w-[80%] ${!isAssistant ? "items-end ml-auto" : "items-start"}`}
                >
                  <Surface
                    className={`p-3.5 text-[15px] leading-relaxed ${
                      !isAssistant
                        ? "bg-[#24408B] text-white rounded-3xl"
                        : "bg-slate-100 text-gray-800 rounded-3xl"
                    }`}
                    variant="default"
                  >
                    {(msg as any).image && (
                      <img
                        src={(msg as any).image}
                        alt="Attachment"
                        className="max-w-full rounded-2xl mb-2"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{textContent}</p>
                  </Surface>
                </div>
              </div>
            );
          })}

          {/* Loading / thinking bubble */}
          {showLoadingBubble && (
            <div className="flex gap-2 w-full mt-2">
              <div className="mt-auto">{AiAvatar}</div>
              <Surface
                className="px-4 py-3 bg-slate-100 rounded-3xl"
                variant="default"
              >
                <ThinkingIndicator isToolActive={isToolActive} />
              </Surface>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
