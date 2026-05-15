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
  const shouldShowLoadingSpinner = isLoading && !latestAssistantContent.trim();

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
            const isAssistant = msg.role === "assistant";
            const content =
              msg.content ||
              (msg.parts
                ? msg.parts
                    .filter((p) => p.type === "text")
                    .map((p) => p.text)
                    .join("")
                : "");

            return (
              <div
                key={msg.id}
                className={`flex w-full ${
                  !isAssistant ? "justify-end" : "justify-start gap-2"
                }`}
              >
                {isAssistant && (
                  <div className="relative shrink-0 mt-auto">
                    {AiAvatar}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full" />
                  </div>
                )}

                <Surface
                  className={`p-3.5 text-[15px] leading-relaxed max-w-[80%] ${
                    !isAssistant
                      ? "bg-[#24408B] text-white rounded-3xl ml-auto"
                      : "bg-slate-100 text-gray-800 rounded-3xl"
                  }`}
                  variant="default"
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded attachment"
                      className="max-w-full rounded-2xl mb-2"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{content}</p>
                </Surface>
              </div>
            );
          })}
        </div>
      )}

      {shouldShowLoadingSpinner && (
        <div className="flex gap-2 w-full pl-2 pr-4 mt-4">
          <div className="relative shrink-0 mt-auto">{AiAvatar}</div>
          <Surface
            className="p-3.5 text-[15px] leading-relaxed max-w-[80%] bg-slate-100 text-gray-800 rounded-3xl"
            variant="default"
          >
            <div className="loader" />
          </Surface>
        </div>
      )}
    </div>
  );
}
