import { RotateCcw } from "lucide-react";

export function OverrideIndicator({
  active,
  onReset,
}: {
  active?: boolean;
  onReset?: () => void;
}) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]"
        title="This device has a style override"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" aria-hidden />
        Override
      </span>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          title="Reset to inherited value"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          Reset
        </button>
      ) : null}
    </span>
  );
}
