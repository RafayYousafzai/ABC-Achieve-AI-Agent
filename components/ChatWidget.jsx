"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    let storedSession = localStorage.getItem("ellie_session_id");
    if (!storedSession) {
      storedSession = "sess_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("ellie_session_id", storedSession);
    }
    setSessionId(storedSession);
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
    // SDK 5.0: use `messages` (not `initialMessages`) for seeding the conversation
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [
          { type: "text", text: "Hi! 👋 Are you interested in ABA Therapy?" },
        ],
      },
    ],
  });

  if (!sessionId) return null;

  const isReady = status === "ready" || status === "error";
  const isProcessing = status === "submitted" || status === "streaming";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[30rem] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00A3C4] to-[#00829c] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#00A3C4] font-bold">
                E
              </div>
              <span className="font-semibold">Ellie</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  m.role === "user"
                    ? "bg-[#00A3C4] text-white self-end rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-100 self-start rounded-bl-none shadow-sm"
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
              <div className="text-xs text-gray-400">Ellie is typing...</div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs text-center border border-red-200 rounded-lg">
                Connection Error: {error.message}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
              className="flex gap-2"
            >
              <input
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#00A3C4]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={!isReady}
              />
              <button
                type="submit"
                className="bg-[#e94e77] text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-[#d43d65] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isReady || !input.trim()}
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#00A3C4] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
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
        </button>
      )}
    </div>
  );
}
