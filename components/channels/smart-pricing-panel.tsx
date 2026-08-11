"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Calculator, ChevronDown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, getCurrencySymbol } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { PricingInputError, recommendedPrice, toCharmPrice } from "@/lib/channels/pricing";

interface SmartPricingPanelProps {
  cost?: number;
  shipping?: number;
  currency?: string;
  onApplyPrice?: (price: number) => void;
  defaultOpen?: boolean;
}

const DEFAULT_ETSY_FEE_PERCENT = 9;
const DEFAULT_TARGET_MARGIN_PERCENT = 30;

export function SmartPricingPanel({
  cost: initialCost,
  shipping: initialShipping,
  currency = "USD",
  onApplyPrice,
  defaultOpen = false,
}: SmartPricingPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [cost, setCost] = useState(initialCost ?? 0);
  const [shipping, setShipping] = useState(initialShipping ?? 0);
  const [feePercent, setFeePercent] = useState(DEFAULT_ETSY_FEE_PERCENT);
  const [targetMarginPercent, setTargetMarginPercent] = useState(DEFAULT_TARGET_MARGIN_PERCENT);

  const symbol = getCurrencySymbol(currency);

  const result = useMemo(() => {
    try {
      return { value: recommendedPrice({ cost, shipping, feePercent, targetMarginPercent }), error: null as string | null };
    } catch (error) {
      return {
        value: null,
        error: error instanceof PricingInputError ? error.message : "Could not compute a price",
      };
    }
  }, [cost, shipping, feePercent, targetMarginPercent]);

  const charmPrice = result.value ? toCharmPrice(result.value.price) : null;

  function applyPrice(price: number) {
    if (onApplyPrice) {
      onApplyPrice(price);
      toast.success(`Applied ${symbol}${price.toFixed(2)}`);
    } else {
      toast.message(`Recommended price: ${symbol}${price.toFixed(2)}`);
    }
  }

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5856D6]/10 text-[#5856D6]">
            <Calculator className="h-4 w-4" />
          </span>
          <div>
            <h3 className={dashboardTitle}>Smart pricing</h3>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              {result.value ? `Recommended: ${symbol}${result.value.price.toFixed(2)}` : "Set a channel-ready price"}
            </p>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-black/[0.05] px-4 py-4 dark:border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">Cost of goods</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value) || 0)}
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">Shipping cost</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value) || 0)}
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">Channel fee %</Label>
              <Input
                type="number"
                min={0}
                max={99}
                step="0.1"
                value={feePercent}
                onChange={(e) => setFeePercent(Number(e.target.value) || 0)}
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
              />
              <p className="text-[10px] text-neutral-400">Etsy transaction + payment fees run ~9-10%.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-neutral-500">Target margin %</Label>
              <Input
                type="number"
                min={0}
                max={99}
                step="1"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(Number(e.target.value) || 0)}
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
              />
            </div>
          </div>

          {result.error ? (
            <p className="text-[11px] text-amber-700 dark:text-amber-400">{result.error}</p>
          ) : result.value ? (
            <div className="space-y-2 rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-neutral-500">Recommended price</p>
                <p className="text-[16px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                  {symbol}
                  {result.value.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Est. channel fee</span>
                <span>
                  {symbol}
                  {result.value.breakdown.estimatedFeeAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Est. margin</span>
                <span>
                  {symbol}
                  {result.value.breakdown.estimatedMarginAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  type="button"
                  className="h-8 flex-1 rounded-md bg-[#007AFF] px-3 text-[12px] font-medium text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#0071EB] hover:shadow-none"
                  onClick={() => applyPrice(result.value!.price)}
                >
                  Use {symbol}
                  {result.value.price.toFixed(2)}
                </Button>
                {charmPrice ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 flex-1 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                    onClick={() => applyPrice(charmPrice)}
                  >
                    <Wand2 className="mr-1 h-3.5 w-3.5" />
                    Use {symbol}
                    {charmPrice.toFixed(2)}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
