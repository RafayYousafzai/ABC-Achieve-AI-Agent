"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // 1. Handle Persistent Memory (Session ID)
  useEffect(() => {
    let storedSession = localStorage.getItem("ellie_session_id");
    if (!storedSession) {
      storedSession = "sess_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("ellie_session_id", storedSession);
    }
    setSessionId(storedSession);
  }, []);

  // 2. The Vercel AI SDK Hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: { sessionId }, // Pass the persistent ID to your Next.js Edge function
      initialMessages: [
        {
          id: "1",
          role: "assistant",
          content: "Hi! 👋 Are you interested in ABA Therapy?",
        },
      ],
    });

  if (!sessionId) return null; // Wait until session is loaded

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* The Chat Window */}
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

          {/* Messages Area */}
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
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-gray-400">Ellie is typing...</div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#00A3C4]"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-[#e94e77] text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-[#d43d65] transition-colors"
                disabled={isLoading || !input}
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}

      {/* The Floating Bubble Button */}
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
