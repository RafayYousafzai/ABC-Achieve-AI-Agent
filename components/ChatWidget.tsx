"use client";

import { useRef, useState, useEffect, FormEvent } from "react";
import { Card, Button, ScrollShadow, Avatar } from "@heroui/react";
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

  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const avatarSrc = "https://i.pravatar.cc/150?u=Henry";
  const quickPrompts = ["Yes", "No", "Espanol"];

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const clearAttachment = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSend = (e?: FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() && !image) return;
    handleSubmit(e, selectedFile);
    clearAttachment();
  };

  if (!sessionId) return null;

  const isMessageEmpty = messages.length === 0;

  // Memoized avatar
  const AiAvatar = () => (
    <div className="relative shrink-0">
      <Avatar className="w-19 h-19 rounded-full border-2 border-white/20">
        <Avatar.Image alt="AI Assistant" src={avatarSrc} />
        <Avatar.Fallback>AI</Avatar.Fallback>
      </Avatar>
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full" />
    </div>
  );

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
              messages={messages as unknown as never[]}
              isLoading={isProcessing}
              isEmptyConversationState={isMessageEmpty}
              quickPrompts={quickPrompts}
              onQuickPromptSelect={(prompt) => setInput(prompt)}
              avatarSrc={avatarSrc}
            />

            <div ref={messagesEndRef} />
          </ScrollShadow>

          <ChatComposer
            image={image}
            input={input}
            isLoading={isProcessing}
            onImageClear={clearAttachment}
            onImageUpload={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setSelectedFile(file);
                setImage(URL.createObjectURL(file));
              }
            }}
            onInputChange={(value) => setInput(value)}
            onInputKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(e);
              }
            }}
            onSend={() => onSend(undefined)}
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
          onClick={() => setIsOpen(true)}
          className={"h-20 w-20 rounded-full"}
        >
          {AiAvatar}
        </Button>
      )}
    </div>
  );
}
