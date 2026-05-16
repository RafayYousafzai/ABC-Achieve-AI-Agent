import type { Message } from "./types";
import { Avatar, Button, Surface } from "@heroui/react";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { TextShimmer } from "../motion-primitives/text-shimmer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isEmptyConversationState: boolean;
  quickPrompts: readonly string[];
  onQuickPromptSelect: (prompt: string) => void;
  avatarSrc: string;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getTextContent(msg: Message): string {
  if (msg.parts) {
    return msg.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as any).text)
      .join("");
  }
  return (msg as any).content || "";
}

function getFileParts(msg: Message) {
  return (
    msg.parts?.filter(
      (
        part,
      ): part is {
        type: "file";
        mediaType: string;
        filename?: string;
        url: string;
      } => part.type === "file",
    ) ?? []
  );
}

function hasActiveToolCall(messages: Message[]): boolean {
  return messages.some(
    (m) =>
      m.role === "assistant" &&
      m.parts?.some((p) => p.type.startsWith("tool-")),
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ThinkingIndicator({ isToolActive }: { isToolActive: boolean }) {
  return (
    <div className="flex items-center gap-2 min-h-5">
      {isToolActive ? (
        <span className="text-[13px] text-gray-500">
          <TextShimmer>Thinking...</TextShimmer>
        </span>
      ) : (
        <div className="loader" />
      )}
    </div>
  );
}

function ScrollToBottomButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        absolute bottom-4 right-4 z-10
        w-8 h-8 rounded-full
        bg-white border border-gray-200
        shadow-md flex items-center justify-center
        text-gray-500 hover:text-gray-800
        hover:shadow-lg hover:scale-105
        transition-all duration-200 ease-out
        animate-in fade-in slide-in-from-bottom-2
      "
      aria-label="Scroll to bottom"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatMessages({
  messages,
  isLoading,
  isEmptyConversationState,
  quickPrompts,
  onQuickPromptSelect,
  avatarSrc,
}: ChatMessagesProps) {
  const isMessageEmpty = messages.length === 0;

  // Scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAtBottomRef = useRef(true);

  // Derived state
  const lastMessage = messages[messages.length - 1];
  const lastAssistantHasText =
    lastMessage?.role === "assistant"
      ? getTextContent(lastMessage).trim() !== ""
      : false;
  const showLoadingBubble = isLoading && !lastAssistantHasText;
  const currentAssistantMsg =
    messages[messages.length - 1]?.role === "assistant"
      ? messages[messages.length - 1]
      : null;
  const isToolActive =
    currentAssistantMsg?.parts?.some((p) => p.type.startsWith("tool-")) ??
    false;

  // Scroll to bottom instantly
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Track whether user is at bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 60;
    isAtBottomRef.current = atBottom;
    setShowScrollButton(!atBottom);
  }, []);

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    if (isAtBottomRef.current) {
      // Instant scroll during streaming to avoid lag
      scrollToBottom(isLoading ? "instant" : "smooth");
    }
  }, [messages, isLoading, showLoadingBubble, scrollToBottom]);

  // Memoized avatar
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

  // Memoized welcome message
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
      className={`flex flex-col h-full ${isEmptyConversationState ? "pt-3 pb-2" : "py-0"}`}
    >
      {isMessageEmpty ? (
        // ── Empty state ──────────────────────────────────────────────────────
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
        // ── Conversation view ────────────────────────────────────────────────
        <div className="relative flex flex-col h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex flex-col gap-4 pl-2 pr-4 pb-2 overflow-y-auto flex-1 scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
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
              const fileParts = getFileParts(msg);

              // Skip tool-only assistant steps
              if (isAssistant && !textContent.trim()) return null;

              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${!isAssistant ? "justify-end" : "justify-start gap-2"}`}
                >
                  {isAssistant && <div className="mt-auto">{AiAvatar}</div>}

                  <div
                    className={`flex flex-col gap-2 max-w-[80%] ${
                      !isAssistant ? "items-end ml-auto" : "items-start"
                    }`}
                  >
                    <Surface
                      className={`py-3.5 px-5 text-[15px] leading-relaxed transition-opacity duration-200 ${
                        !isAssistant
                          ? "bg-[#0084F2] text-white rounded-3xl"
                          : "bg-slate-100 text-gray-800 rounded-3xl"
                      }`}
                      variant="default"
                    >
                      {fileParts.map((part, index) =>
                        part.mediaType?.startsWith("image/") ? (
                          <img
                            key={`${msg.id}-file-${index}`}
                            src={part.url}
                            alt={part.filename || "Attachment"}
                            className="max-w-full rounded-2xl mb-2"
                          />
                        ) : null,
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

            {/* Scroll anchor */}
            <div ref={bottomRef} className="h-1 shrink-0" />
          </div>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <ScrollToBottomButton onClick={() => scrollToBottom("smooth")} />
          )}
        </div>
      )}
    </div>
  );
}
