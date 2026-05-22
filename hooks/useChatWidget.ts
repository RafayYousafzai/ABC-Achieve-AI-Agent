"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useCallback } from "react";
const uploadFileToSupabase = async (fileObj: File, sessionId: string) => {
  try {
    // 1. Get signed upload URL and public URL from backend
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: fileObj.name,
        fileType: fileObj.type,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate upload URL: status ${response.status}`);
    }

    const { signedUrl, publicUrl } = await response.json();
    if (!signedUrl || !publicUrl) {
      throw new Error("Invalid response from upload API");
    }

    // 2. Perform direct upload to the signed URL using PUT
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileObj.type,
      },
      body: fileObj,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Direct upload failed with status ${uploadResponse.status}`);
    }

    return publicUrl as string;
  } catch (err) {
    console.error("File upload failed:", err);
    return null;
  }
};

interface StoredSession {
  sessionId: string;
  expiresAt: number;
  messages: any[];
}

const SESSION_KEY = "ellie_chat_session";
const ONE_HOUR = 60 * 60 * 1000;

const getStoredSession = (): StoredSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading stored session:", err);
    return null;
  }
};

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  // Custom loading state to handle the delay while uploading the file
  const [isUploading, setIsUploading] = useState(false);

  const [sessionData] = useState(() => {
    const stored = getStoredSession();
    if (stored) {
      console.log("Resuming session:", stored.sessionId);
      return stored;
    }
    const randomPart = typeof crypto !== "undefined" ? crypto.randomUUID().substring(0, 8) : Math.random().toString(36).substring(2, 10);
    const newSessionId = `sess_${randomPart}`;
    const newSession: StoredSession = {
      sessionId: newSessionId,
      expiresAt: Date.now() + ONE_HOUR,
      messages: [],
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    }
    console.log("Initialized new session:", newSessionId);
    return newSession;
  });

  const sessionId = sessionData?.sessionId || "";

  // Initialize Vercel AI SDK Chat
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
    messages: sessionData?.messages || [],
  });

  // Persist messages and update expiry (keep only the last 20 messages to prevent storage bloat)
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;
    const session: StoredSession = {
      sessionId,
      expiresAt: Date.now() + ONE_HOUR,
      messages: messages.slice(-20),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [messages, sessionId]);

  // Derived state for the UI (Combine SDK loading with our custom Upload loading)
  const isReady = (status === "ready" || status === "error") && !isUploading;
  const isProcessing =
    status === "submitted" || status === "streaming" || isUploading;

  // Helper to handle uploading file (if present) and sending the message
  const uploadAndSend = useCallback(
    async (text: string, selectedFile?: File | null) => {
      let finalMessageText = text.trim();
      let uploadedUrl: string | null = null;

      if (selectedFile) {
        setIsUploading(true);
        uploadedUrl = await uploadFileToSupabase(selectedFile, sessionId);
        setIsUploading(false);

        if (!uploadedUrl) {
          finalMessageText += "\n[System Notification: User tried to attach a document, but the upload failed.]";
        }
      }

      if (uploadedUrl && selectedFile) {
        const filePart = {
          type: "file" as const,
          mediaType: selectedFile.type || "image/*",
          filename: selectedFile.name,
          url: uploadedUrl,
        };

        await sendMessage(
          finalMessageText
            ? { text: finalMessageText, files: [filePart] }
            : { files: [filePart] }
        );
      } else if (finalMessageText) {
        await sendMessage({ text: finalMessageText });
      }

      setInput("");
    },
    [sendMessage, sessionId]
  );

  // Unified submit handler updated to accept a File object
  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent, selectedFile?: File | null) => {
      e?.preventDefault();
      await uploadAndSend(input, selectedFile);
    },
    [input, uploadAndSend]
  );

  // Helper to send a provided text (used for quick prompts to avoid
  // relying on stale state when setInput is asynchronous)
  const sendText = useCallback(
    async (text: string, selectedFile?: File | null) => {
      await uploadAndSend(text, selectedFile);
    },
    [uploadAndSend]
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
    sendText,
    isUploading,
  };
}
