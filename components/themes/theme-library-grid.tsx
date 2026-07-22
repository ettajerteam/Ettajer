"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemeLibraryGridProps {
  selectedTemplate: ThemeId;
  liveTemplate: ThemeId;
  onSelect: (theme: ThemeId) => void;
  onCustomizeLive?: () => void;
}

export function ThemeLibraryGrid({
  selectedTemplate,
  liveTemplate,
  onSelect,
  onCustomizeLive,
}: ThemeLibraryGridProps) {
  const [detailId, setDetailId] = useState<ThemeId | null>(null);
  const detail = detailId ? THEME_TEMPLATES.find((t) => t.id === detailId) : null;

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
        <div className="border-b border-neutral-100 px-5 py-6 sm:px-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Style themes
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-900">
            Look & feel
          </h2>
          <p className="mt-1.5 max-w-lg text-sm text-neutral-500">
            Base visual system — colors, type, and mood. Pair with a website design above.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:p-7 lg:grid-cols-3">
          {THEME_TEMPLATES.map((template, index) => {
            const isLive = liveTemplate === template.id;
            const isSelected = selectedTemplate === template.id;

            return (
              <motion.article
                key={template.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                  isSelected || isLive
                    ? "border-neutral-900 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.35)]"
                    : "border-neutral-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md",
                )}
              >
                <button
                  type="button"
                  onClick={() => setDetailId(template.id)}
                  className="relative block aspect-[5/4] w-full overflow-hidden text-left"
                  style={{ backgroundColor: template.preview.bg }}
                >
                  <StyleMockup
                    bg={template.preview.bg}
                    text={template.preview.text}
                    accent={template.preview.accent}
                    name={template.name}
                    dark={template.id === "bold"}
                  />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                        <Check className="h-3 w-3" />
                        Live
                      </span>
                    ) : null}
                    {isSelected && !isLive ? (
                      <span className="rounded-full bg-[#007AFF] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Previewing
                      </span>
                    ) : null}
                    {template.popular ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 shadow-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Popular
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-lg">
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </span>
                  </div>
                </button>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold tracking-[-0.02em] text-neutral-900">
                        {template.name}
                      </h3>
                      <p className="text-xs text-neutral-500">{template.tagline}</p>
                    </div>
                    <div className="flex gap-1">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: template.defaultPrimary }}
                      />
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: template.defaultSecondary }}
                      />
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
                    {template.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.benefits.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 flex-1 rounded-xl"
                      onClick={() => setDetailId(template.id)}
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-800"
                      onClick={() =>
                        isLive && onCustomizeLive ? onCustomizeLive() : onSelect(template.id)
                      }
                    >
                      {isLive ? "Customize" : "Try style"}
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {detail ? (
        <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
          <DialogContent className="max-w-md overflow-hidden p-0">
            <div
              className="aspect-video"
              style={{ backgroundColor: detail.preview.bg }}
            >
              <StyleMockup
                bg={detail.preview.bg}
                text={detail.preview.text}
                accent={detail.preview.accent}
                name={detail.name}
                dark={detail.id === "bold"}
                large
              />
            </div>
            <div className="space-y-4 p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="flex items-center gap-2">
                  {detail.name}
                  {detail.popular ? <Sparkles className="h-4 w-4 text-[#007AFF]" /> : null}
                </DialogTitle>
                <DialogDescription>{detail.longDescription}</DialogDescription>
              </DialogHeader>

              <ul className="grid gap-1.5 sm:grid-cols-2">
                {detail.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-700">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailId(null)} className="rounded-xl">
                  Close
                </Button>
                <Button
                  className="rounded-xl bg-neutral-900 hover:bg-neutral-800"
                  onClick={() => {
                    onSelect(detail.id);
                    setDetailId(null);
                  }}
                >
                  Try {detail.name}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

function StyleMockup({
  bg,
  text,
  accent,
  name,
  dark,
  large,
}: {
  bg: string;
  text: string;
  accent: string;
  name: string;
  dark?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex h-full flex-col p-4" style={{ backgroundColor: bg, color: text }}>
      <div className="flex items-center justify-between">
        <span className={cn("font-semibold tracking-tight", large ? "text-sm" : "text-[11px]")}>
          {name}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          Shop
        </span>
      </div>
      <div className="mt-4 flex-1">
        <div
          className={cn("h-2 rounded-full", large ? "w-2/3" : "w-1/2")}
          style={{ backgroundColor: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)" }}
        />
        <div
          className="mt-2 h-1.5 w-1/3 rounded-full"
          style={{ backgroundColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)" }}
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-lg"
              style={{
                background: dark
                  ? `linear-gradient(135deg, ${accent}33, rgba(255,255,255,0.08))`
                  : `linear-gradient(135deg, ${accent}22, rgba(0,0,0,0.06))`,
              }}
            />
          ))}
        </div>
      </div>
      <div
        className="mt-3 h-7 rounded-lg"
        style={{ backgroundColor: accent, opacity: 0.9 }}
      />
    </div>
  );
}
