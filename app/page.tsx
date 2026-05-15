"use client";

import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // router.push("/widget");
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold">
        <TextShimmer>Redirecting to Chat Widget...</TextShimmer>
      </h1>
    </div>
  );
}
