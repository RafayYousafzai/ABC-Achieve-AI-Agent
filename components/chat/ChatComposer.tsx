import React, { memo, useCallback, useState, useEffect } from "react";
import { ArrowUp, Image as ImageIcon, X } from "lucide-react";
import { Button, Input, Spinner, Surface, Skeleton } from "@heroui/react";

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
  isEmptyConversationState: boolean;
}

// Wrapped in memo to prevent unnecessary re-renders when messages stream in the parent
export const ChatComposer = memo(function ChatComposer({
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
  isEmptyConversationState,
}: ChatComposerProps) {
  const isSendDisabled = isLoading || (!input.trim() && !image);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!image) return;
    setIsImageLoaded(false);
    const img = new window.Image();
    img.onload = () => setIsImageLoaded(true);
    img.src = image;
  }, [image]);

  // Fix: Reset the actual file input element so the user can re-upload the same file if they clear it
  const handleImageClear = useCallback(() => {
    onImageClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageClear, fileInputRef]);

  // if (isEmptyConversationState) return null;

  return (
    <Surface className="px-4 pb-4 shrink-0 rounded-none" variant="default">
      {/* Image Preview Area */}
      {image && (
        <div className="relative inline-block mb-3 group">
          {isImageLoaded ? (
            <img
              src={image}
              alt="Preview"
              className="h-20 w-20 rounded-xl object-cover"
            />
          ) : (
            <Skeleton className="rounded-xl w-20 h-20" />
          )}
          <Button
            isIconOnly
            size="sm"
            variant="danger"
            className="absolute -top-2 -right-2 z-10"
            onClick={handleImageClear}
            aria-label="Clear image"
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
          aria-label="Upload image"
        >
          {/* Renamed import to ImageIcon to prevent IDE confusion with native DOM Image */}
          <ImageIcon size={20} color="#81717A" />
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageUpload}
          accept="image/*"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Single-line input */}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value, e.target)}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-full"
          variant="secondary"
        />

        {/* Send Button */}
        <Button
          isIconOnly
          variant="primary"
          onClick={onSend}
          isDisabled={isSendDisabled}
          size="md"
          aria-label="Send message"
        >
          {isLoading ? (
            <Spinner size="md" color="current" />
          ) : (
            <ArrowUp size={18} strokeWidth={3} />
          )}
        </Button>
      </div>
    </Surface>
  );
});
