"use client";

import {
  Card,
  Input,
  Avatar,
  Spinner,
  Button,
  ScrollShadow,
  Surface,
} from "@heroui/react";
import { useChatWidget } from "../hooks/useChatWidget";

export default function ChatWidget() {
  const {
    isOpen,
    setIsOpen,
    sessionId,
    input,
    setInput,
    messages,
    error,
    isReady,
    isProcessing,
    handleSubmit,
  } = useChatWidget();

  if (!sessionId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* The Chat Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[30rem]   flex flex-col overflow-hidden ">
          {/* Header */}
          <Card.Header className="bg-blue-600">
            <div className="flex items-center gap-3">
              <Avatar size="sm" className="bg-white">
                <Avatar.Fallback className="text-[#00A3C4] font-bold">
                  E
                </Avatar.Fallback>
              </Avatar>
              <Card.Title className="font-semibold text-white text-base">
                Ellie
              </Card.Title>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-transparent text-white hover:bg-white/20 min-w-0 w-8 h-8 p-0 flex items-center justify-center rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 1L13 13M1 13L13 1" />
              </svg>
            </Button>
          </Card.Header>

          {/* Messages Area */}
          <Card.Content className="flex-1 p-0 m-0 border-none overflow-hidden">
            <Surface className="h-full bg-surface-secondary flex flex-col">
              <ScrollShadow className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] p-3 text-sm rounded-2xl ${
                      m.role === "user"
                        ? "bg-[#00A3C4] text-white self-end rounded-br-sm shadow-md"
                        : "bg-surface border border-border text-foreground self-start rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {m.parts?.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-muted self-start py-2">
                    <Spinner size="sm" color="current" />
                    <span>Ellie is typing...</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-danger-50 text-danger text-xs text-center border border-danger-200 rounded-lg mt-auto">
                    Connection Error: {error.message}
                  </div>
                )}
              </ScrollShadow>
            </Surface>
          </Card.Content>

          {/* Input Area */}
          <Card.Footer className="p-3 bg-surface border-t border-border rounded-none m-0">
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 w-full items-center"
            >
              <Input
                className="flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={!isReady}
                variant="secondary" // Low-emphasis variant suitable for Surface
                fullWidth
              />
              <Button
                type="submit"
                className="bg-[#e94e77] text-white rounded-full w-10 h-10 min-w-[40px] p-0 flex items-center justify-center hover:bg-[#d43d65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                disabled={!isReady || !input.trim()}
                aria-label="Send message"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </Button>
            </form>
          </Card.Footer>
        </Card>
      )}

      {/* The Floating Bubble Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-[#00A3C4] w-14 h-14 min-w-[56px] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
