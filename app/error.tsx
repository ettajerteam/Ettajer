"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-6">
      <div className="max-w-md w-full rounded-2xl bg-white border shadow-sm p-8 text-center">
        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          An unexpected error occurred. You can try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-[#007AFF] hover:bg-[#0071EB]">
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
