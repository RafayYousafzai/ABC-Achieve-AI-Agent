"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Perform the redirect after the component has safely mounted
    router.replace("/widget");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-medium tracking-tight">
          <TextShimmer duration={1.5}>
            Initializing Gemini 2.5 Flash...
          </TextShimmer>
        </h1>
        {/* Optional: Add a subtle loading indicator here */}
      </div>
    </main>
  );
}
