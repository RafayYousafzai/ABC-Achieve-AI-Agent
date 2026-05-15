import { X } from "lucide-react";
import { Button, Avatar, Text } from "@heroui/react";

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  avatarSrc: string;
  onClear: () => void;
  onMinimize: () => void;
}

export function ChatHeader({
  title,
  subtitle,
  avatarSrc,
  onMinimize,
}: ChatHeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 py-3 shrink-0 bg-gradient-to-r from-[#1e3a8a] to-[#25418b] text-white shadow-md rounded-b-2xl z-10 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10 rounded-full border-2 border-white/20">
            <Avatar.Image
              alt="John Doe"
              src="https://img.heroui.chat/image/avatar?w=400&h=400&u=3"
            />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>

          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e3a8a] rounded-full"></span>
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
