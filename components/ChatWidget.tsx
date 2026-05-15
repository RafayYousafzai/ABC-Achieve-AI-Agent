"use client";

import { useRef, useState, useEffect } from "react";
import { Card, Button, ScrollShadow } from "@heroui/react";
import { useChatWidget } from "../hooks/useChatWidget";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatComposer } from "./chat/ChatComposer";

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
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const avatarSrc = "https://i.pravatar.cc/150?u=jennifer";
  const quickPrompts = ["Yes", "No", "Espanol"];

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

  const isMessageEmpty = messages.length === 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card
          className={`w-100 sm:w-90 ${isMessageEmpty ? "h-80" : "h-145"} p-0 rounded-2xl shadow-none`}
        >
          <ChatHeader
            title="Jennifer"
            subtitle="Online"
            avatarSrc={avatarSrc}
            onMinimize={() => setIsOpen(false)}
            isMessageEmpty={isMessageEmpty}
          />

          <ScrollShadow
            className="flex-1 px-0 scrollbar-hide"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#ccc transparent",
            }}
          >
            <ChatMessages
              messages={messages}
              isLoading={isProcessing}
              isEmptyConversationState={isMessageEmpty}
              quickPrompts={quickPrompts}
              onQuickPromptSelect={(prompt) => setInput(prompt)}
              avatarSrc={avatarSrc}
              isMessageEmpty={isMessageEmpty}
            />

            <div ref={messagesEndRef} />
          </ScrollShadow>

          <ChatComposer
            image={image}
            input={input}
            isLoading={isProcessing}
            onImageClear={() => setImage(null)}
            onImageUpload={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImage(URL.createObjectURL(e.target.files[0]));
              }
            }}
            onInputChange={(value) => setInput(value)}
            onInputKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(e);
              }
            }}
            onSend={() => onSend()}
            placeholder="Message..."
            fileInputRef={fileInputRef}
            inputRef={inputRef}
          />
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
