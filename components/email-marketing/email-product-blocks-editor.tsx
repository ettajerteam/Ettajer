"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  GripVertical,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";
import {
  createProductBlock,
  createProductRecoBlock,
  parseEmailBlocks,
  type EmailBlock,
  type EmailProductBlock,
  type EmailProductRecoBlock,
} from "@/lib/email-marketing/email-blocks";
import { RECO_STRATEGIES } from "@/lib/email-marketing/atlas/types";
import type { ProductVariant } from "@/types";

export interface CatalogProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  variants: ProductVariant[];
  status?: string;
}

interface EmailProductBlocksEditorProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  currency: string;
  catalog: CatalogProduct[];
  catalogLoading?: boolean;
}

function reorderBlocks(
  blocks: EmailBlock[],
  fromId: string,
  toId: string
): EmailBlock[] {
  if (fromId === toId) return blocks;
  const fromIndex = blocks.findIndex((b) => b.id === fromId);
  const toIndex = blocks.findIndex((b) => b.id === toId);
  if (fromIndex < 0 || toIndex < 0) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function EmailProductBlocksEditor({
  blocks,
  onChange,
  currency,
  catalog,
  catalogLoading,
}: EmailProductBlocksEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    blocks[0]?.id ?? null
  );
  const [dragId, setDragId] = useState<string | null>(null);

  const parsedBlocks = useMemo(() => parseEmailBlocks(blocks), [blocks]);
  const productBlocks = useMemo(
    () =>
      parsedBlocks.filter((b): b is EmailProductBlock => b.type === "product"),
    [parsedBlocks]
  );
  const recoBlocks = useMemo(
    () =>
      parsedBlocks.filter(
        (b): b is EmailProductRecoBlock => b.type === "product_reco"
      ),
    [parsedBlocks]
  );

  useEffect(() => {
    if (
      selectedId &&
      !productBlocks.some((b) => b.id === selectedId) &&
      productBlocks[0]
    ) {
      setSelectedId(productBlocks[0].id);
    }
    if (!selectedId && productBlocks[0]) {
      setSelectedId(productBlocks[0].id);
    }
  }, [productBlocks, selectedId]);

  const byId = useMemo(
    () => new Map(catalog.map((p) => [p.id, p])),
    [catalog]
  );

  const selected = productBlocks.find((b) => b.id === selectedId) ?? null;
  const selectedProduct = selected ? byId.get(selected.productId) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = catalog.filter((p) => p.status !== "archived");
    if (!q) return list;
    return list.filter((p) => p.title.toLowerCase().includes(q));
  }, [catalog, query]);

  function updateBlock(
    id: string,
    patch: Partial<EmailProductBlock> | Partial<EmailProductRecoBlock>
  ) {
    onChange(
      parsedBlocks.map((b) => (b.id === id ? ({ ...b, ...patch } as EmailBlock) : b))
    );
  }

  function addProduct(productId: string) {
    const block = createProductBlock(productId);
    onChange([...parsedBlocks, block]);
    setSelectedId(block.id);
    setPickerOpen(false);
    setQuery("");
  }

  function addReco() {
    const block = createProductRecoBlock("best_sellers");
    onChange([...parsedBlocks, block]);
    setSelectedId(block.id);
  }

  function removeBlock(id: string) {
    const next = parsedBlocks.filter((b) => b.id !== id);
    onChange(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-white">
            Product blocks
          </h2>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            Drag to reorder. Prices and images sync from your catalog when emails
            send.
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            onClick={() => addReco()}
          >
            + Recommendations
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            onClick={() => setPickerOpen((v) => !v)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add product
          </Button>
        </div>
      </div>

      {recoBlocks.length > 0 ? (
        <div className="space-y-2 rounded-md border border-black/[0.06] p-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-500">
            Dynamic recommendations (resolved per recipient at send)
          </p>
          {recoBlocks.map((block) => (
            <div
              key={block.id}
              className="flex flex-wrap items-center gap-2 rounded-md bg-[#F5F5F7] px-2 py-2 dark:bg-white/[0.04]"
            >
              <select
                value={block.strategy}
                onChange={(e) =>
                  updateBlock(block.id, {
                    strategy: e.target.value as EmailProductRecoBlock["strategy"],
                  })
                }
                className="h-8 flex-1 rounded-md border border-black/[0.06] bg-white px-2 text-[11px] dark:border-white/10 dark:bg-transparent"
              >
                {RECO_STRATEGIES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={1}
                max={12}
                value={block.limit}
                onChange={(e) =>
                  updateBlock(block.id, {
                    limit: Math.min(
                      12,
                      Math.max(1, Number(e.target.value) || 1)
                    ),
                  })
                }
                className="h-8 w-16 rounded-md text-[11px]"
              />
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500"
                onClick={() => removeBlock(block.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {pickerOpen ? (
        <div className="rounded-md border border-black/[0.06] bg-[#F5F5F7] p-2 dark:border-white/10 dark:bg-white/[0.04]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="mb-2 h-8 rounded-md border-black/[0.06] bg-white text-[12px] dark:border-white/10 dark:bg-transparent"
            autoFocus
          />
          {catalogLoading ? (
            <p className="px-2 py-3 text-[12px] text-neutral-500">
              Loading products…
            </p>
          ) : filtered.length === 0 ? (
            <div className="px-2 py-4 text-center">
              <Package className="mx-auto mb-1.5 h-5 w-5 text-neutral-300" />
              <p className="text-[12px] text-neutral-500">No products found</p>
            </div>
          ) : (
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {filtered.map((p) => {
                const thumb = p.images[0];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white dark:hover:bg-white/[0.06]"
                  >
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-neutral-200">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="36px"
                          unoptimized
                        />
                      ) : (
                        <Package className="m-2 h-5 w-5 text-neutral-400" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {p.title}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {formatCurrency(p.price, currency)}
                        {p.comparePrice != null && p.comparePrice > p.price
                          ? ` · was ${formatCurrency(p.comparePrice, currency)}`
                          : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {productBlocks.length === 0 ? (
        <div className="rounded-md border border-dashed border-black/[0.08] px-3 py-6 text-center dark:border-white/10">
          <Package className="mx-auto mb-2 h-6 w-6 text-neutral-300" />
          <p className="text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
            No products yet
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Add one or more products to feature in this email.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {productBlocks.map((block, index) => {
            const product = byId.get(block.productId);
            const active = selectedId === block.id;
            const thumb = product?.images[0];
            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => setDragId(block.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) {
                    onChange(reorderBlocks(parsedBlocks, dragId, block.id));
                  }
                  setDragId(null);
                }}
                onDragEnd={() => setDragId(null)}
                className={cn(
                  "group flex items-center gap-1.5 rounded-md border px-1.5 py-1.5 transition-all",
                  dragId === block.id && "opacity-50",
                  active
                    ? "border-neutral-950 bg-neutral-50 dark:border-white dark:bg-white/[0.06]"
                    : "border-neutral-100 bg-white hover:border-neutral-200 dark:border-white/10 dark:bg-transparent"
                )}
              >
                <GripVertical
                  className="h-4 w-4 shrink-0 cursor-grab text-neutral-400 active:cursor-grabbing"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setSelectedId(block.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-100 text-[10px] font-semibold tabular-nums text-neutral-500 dark:bg-white/10">
                    {index + 1}
                  </span>
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-neutral-100">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                      {product?.title ?? "Product unavailable"}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {product
                        ? formatCurrency(product.price, currency)
                        : "Will skip at send"}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Remove product block"
                  onClick={() => removeBlock(block.id)}
                  className="rounded p-1.5 text-neutral-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && selectedProduct ? (
        <div className="space-y-3 rounded-md border border-black/[0.06] bg-white p-3 dark:border-white/10 dark:bg-transparent">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Block settings
          </p>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-neutral-500">
              Button label
            </Label>
            <Input
              value={selected.buttonLabel ?? "Shop now"}
              onChange={(e) =>
                updateBlock(selected.id, { buttonLabel: e.target.value })
              }
              className="h-8 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
              maxLength={80}
            />
          </div>

          {selectedProduct.variants.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-[11px] font-medium text-neutral-500">
                Variant
              </Label>
              {selectedProduct.variants.map((variant) => (
                <div key={variant.id} className="space-y-1">
                  <p className="text-[11px] text-neutral-500">{variant.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {variant.options.filter(Boolean).map((opt) => {
                      const active =
                        (selected.selectedOptions ?? {})[variant.name] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            updateBlock(selected.id, {
                              selectedOptions: {
                                ...(selected.selectedOptions ?? {}),
                                [variant.name]: active ? "" : opt,
                              },
                            })
                          }
                          className={cn(
                            "rounded-md border px-2 py-1 text-[11px] transition-colors",
                            active
                              ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-white/10"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-2.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
            <ToggleRow
              label="Compare at price"
              checked={selected.showComparePrice !== false}
              onCheckedChange={(v) =>
                updateBlock(selected.id, { showComparePrice: v })
              }
            />
            <ToggleRow
              label="Discount badge"
              checked={selected.showDiscountBadge !== false}
              onCheckedChange={(v) =>
                updateBlock(selected.id, { showDiscountBadge: v })
              }
            />
            <ToggleRow
              label="Show variant"
              checked={selected.showVariant !== false}
              onCheckedChange={(v) =>
                updateBlock(selected.id, { showVariant: v })
              }
            />
          </div>

          <div className="rounded-md bg-[#F5F5F7] px-2.5 py-2 text-[11px] text-neutral-500 dark:bg-white/[0.04]">
            Live from catalog:{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatCurrency(selectedProduct.price, currency)}
            </span>
            {selectedProduct.comparePrice != null &&
            selectedProduct.comparePrice > selectedProduct.price
              ? ` · compare ${formatCurrency(selectedProduct.comparePrice, currency)}`
              : ""}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
