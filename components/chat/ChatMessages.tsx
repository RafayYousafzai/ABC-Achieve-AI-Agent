import type { Message } from "./types";
import { Avatar, Button, Spinner, Surface } from "@heroui/react";
import { useMemo } from "react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isEmptyConversationState: boolean;
  todayFormatted?: string;
  emptyStateMessage?: string;
  loadingMessage?: string;
  quickPrompts: readonly string[];
  onQuickPromptSelect: (prompt: string) => void;
  avatarSrc: string;
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
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  const latestAssistantContent = latestAssistantMessage
    ? latestAssistantMessage.content ||
      (latestAssistantMessage.parts
        ? latestAssistantMessage.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("")
        : "")
    : "";

  const shouldShowLoadingSpinner =
    isLoading &&
    messages.every(
      (m) =>
        m.role !== "assistant" ||
        (!m.parts?.some((p) => p.type === "text" && p.text.trim()) &&
          !m.parts?.some((p) => p.type === "tool-invocation")),
    );

  // Memoize Avatar to prevent re-rendering it unnecessarily on every keystroke
  const AiAvatar = useMemo(
    () => (
      <Avatar className="w-10 h-10 rounded-full border-2 border-white/20">
        <Avatar.Image alt="AI Assistant" src={avatarSrc} />
        <Avatar.Fallback>AI</Avatar.Fallback>
      </Avatar>
    ),
    [avatarSrc],
  );

  const isToolActive = messages.some(
    (m) =>
      m.role === "assistant" &&
      m.parts?.some((p) => p.type.startsWith("tool-")),
  );

  const firstStaticAssistantMessage = useMemo(() => {
    return (
      <div className="flex items-end gap-2 w-full mt-2">
        <div className="relative shrink-0 mb-2">
          {AiAvatar}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full" />
        </div>

        <Surface
          className={`p-3.5 text-[15px] leading-relaxed max-w-[80%] bg-slate-100 text-gray-800 rounded-3xl`}
          variant="default"
        >
          <p className="whitespace-pre-wrap">
            Hi! 👋 Are you interested in ABA Therapy?
          </p>
        </Surface>
      </div>
    );
  }, [AiAvatar]);

  console.log(
    "ALL messages:",
    messages.map((m) => ({
      role: m.role,
      parts: m.parts?.map((p) => p.type),
      content: (m as any).content,
    })),
  );

  return (
    <div
      className={`flex flex-col h-full ${
        isEmptyConversationState ? "pt-3 pb-2" : "py-5"
      }`}
    >
      {isMessageEmpty ? (
        <div className="flex flex-col flex-1 pl-2 pr-4 pb-1">
          {firstStaticAssistantMessage}

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
        <div className="flex flex-col gap-4 pl-2 pr-4 pb-2">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 rounded-full">
              <Avatar.Image alt="User" src={avatarSrc} />
              <Avatar.Fallback>JD</Avatar.Fallback>
            </Avatar>
            <span className="text-black text-[13px] font-semibold mt-1">
              Jennifer
            </span>
          </div>

          <Surface
            className="flex min-w-[320px] flex-col gap-3 rounded-3xl border p-4 text-gray-400 text-[12px] leading-relaxed m-4"
            variant="transparent"
          >
            By using the chat feature, you agree to our terms and acknowledge
            our privacy policy.
            <br />
            Your chat may be recorded. {"\u24D8"}
          </Surface>

          {firstStaticAssistantMessage}

          {messages.map((msg) => {
            // Outside the map, just above it:

            const isAssistant = msg.role === "assistant";

            const textContent = msg.parts
              ? msg.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p as any).text)
                  .join("")
              : (msg as any).content || "";

            // In v6, tool parts are typed as "tool-<toolName>"
            const toolParts =
              msg.parts?.filter((p) => p.type.startsWith("tool-")) || [];

            if (isAssistant && !textContent.trim() && toolParts.length === 0)
              return null;

            return (
              <div
                key={msg.id}
                className={`flex w-full ${!isAssistant ? "justify-end" : "justify-start gap-2"}`}
              >
                {isAssistant && (
                  <div className="relative shrink-0 mt-auto">
                    {AiAvatar}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full" />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-2 max-w-[80%] ${!isAssistant ? "items-end ml-auto" : "items-start"}`}
                >
                  {/* Tool indicators */}
                  {/* {isAssistant &&
                    toolParts.map((tool, i) => {
                      const isDone = (tool as any).state === "output-available";
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-2xl text-[12px] text-blue-600"
                        >
                          {isDone ? (
                            <svg
                              className="w-3.5 h-3.5 text-green-500 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3.5 h-3.5 shrink-0 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                          )}
                          <span>
                            {isDone
                              ? "Progress saved ✓"
                              : "Saving your info..."}
                          </span>
                        </div>
                      );
                    })} */}

                  {/* Text bubble */}
                  {textContent.trim() && (
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
                          alt="Uploaded attachment"
                          className="max-w-full rounded-2xl mb-2"
                        />
                      )}
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    </Surface>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shouldShowLoadingSpinner && (
        <div className="flex gap-2 w-full pl-2 pr-4 mt-2">
          <div className="relative shrink-0 mt-auto">{AiAvatar}</div>
          <Surface
            className="px-4 py-3 bg-slate-100 text-gray-500 rounded-3xl text-[13px] flex items-center gap-2"
            variant="default"
          >
            {isToolActive ? (
              <>
                <span>Thinking Hard</span>
                <span className="flex gap-[3px] items-center">
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </>
            ) : (
              <div className="loader" />
            )}
          </Surface>
        </div>
      )}
    </div>
  );
}
