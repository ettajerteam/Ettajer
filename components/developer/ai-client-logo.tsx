import Image from "next/image";
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiClientKind } from "@/lib/developer/ai-clients";

type AiClientLogoProps = {
  kind: AiClientKind;
  className?: string;
  size?: "sm" | "md";
};

/** Real brand assets under /public/developer/ai */
const LOGO_SRC: Partial<
  Record<AiClientKind, { src: string; cover?: boolean }>
> = {
  claude: { src: "/developer/ai/claude.png", cover: true },
  cursor: { src: "/developer/ai/cursor.png", cover: true },
  chatgpt: { src: "/developer/ai/chatgpt.svg", cover: true },
  openai: { src: "/developer/ai/openai.png", cover: false },
  codex: { src: "/developer/ai/codex.svg", cover: false },
};

export function AiClientLogo({
  kind,
  className,
  size = "md",
}: AiClientLogoProps) {
  const box =
    size === "sm"
      ? "h-7 w-7 rounded-[8px]"
      : "h-9 w-9 rounded-[10px]";
  const px = size === "sm" ? 28 : 36;
  const logo = LOGO_SRC[kind];

  if (logo) {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-black/[0.06]",
          box,
          className,
        )}
        aria-hidden
      >
        <Image
          src={logo.src}
          alt=""
          width={px}
          height={px}
          className={cn(
            logo.cover ? "h-full w-full object-cover" : "h-[70%] w-[70%] object-contain",
          )}
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-[#007AFF]/10 text-[#007AFF]",
        box,
        className,
      )}
      aria-hidden
    >
      {kind === "other" ? (
        <Sparkles
          style={{ width: px * 0.45, height: px * 0.45 }}
          strokeWidth={2}
        />
      ) : (
        <Bot style={{ width: px * 0.45, height: px * 0.45 }} strokeWidth={2} />
      )}
    </span>
  );
}
