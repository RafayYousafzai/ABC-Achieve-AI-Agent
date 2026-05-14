"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Paperclip, ArrowUp } from "lucide-react";
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

  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const avatarSrc = "https://i.pravatar.cc/150?u=jennifer";
  const quickPrompts = [
    "What is ABA Therapy?",
    "How to get started?",
    "Check availability",
  ];

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const onSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() && !image) return;
    handleSubmit(e);
    setImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  if (!sessionId) return null;

  const isSendDisabled = !isReady || isProcessing || (!input.trim() && !image);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="w-[340px] sm:w-[360px] h-[480px] flex flex-col overflow-hidden shadow-2xl rounded-2xl bg-white border border-gray-100">
          {/* Header */}
          <header className="relative flex items-center justify-between px-4 py-3 shrink-0 bg-gradient-to-r from-[#1e3a8a] to-[#25418b] text-white z-10">
            <div className="flex items-center gap-3 ml-1">
              <div className="flex flex-col">
                <h2 className="font-semibold text-[15px] leading-tight">
                  Jennifer
                </h2>
                <p className="text-[11px] text-blue-200 opacity-90 font-medium">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-white p-4">
            <div className="flex flex-col gap-4">
              {/* Profile Intro (Shows at top) */}
              <div className="flex flex-col items-center mb-2">
                <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#25418b] to-[#1e3a8a]">
                  <img
                    src={avatarSrc}
                    alt="Assistant"
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className="text-[#25418b] text-[13px] font-semibold mt-2">
                  Jennifer
                </span>
              </div>

              {/* Message List */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start gap-2"}`}
                >
                  {msg.role !== "user" && (
                    <div className="relative shrink-0 mt-auto">
                      <img
                        src={avatarSrc}
                        className="w-8 h-8 rounded-full border border-gray-200"
                        alt="Bot"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22c55e] border-2 border-white rounded-full"></span>
                    </div>
                  )}
                  <div
                    className={`p-3 text-[14px] leading-relaxed max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-[#25418b] text-white rounded-2xl rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100"
                    }`}
                  >
                    {msg.parts ? (
                      msg.parts.map((p, i) =>
                        p.type === "text" ? <p key={i}>{p.text}</p> : null,
                      )
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick Prompts - Only show when there's only the greeting message */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 ml-10 mt-[-8px]">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="text-[12px] bg-white border border-[#25418b] text-[#25418b] py-1 px-3 rounded-full hover:bg-[#25418b] hover:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {isProcessing && (
                <div className="flex gap-2 items-center ml-10">
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Footer */}
          <footer className="p-3 bg-white border-t border-gray-100">
            <form
              onSubmit={onSend}
              className="flex items-end gap-1 bg-[#f8fafc] border border-gray-200 rounded-xl px-2 py-1.5 focus-within:bg-white focus-within:border-[#25418b]/40 transition-all"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-[#25418b]"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={(e) =>
                  setImage(URL.createObjectURL(e.target.files[0]))
                }
              />

              <textarea
                ref={textareaRef}
                rows="1"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend(e)}
                placeholder="Message..."
                className="flex-1 max-h-[100px] bg-transparent border-none outline-none resize-none py-2 text-[14px] text-gray-700"
              />

              <button
                type="submit"
                disabled={isSendDisabled}
                className={`p-2 rounded-lg transition-all ${isSendDisabled ? "text-gray-300" : "text-[#25418b] hover:scale-110"}`}
              >
                <ArrowUp size={20} strokeWidth={3} />
              </button>
            </form>
          </footer>
        </div>
      )}

      {/* Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#25418b] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
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
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
