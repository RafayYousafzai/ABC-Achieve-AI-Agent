"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");

  // Handle session ID initialization
  useEffect(() => {
    let storedSession = localStorage.getItem("ellie_session_id");
    if (!storedSession) {
      storedSession = "sess_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("ellie_session_id", storedSession);
    }
    setSessionId(storedSession);
  }, []);

  // Initialize Vercel AI SDK Chat
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
    messages: [],
  });

  // Derived state for the UI
  const isReady = status === "ready" || status === "error";
  const isProcessing = status === "submitted" || status === "streaming";

  // Unified submit handler
  const handleSubmit = (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return {
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
  };
}
