"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paperclip, ArrowUp } from "lucide-react";
import {
  Card,
  Avatar,
  Button,
  TextArea,
  ScrollShadow,
  Text,
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

  const onSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() && !image) return;
    handleSubmit(e);
    setImage(null);
  };

  if (!sessionId) return null;

  const isSendDisabled = !isReady || isProcessing || (!input.trim() && !image);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="w-[340px] sm:w-[360px] h-[480px] p-0 rounded-2xl">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-700 text-white px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <Text className="text-white font-semibold text-base">
                Jennifer
              </Text>
              <p className="text-xs text-blue-100">Online</p>
            </div>
            <Button
              isIconOnly
              className="bg-transparent hover:bg-white/10 text-white"
              onClick={() => setIsOpen(false)}
              size="sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* Messages Area with ScrollShadow */}
          <ScrollShadow
            className="flex-1 px-4 scrollbar-hide"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#ccc transparent",
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Profile Intro */}
              <div className="flex flex-col items-center mb-2">
                <Avatar
                  src={avatarSrc}
                  size="lg"
                  name="Jennifer"
                  color="primary"
                />
                <p className="text-sm font-semibold text-primary mt-2">
                  Jennifer
                </p>
              </div>

              {/* Message List */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role !== "user" && (
                    <Avatar
                      src={avatarSrc}
                      size="sm"
                      name="Bot"
                      className="flex-shrink-0 mt-1"
                    />
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.parts
                        ? msg.parts
                            .filter((p) => p.type === "text")
                            .map((p) => p.text)
                            .join("")
                        : msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isProcessing && (
                <div className="flex gap-1 ml-10">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollShadow>

          {/* Footer - Message Input */}
          <Card.Footer className="px-4 pt-3 pb-3 flex flex-col gap-2">
            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    size="sm"
                    variant="outline"
                    color="primary"
                    onClick={() => setInput(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            )}
            <form onSubmit={onSend} className="flex items-end gap-2 w-full">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500"
              >
                <Paperclip size={18} />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setImage(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />

              <TextArea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend(e);
                  }
                }}
                placeholder="Message..."
                minRows={1}
                maxRows={3}
                variant="secondary"
                className="flex-1   scrollbar-hide"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#ccc transparent",
                }}
              />

              <Button
                isIconOnly
                type="submit"
                disabled={isSendDisabled}
                color="primary"
                size="sm"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </Button>
            </form>
          </Card.Footer>
        </Card>
      )}

      {/* Bubble Button */}
      {!isOpen && (
        <Button
          isIconOnly
          className="w-14 h-14 bg-blue-700 hover:bg-blue-800"
          onClick={() => setIsOpen(true)}
          size="lg"
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
        </Button>
      )}
    </div>
  );
}
