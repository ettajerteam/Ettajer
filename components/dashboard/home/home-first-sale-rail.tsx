"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Circle, ExternalLink, Package, Share2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getAbsoluteStoreUrl, getStoreUrl } from "@/lib/storefront-urls";
import { homeCard, homeCardPad, homeKicker, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

const SHARE_KEY_PREFIX = "ettajer-first-sale-shared:";

export function firstSaleShareStorageKey(storeSlug: string) {
  return `${SHARE_KEY_PREFIX}${storeSlug}`;
}

interface HomeFirstSaleRailProps {
  storeSlug: string;
  storeName: string;
  productCount: number;
  hasOrders: boolean;
  highlight?: boolean;
}

export function HomeFirstSaleRail({
  storeSlug,
  storeName,
  productCount,
  hasOrders,
  highlight = false,
}: HomeFirstSaleRailProps) {
  const t = useHomeCopy();
  const [shared, setShared] = useState(false);
  const [absolute, setAbsolute] = useState(() => getAbsoluteStoreUrl(storeSlug));
  const path = getStoreUrl(storeSlug);

  useEffect(() => {
    setAbsolute(`${window.location.origin}${path}`);
    try {
      setShared(window.localStorage.getItem(firstSaleShareStorageKey(storeSlug)) === "1");
    } catch {
      /* ignore */
    }
  }, [path, storeSlug]);

  const markShared = useCallback(() => {
    try {
      window.localStorage.setItem(firstSaleShareStorageKey(storeSlug), "1");
    } catch {
      /* ignore */
    }
    setShared(true);
  }, [storeSlug]);

  const whatsapp = useMemo(() => {
    const text = `Shop ${storeName}: ${absolute}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [absolute, storeName]);

  const productDone = productCount >= 1;
  const shareDone = shared;
  const orderDone = hasOrders;

  const steps = [
    {
      id: "product",
      done: productDone,
      title: t.firstSaleStepProduct,
      hint: t.firstSaleStepProductHint,
      icon: Package,
    },
    {
      id: "share",
      done: shareDone,
      title: t.firstSaleStepShare,
      hint: t.firstSaleStepShareHint,
      icon: Share2,
    },
    {
      id: "order",
      done: orderDone,
      title: t.firstSaleStepOrder,
      hint: t.firstSaleStepOrderHint,
      icon: ShoppingBag,
    },
  ] as const;

  const doneCount = steps.filter((s) => s.done).length;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absolute);
      markShared();
      toast.success("Store link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <section
      className={cn(
        homeCard,
        homeCardPad,
        highlight && "ring-1 ring-neutral-900/10 dark:ring-white/15"
      )}
      aria-label={t.firstSaleTitle}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={homeKicker}>First sale</p>
          <h2 className={cn(homeTitle, "mt-1 text-[15px]")}>{t.firstSaleTitle}</h2>
          <p className={cn(homeSubtitle, "mt-1 max-w-xl")}>{t.firstSaleSubtitle}</p>
        </div>
        <p className="text-[11px] font-medium text-neutral-400">
          {t.firstSaleProgress(doneCount, steps.length)}
        </p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-neutral-900 transition-all dark:bg-white"
          style={{ width: `${Math.round((doneCount / steps.length) * 100)}%` }}
        />
      </div>

      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border border-black/[0.04] bg-[#F5F5F7]/60 px-3 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]",
                !step.done && index === doneCount && "border-neutral-900/15 dark:border-white/20"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {step.done ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-neutral-300" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-neutral-400" />
                    <p
                      className={cn(
                        "text-[12px] font-medium",
                        step.done
                          ? "text-neutral-400 line-through"
                          : "text-neutral-900 dark:text-white"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.done ? (
                      <span className="text-[10px] font-medium text-emerald-600">
                        {t.firstSaleDone}
                      </span>
                    ) : null}
                  </div>
                  <p className={cn(homeSubtitle, "mt-0.5")}>{step.hint}</p>

                  {!step.done && step.id === "product" ? (
                    <Button
                      asChild
                      size="sm"
                      className="mt-2.5 h-8 rounded-md bg-neutral-900 px-3 text-[11px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                    >
                      <Link href="/dashboard/products/new?first=1">{t.firstSaleCtaProduct}</Link>
                    </Button>
                  ) : null}

                  {!step.done && step.id === "share" ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        className="h-8 rounded-md bg-neutral-900 px-3 text-[11px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                        asChild
                      >
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={markShared}
                        >
                          {t.firstSaleCtaShare}
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md border-black/[0.08] text-[11px] dark:border-white/10"
                        onClick={() => void handleCopy()}
                      >
                        {t.copyLink}
                      </Button>
                    </div>
                  ) : null}

                  {!step.done && step.id === "order" ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        className="h-8 rounded-md bg-neutral-900 px-3 text-[11px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                        asChild
                      >
                        <Link href={path} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1.5 h-3 w-3" />
                          {t.firstSaleCtaOpen}
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md border-black/[0.08] text-[11px] dark:border-white/10"
                        onClick={() => void handleCopy()}
                      >
                        {t.copyLink}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
