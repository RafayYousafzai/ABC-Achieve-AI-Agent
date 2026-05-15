import React from "react";
import { ArrowUp, Image, Paperclip, X } from "lucide-react";
import { Button, Input, Surface } from "@heroui/react";

interface ChatComposerProps {
  image: string | null;
  input: string;
  isLoading: boolean;
  onImageClear: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (value: string, element: HTMLInputElement) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  placeholder?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ChatComposer({
  image,
  input,
  isLoading,
  onImageClear,
  onImageUpload,
  onInputChange,
  onInputKeyDown,
  onSend,
  placeholder = "Type a message...",
  fileInputRef,
  inputRef,
}: ChatComposerProps) {
  const isSendDisabled = isLoading || (!input.trim() && !image);

  return (
    <Surface
      className="px-4 pb-4 pt-3 shrink-0 mt-auto rounded-none"
      variant="default"
    >
      {/* Image Preview Area */}
      {image && (
        <div className="relative inline-block mb-3 group">
          <img
            src={image}
            alt="Preview"
            className="h-20 w-20 rounded-xl object-cover"
          />
          <Button
            isIconOnly
            size="sm"
            variant="danger"
            className="absolute -top-2 -right-2"
            onClick={onImageClear}
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          isIconOnly
          variant="tertiary"
          size="md"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Single-line input */}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value, e.target)}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          className="flex-1"
          variant="secondary"
        />

        {/* Send Button */}
        <Button
          isIconOnly
          variant="primary"
          onClick={onSend}
          isDisabled={isSendDisabled}
          size="md"
        >
          <ArrowUp size={18} strokeWidth={3} />
        </Button>
      </div>
    </Surface>
  );
}
