"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPreviewUrl } from "@/lib/preview-engine";
import type { StoreThemeSettings } from "@/types/storefront";

interface FullscreenPreviewProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  draft?: StoreThemeSettings;
}

export function FullscreenPreview({
  open,
  onClose,
  storeSlug,
  draft,
}: FullscreenPreviewProps) {
  const previewUrl = buildPreviewUrl(storeSlug, draft);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2 text-white">
              <Monitor className="h-4 w-4 text-[#007AFF]" />
              <span className="text-sm font-medium">Fullscreen Preview</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 p-4 sm:p-6">
            <iframe
              src={previewUrl}
              title="Store fullscreen preview"
              className="w-full h-full rounded-xl border border-white/10 bg-white"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
