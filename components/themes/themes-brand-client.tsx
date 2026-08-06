"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { useThemeStore } from "@/lib/theme-store";
import { isThemeDirty, resolveThemeDraft } from "@/lib/theme-utils";
import type { ThemeId } from "@/lib/themes";
import type { StoreThemeData } from "@/types/theme";
import {
  themesApple,
  themesPrimaryBtn,
  themesSecondaryBtn,
  themesTextBtn,
} from "@/lib/themes-apple";
import { cn } from "@/lib/utils";

interface ThemesBrandClientProps {
  store: StoreThemeData;
}

export function ThemesBrandClient({ store: initialStore }: ThemesBrandClientProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialStore);
  const [publishing, setPublishing] = useState(false);
  const { draft, selectedTemplate, setDraft, initFromStore } = useThemeStore();

  useEffect(() => {
    initFromStore({
      theme: initialStore.theme,
      primaryColor: initialStore.primaryColor,
      secondaryColor: initialStore.secondaryColor,
      font: "Inter",
      logo: initialStore.logo,
    });
  }, [initialStore, initFromStore]);

  const previewDraft = useMemo(
    () => resolveThemeDraft(saved, draft, selectedTemplate),
    [saved, draft, selectedTemplate]
  );

  const dirty = useMemo(
    () => isThemeDirty(saved, { ...draft, font: draft.font ?? "Inter" }, selectedTemplate),
    [saved, draft, selectedTemplate]
  );

  const primary = previewDraft.primaryColor ?? saved.primaryColor;
  const secondary = previewDraft.secondaryColor ?? saved.secondaryColor;
  const logo = previewDraft.logo !== undefined ? previewDraft.logo : saved.logo;
  const radius = previewDraft.buttonRadius ?? saved.buttonRadius ?? "12px";

  const publish = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/store/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: previewDraft.theme ?? saved.theme,
          primaryColor: primary,
          secondaryColor: secondary,
          font: "Inter",
          logo: logo ?? null,
          buttonRadius: radius,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to save");
      }
      const { store: updated } = await res.json();
      const next: StoreThemeData = {
        ...saved,
        logo: updated.logo,
        theme: updated.theme as ThemeId,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        font: "Inter",
        buttonRadius: updated.buttonRadius ?? radius,
        updatedAt: new Date().toISOString(),
      };
      setSaved(next);
      initFromStore({
        theme: next.theme,
        primaryColor: next.primaryColor,
        secondaryColor: next.secondaryColor,
        font: "Inter",
        logo: next.logo,
        buttonRadius: next.buttonRadius,
      });
      toast.success("Brand published");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <OnlineStorePageShell>
      <div
        className="mx-auto w-full max-w-[720px] space-y-12 pb-20 pt-2 sm:pt-4"
        style={{ fontFamily: themesApple.font }}
      >
        <div>
          <Link
            href="/dashboard/themes"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E73] transition-colors hover:text-[#1D1D1F]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Themes
          </Link>
          <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.035em] text-[#1D1D1F] dark:text-white sm:text-[40px]">
            Brand
          </h1>
          <p className="mt-2 text-[16px] leading-relaxed text-[#6E6E73]">
            Logo, colors, type, and buttons — nothing else.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="space-y-10"
        >
          {/* Logo */}
          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1D1D1F] dark:text-white">
              Logo
            </h2>
            <div className="flex items-center gap-4">
              <div
                className="flex h-20 w-20 items-center justify-center overflow-hidden border border-[#E5E5E7] bg-white dark:border-white/10"
                style={{ borderRadius: themesApple.radiusCard }}
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-[12px] text-[#6E6E73]">No logo</span>
                )}
              </div>
              <div className="space-y-2">
                <label className={cn(themesSecondaryBtn, "cursor-pointer")}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("folder", "brand");
                      const res = await fetch("/api/media/upload", {
                        method: "POST",
                        body: fd,
                      }).catch(() => null);
                      if (!res?.ok) {
                        // Fallback: data URL for local draft
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setDraft({ logo: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                        toast.message("Logo set in draft — publish to save");
                        return;
                      }
                      const data = await res.json();
                      const url = data.url ?? data.asset?.url;
                      if (url) {
                        setDraft({ logo: url });
                        toast.success("Logo updated");
                      }
                    }}
                  />
                </label>
                {logo ? (
                  <button
                    type="button"
                    className={themesTextBtn}
                    onClick={() => setDraft({ logo: null })}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="space-y-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1D1D1F] dark:text-white">
              Colors
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Accent color"
                value={primary}
                onChange={(v) => setDraft({ primaryColor: v })}
              />
              <ColorField
                label="Background color"
                value={secondary}
                onChange={(v) => setDraft({ secondaryColor: v })}
              />
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1D1D1F] dark:text-white">
              Typography
            </h2>
            <p className="text-[14px] text-[#6E6E73]">
              Inter — Apple-style system typography for your storefront.
            </p>
            <div
              className="border border-[#E5E5E7] bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
              style={{ borderRadius: themesApple.radiusCard }}
            >
              <p className="text-[28px] font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-white">
                Your brand
              </p>
              <p className="mt-1 text-[15px] text-[#6E6E73]">
                Clean, modern, and effortless to read.
              </p>
            </div>
          </section>

          {/* Buttons */}
          <section className="space-y-4">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1D1D1F] dark:text-white">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-2">
              {(["8px", "12px", "16px", "999px"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDraft({ buttonRadius: r })}
                  className={cn(
                    "h-10 border px-4 text-[13px] font-medium transition-colors",
                    radius === r
                      ? "border-[#0071E3] bg-[#0071E3]/[0.06] text-[#1D1D1F]"
                      : "border-[#E5E5E7] text-[#6E6E73] hover:text-[#1D1D1F]"
                  )}
                  style={{ borderRadius: r === "999px" ? "999px" : r }}
                >
                  {r === "999px" ? "Pill" : r}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 pt-1">
              <span
                className="inline-flex h-11 items-center px-5 text-[14px] font-medium text-white"
                style={{ backgroundColor: primary, borderRadius: radius }}
              >
                Shop now
              </span>
              <span
                className="inline-flex h-11 items-center border border-[#E5E5E7] bg-white px-5 text-[14px] font-medium"
                style={{ color: primary, borderRadius: radius }}
              >
                Learn more
              </span>
            </div>
          </section>
        </motion.div>

        <div className="sticky bottom-4 flex gap-2.5 border-t border-[#E5E5E7] bg-[#F5F5F7]/90 py-4 backdrop-blur dark:border-white/10 dark:bg-[#121212]/90">
          <button
            type="button"
            className={cn(themesPrimaryBtn, (!dirty || publishing) && "opacity-60")}
            disabled={!dirty || publishing}
            onClick={() => void publish()}
          >
            {publishing ? "Publishing…" : "Publish brand"}
          </button>
          <Link href="/dashboard/themes" className={themesTextBtn}>
            Back to themes
          </Link>
        </div>
      </div>
    </OnlineStorePageShell>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-medium text-[#6E6E73]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-12 cursor-pointer rounded-[12px] border border-[#E5E5E7] bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 flex-1 rounded-[12px] border border-[#E5E5E7] bg-white px-3 font-mono text-[13px] uppercase text-[#1D1D1F] outline-none focus:border-[#0071E3] dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
    </label>
  );
}
