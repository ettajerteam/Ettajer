"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ettajer-editor-onboarding-dismissed";

export function EditorGettingStarted({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-3 py-2",
        className
      )}
    >
      <p className="text-xs text-neutral-600">
        <span className="font-medium text-neutral-800">Tip:</span> Click sections in the preview to
        edit them · drag to reorder · publish when ready
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-neutral-400 hover:text-neutral-700"
        onClick={dismiss}
        aria-label="Dismiss tip"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
