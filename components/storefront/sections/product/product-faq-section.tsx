"use client";

import type { ProductFaqSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

type FaqPair = { question: string; answer: string };

function parseFaqFromHtml(html: string): FaqPair[] {
  if (typeof html !== "string" || !html.trim()) return [];
  const pairs: FaqPair[] = [];
  const paragraphRe = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = paragraphRe.exec(html)) !== null) {
    const inner = match[1] ?? "";
    const strong = /<strong\b[^>]*>([\s\S]*?)<\/strong>/i.exec(inner);
    if (!strong) continue;
    const question = strong[1].replace(/<[^>]+>/g, "").trim();
    const answer = inner
      .replace(strong[0], "")
      .replace(/^[\s:—\-–]+/, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (question) pairs.push({ question, answer: answer || question });
  }
  return pairs;
}

function AccordionFaq({
  title,
  items,
  isBold,
  isModern,
}: {
  title: string;
  items: FaqPair[];
  isBold: boolean;
  isModern: boolean;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl px-6 py-16 sm:py-20", isModern && "max-w-2xl")}>
      <h2
        className={cn(
          "mb-8",
          isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
          isBold
            ? "text-sm font-bold uppercase tracking-[0.28em] text-white"
            : "text-xl font-semibold tracking-tight text-neutral-900"
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "divide-y border-y",
          isBold ? "divide-white/10 border-white/10" : "divide-neutral-200 border-neutral-200",
          isModern && "divide-neutral-100 border-neutral-100"
        )}
      >
        {items.map((item, index) => (
          <details key={`${item.question}-${index}`} className="group" open={index === 0}>
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-medium transition marker:content-none [&::-webkit-details-marker]:hidden",
                isBold ? "text-white hover:text-white/80" : "text-neutral-900 hover:text-neutral-600"
              )}
            >
              <span>{item.question}</span>
              <span
                className={cn(
                  "shrink-0 text-xl font-light leading-none transition group-open:rotate-45",
                  isBold ? "text-white/35" : "text-neutral-300"
                )}
                aria-hidden
              >
                +
              </span>
            </summary>
            {item.answer ? (
              <div
                className={cn(
                  "pb-5 pr-10 text-[14px] leading-relaxed",
                  isBold ? "text-white/60" : "text-neutral-500"
                )}
              >
                {item.answer}
              </div>
            ) : null}
          </details>
        ))}
      </div>
    </div>
  );
}

export function ProductFaqSection({ store, settings }: BlockRenderProps) {
  const s = settings as ProductFaqSectionSettings;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const title = s.title ?? "Frequently asked questions";
  const content = s.content ?? "Add product FAQ content here.";
  const layout = s.layout ?? "accordion";

  if (layout === "accordion") {
    const items = parseFaqFromHtml(content);
    if (items.length > 0) {
      return <AccordionFaq title={title} items={items} isBold={isBold} isModern={isModern} />;
    }
  }

  if (layout === "strip") {
    return (
      <div
        className={cn(
          "border-y px-6 py-10",
          isBold ? "border-white/10" : "border-neutral-200"
        )}
      >
        <div className={cn("mx-auto max-w-4xl", isModern && "max-w-3xl")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-12">
            <h2
              className={cn(
                "shrink-0 sm:w-40",
                isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
                isBold
                  ? "text-sm font-bold uppercase tracking-[0.28em] text-white"
                  : "text-base font-semibold text-neutral-900"
              )}
            >
              {title}
            </h2>
            <div
              className={cn(
                "prose prose-sm max-w-none leading-relaxed",
                isModern && "text-[15px] text-neutral-500",
                isBold ? "prose-invert text-white/65" : "text-neutral-500"
              )}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "intro") {
    return (
      <div className={cn("mx-auto max-w-2xl px-6 py-16 text-center", isModern && "max-w-xl")}>
        <h2
          className={cn(
            "mb-4",
            isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
            isBold
              ? "text-sm font-bold uppercase tracking-[0.28em] text-white"
              : "text-2xl font-semibold tracking-tight text-neutral-900"
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "prose prose-sm mx-auto max-w-none leading-relaxed",
            isModern && "text-[15px] text-neutral-500",
            isBold ? "prose-invert text-white/65" : "text-neutral-500"
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-3xl px-6 py-16", isModern && "max-w-2xl")}>
      <h2
        className={cn(
          "mb-5",
          isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
          isBold
            ? "text-sm font-bold uppercase tracking-[0.28em] text-white"
            : "text-xl font-semibold tracking-tight text-neutral-900"
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "prose prose-sm max-w-none leading-relaxed",
          isModern && "text-[15px] text-neutral-500",
          isBold ? "prose-invert text-white/65" : "text-neutral-500"
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
