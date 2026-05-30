"use client";

import ChatWidget from "@/components/ChatWidget";

export default function WidgetPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background: transparent !important;
          background-color: transparent !important;
          overflow: hidden !important;
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}} />
      <ChatWidget />
    </>
  );
}
