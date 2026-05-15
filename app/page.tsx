"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // router.prefetch is non-blocking and safe to call here
    router.prefetch("/widget");

    // Small delay to let the animation breathe or
    // simply fire the replacement immediately
    const timer = setTimeout(() => {
      router.replace("/widget");
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-medium tracking-tight">
          <TextShimmer duration={1.2}>Preparing your experience...</TextShimmer>
        </h1>
      </div>
    </main>
  );
}
