"use client";

import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLLAPSED_WIDTH = "3.5rem";

interface EditorCollapsiblePanelProps {
  side: "left" | "right";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Icon rail shown when collapsed */
  collapsedContent: ReactNode;
  children: ReactNode;
  className?: string;
  expandedWidth?: string;
}

export function EditorPanelCloseButton({
  side,
  onClick,
  className,
}: {
  side: "left" | "right";
  onClick: () => void;
  className?: string;
}) {
  const isLeft = side === "left";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 shrink-0 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
        className
      )}
      onClick={onClick}
      title={isLeft ? "Collapse left panel" : "Collapse inspector"}
      aria-label={isLeft ? "Collapse left panel" : "Collapse inspector"}
    >
      {isLeft ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelRightClose className="h-4 w-4" />
      )}
    </Button>
  );
}

export function EditorCollapsiblePanel({
  side,
  open,
  onOpenChange,
  collapsedContent,
  children,
  className,
  expandedWidth = side === "left" ? "280px" : "300px",
}: EditorCollapsiblePanelProps) {
  const isLeft = side === "left";

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-neutral-200 bg-white transition-[width] duration-300 ease-in-out",
        isLeft ? "border-r" : "border-l",
        className
      )}
      style={{ width: open ? expandedWidth : COLLAPSED_WIDTH }}
    >
      {open ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <div className="flex h-full flex-col items-center py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mb-2 h-8 w-8 shrink-0 rounded-md text-neutral-500"
            onClick={() => onOpenChange(true)}
            title={isLeft ? "Expand left panel" : "Expand inspector"}
            aria-label={isLeft ? "Expand left panel" : "Expand inspector"}
          >
            {isLeft ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
          <div className="flex flex-1 flex-col items-center gap-1">{collapsedContent}</div>
        </div>
      )}
    </aside>
  );
}

interface EditorPanelExpandHandleProps {
  side: "left" | "right";
  onClick: () => void;
  className?: string;
}

/** Floating handle on preview edge when a panel is collapsed */
export function EditorPanelExpandHandle({ side, onClick, className }: EditorPanelExpandHandleProps) {
  const isLeft = side === "left";
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "absolute top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border-neutral-200 bg-white shadow-md",
        isLeft ? "left-2" : "right-2",
        className
      )}
      onClick={onClick}
      title={isLeft ? "Open left panel" : "Open inspector"}
      aria-label={isLeft ? "Open left panel" : "Open inspector"}
    >
      {isLeft ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  );
}
