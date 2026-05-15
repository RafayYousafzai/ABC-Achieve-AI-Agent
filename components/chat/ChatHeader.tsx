import { X } from "lucide-react";
import { Button, Avatar, Text } from "@heroui/react";
import Image from "next/image";

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  avatarSrc: string;
  onClear?: () => void;
  onMinimize: () => void;
  isMessageEmpty: boolean;
}

export function ChatHeader({
  title,
  subtitle,
  avatarSrc,
  onMinimize,
  isMessageEmpty,
}: ChatHeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 py-3 shrink-0 bg-[#1e3a8a] text-white rounded-3xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src={avatarSrc}
            alt={title}
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e3a8a] rounded-full" />
        </div>

        <div className="flex flex-col ml-2">
          <Text.Heading
            level={2}
            className="font-semibold text-[15px] leading-tight text-white"
          >
            {title}
          </Text.Heading>
          <p className="text-[11px] text-blue-200 opacity-90 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          isIconOnly
          onClick={onMinimize}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
          aria-label="Minimize"
          variant="ghost"
        >
          <X size={18} className="text-white/80 group-hover:text-white" />
        </Button>
      </div>
    </header>
  );
}
