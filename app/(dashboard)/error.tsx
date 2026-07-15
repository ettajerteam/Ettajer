"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
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
    <div className="flex items-center justify-center min-h-[50vh] p-6">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Dashboard error</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || "Something went wrong loading this page."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-[#007AFF] hover:bg-[#0071EB]">
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
