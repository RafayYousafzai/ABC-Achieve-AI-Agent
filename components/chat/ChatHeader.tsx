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
    <header className="relative flex items-center justify-between px-4 pt-3 shrink-0 bg-white">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image src={"/abc-logo.png"} alt={title} width={40} height={40} />
        </div>

        <div className="flex flex-col ml-2">
          <Text.Heading className="font-semibold text-[17px] leading-tight text-black/80">
            {title}
          </Text.Heading>
          <p className="text-[11px] text-black/80 opacity-80 font-medium">
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
          <X size={18} className="text-black/80 group-hover:text-black" />
        </Button>
      </div>
    </header>
  );
}
