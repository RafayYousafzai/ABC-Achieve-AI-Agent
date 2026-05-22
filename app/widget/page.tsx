"use client";

import ChatWidget from "@/components/ChatWidget";

export default function WidgetPage() {
  return (
    <div className="bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background: transparent !important;
          background-color: transparent !important;
          overflow: hidden !important;
        }
      `}} />
      <ChatWidget />
    </div>
  );
}
