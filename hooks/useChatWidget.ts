"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useCallback } from "react";
const uploadFileToSupabase = async (fileObj: File, sessionId: string) => {
  try {
    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("sessionId", sessionId);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.url as string;
  } catch (err) {
    console.error("File upload failed:", err);
    return null;
  }
};

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  // Custom loading state to handle the delay while uploading the file
  const [isUploading, setIsUploading] = useState(false);

  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    let storedSession = localStorage.getItem("ellie_session_id");
    if (!storedSession) {
      const randomPart = crypto.randomUUID().substring(0, 8);
      storedSession = `sess_${randomPart}`;
      localStorage.setItem("ellie_session_id", storedSession);
    }
    console.log("sessionId initialized:", storedSession); // ✅ verify it's not empty
    return storedSession;
  });

  // Initialize Vercel AI SDK Chat
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId },
    }),
    messages: [],
  });

  // Derived state for the UI (Combine SDK loading with our custom Upload loading)
  const isReady = (status === "ready" || status === "error") && !isUploading;
  const isProcessing =
    status === "submitted" || status === "streaming" || isUploading;

  // 4. Unified submit handler updated to accept a File object
  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent, selectedFile?: File | null) => {
      e?.preventDefault();
      setInput("");

      let finalMessageText = input.trim();
      let uploadedUrl: string | null = null;

      // Handle the file upload BEFORE sending the message to the AI
      if (selectedFile) {
        setIsUploading(true);
        uploadedUrl = await uploadFileToSupabase(selectedFile, sessionId);
        setIsUploading(false);

        if (!uploadedUrl) {
          finalMessageText += selectedFile
            ? "\n[System Notification: User tried to attach a document, but the upload failed.]"
            : "";
        }
      }

      if (uploadedUrl && selectedFile) {
        const filePart = {
          type: "file" as const,
          mediaType: selectedFile.type || "image/*",
          filename: selectedFile.name,
          url: uploadedUrl,
        };

        if (finalMessageText) {
          await sendMessage({ text: finalMessageText, files: [filePart] });
        } else {
          await sendMessage({ files: [filePart] });
        }
      } else if (finalMessageText) {
        await sendMessage({ text: finalMessageText });
      }
    },
    [input, sendMessage, sessionId],
  );

  // Helper to send a provided text (used for quick prompts to avoid
  // relying on stale state when setInput is asynchronous)
  const sendText = useCallback(
    async (text: string, selectedFile?: File | null) => {
      let finalMessageText = text.trim();
      let uploadedUrl: string | null = null;

      if (selectedFile) {
        setIsUploading(true);
        uploadedUrl = await uploadFileToSupabase(selectedFile, sessionId);
        setIsUploading(false);

        if (!uploadedUrl) {
          finalMessageText += selectedFile
            ? "\n[System Notification: User tried to attach a document, but the upload failed.]"
            : "";
        }
      }

      if (uploadedUrl && selectedFile) {
        const filePart = {
          type: "file" as const,
          mediaType: selectedFile.type || "image/*",
          filename: selectedFile.name,
          url: uploadedUrl,
        };

        if (finalMessageText) {
          await sendMessage({ text: finalMessageText, files: [filePart] });
        } else {
          await sendMessage({ files: [filePart] });
        }
      } else if (finalMessageText) {
        await sendMessage({ text: finalMessageText });
      }

      // Clear the input after sending
      setInput("");
    },
    [sendMessage, sessionId],
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
