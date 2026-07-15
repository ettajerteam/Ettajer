import { Puzzle } from "lucide-react";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { getSectionTypeLabel } from "@/lib/builder/resolve-block";
import type { BlockDefinition } from "@/lib/builder/types";
import type { StoreSection } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

interface UnknownBlockPlaceholderProps {
  section: StoreSection;
  block?: BlockDefinition;
  builderMode?: boolean;
  className?: string;
}

/**
 * Shown when a section type has no registered component.
 * Uses builder ghost styling — only appears for unknown/unimplemented blocks.
 */
export function UnknownBlockPlaceholder({
  section,
  block,
  builderMode,
  className,
}: UnknownBlockPlaceholderProps) {
  const def = SECTION_REGISTRY[section.type];
  const label = block?.name ?? def?.label ?? getSectionTypeLabel(section.type);
  const description =
    block && !block.implemented
      ? "This block is not implemented yet."
      : "No renderer registered for this block type.";

  return (
    <div
      className={cn(
        "flex min-h-[120px] flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        builderMode && "ettajer-builder-section-ghost",
        className
      )}
      data-unknown-block={section.type}
      data-section-id={section.id}
    >
      <Puzzle className="h-5 w-5 text-neutral-400" aria-hidden />
      <span className="rounded-full bg-neutral-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        {builderMode ? "Unknown block" : "Unavailable"}
      </span>
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      {builderMode ? (
        <p className="max-w-xs text-xs text-neutral-400">{description}</p>
      ) : null}
    </div>
  );
}
