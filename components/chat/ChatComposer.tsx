import React from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { Button } from "@heroui/react";

interface ChatComposerProps {
  image: string | null;
  input: string;
  isLoading: boolean;
  onImageClear: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (value: string, element: HTMLTextAreaElement) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  placeholder?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
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
  textareaRef,
}: ChatComposerProps) {
  const isSendDisabled = isLoading || (!input.trim() && !image);

  return (
    <footer className="px-4 pb-4 bg-white/80 backdrop-blur-sm shrink-0 mt-auto">
      {/* Image Preview Area */}
      {image && (
        <div className="relative inline-block mb-3 group">
          <img
            src={image}
            alt="Preview"
            className="h-20 w-20 rounded-xl border border-gray-200 object-cover shadow-sm ring-2 ring-white"
          />
          <button
            type="button"
            onClick={onImageClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all scale-90 group-hover:scale-100"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-1 bg-slate-50 border border-gray-200 rounded-2xl px-2 py-1.5 focus-within:bg-white focus-within:border-blue-900/40 focus-within:ring-4 focus-within:ring-blue-900/5 transition-all duration-200 shadow-sm">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-blue-800 hover:bg-blue-50 transition-colors rounded-xl mb-0.5"
          aria-label="Attach image"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => onInputChange(e.target.value, e.target)}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          className="flex-1 max-h-[140px] bg-transparent border-none outline-none resize-none py-2.5 px-2 text-[15px] text-gray-700 placeholder:text-gray-400 leading-tight"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={onSend}
          disabled={isSendDisabled}
          className={`p-2.5 rounded-xl transition-all duration-200 mb-0.5 mr-0.5 flex items-center justify-center ${
            isSendDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#25418b] text-white shadow-md hover:bg-[#1e3470] active:scale-95"
          }`}
          aria-label="Send message"
        >
          <ArrowUp size={18} strokeWidth={3} />
        </button>
      </div>
    </footer>
  );
}
