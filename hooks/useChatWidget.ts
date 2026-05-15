"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useCallback } from "react";

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");

  // Handle session ID initialization safely
  useEffect(() => {
    let storedSession = localStorage.getItem("ellie_session_id");
    if (!storedSession) {
      // Use crypto for better randomness if available
      const randomPart =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().substring(0, 8)
          : Math.random().toString(36).substring(2, 9);

      storedSession = `sess_${randomPart}`;
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

  // Unified submit handler optimized with useCallback
  const handleSubmit = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.preventDefault();

      if (input.trim()) {
        sendMessage({ text: input });
        setInput("");
      }
    },
    [input, sendMessage],
  );

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
