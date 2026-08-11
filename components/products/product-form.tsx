"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Download,
  Briefcase,
  Truck,
  ChevronDown,
  Sparkles,
  ImagePlus,
  Film,
  Box,
  Plus,
  Trash2,
  Link2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { PRODUCT_TYPE_OPTIONS, productTracksInventory } from "@/lib/product-types";
import {
  DEFAULT_COMMERCE,
  HIGHLIGHT_PRESETS,
  type ProductCommerceSettings,
} from "@/lib/product-commerce";
import { improveProductWithAi } from "@/lib/product-ai-assist";
import {
  loadProductFormDraft,
  saveProductFormDraft,
} from "@/lib/product-form-draft-storage";
import {
  FOCUS_PUBLISH_FIELD_EVENT,
  GUIDANCE_ISSUES_EVENT,
  focusPublishFieldElement,
  getPublishIssuesFromErrors,
  markIncompletePublishFields,
  requestFocusPublishField,
  shouldOpenMoreSettings,
  type PublishIssue,
} from "@/lib/product-publish-checklist";
import { getCurrencySymbol, slugify, cn } from "@/lib/utils";
import {
  generateProductBarcode,
  generateProductSku,
} from "@/lib/product-code-generators";
import { DROPSHIPPING_PROVIDERS, normalizeSupplierProductUrl } from "@/lib/dropshipping/providers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/products/image-upload";
import { DigitalFileUpload } from "@/components/products/digital-file-upload";
import { DigitalProductInfo } from "@/components/products/digital-product-info";
import { PhysicalProductInfo } from "@/components/products/physical-product-info";
import { VariantEditor } from "@/components/products/variant-editor";
import { TagInput } from "@/components/products/tag-input";
import { ProductCatalogFields } from "@/components/products/product-catalog-fields";
import { ProductDetailsEditor } from "@/components/products/product-details-editor";
import { ProductSeoFields } from "@/components/products/product-seo-fields";
import { ProductStickySummary } from "@/components/products/product-sticky-summary";
import { DropshippingSetup, type DropshippingProvider } from "@/components/products/dropshipping-setup";
import {
  DIGITAL_DETAIL_PRESETS,
  DIGITAL_MANAGED_DETAIL_LABELS,
  PHYSICAL_DETAIL_PRESETS,
  PHYSICAL_MANAGED_DETAIL_LABELS,
} from "@/lib/catalog-defaults";
import type { Product } from "@/types";
import type { TicketPrinter } from "@/lib/ticket-printers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableMultiSelect } from "@/components/catalog/searchable-multi-select";
import { ProductChannelPanel } from "@/components/channels/product-channel-panel";
import { EtsySeoPanel } from "@/components/channels/etsy-seo-panel";
import { SmartPricingPanel } from "@/components/channels/smart-pricing-panel";

const RichTextEditor = dynamic(
  () => import("@/components/products/rich-text-editor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="premium-skeleton h-[160px] animate-pulse" />,
  }
);

interface ProductFormProps {
  currency: string;
  ticketPrinters?: TicketPrinter[];
  initialData?: Product;
  /** Prefill for new products (e.g. Academy Market import) — never auto-publishes */
  seedValues?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  formId: string;
  layout?: "sheet" | "page";
  storeSlug?: string;
  storeName?: string;
  /** Collapse advanced sections for first-product activation. */
  quickStart?: boolean;
  /** Called when publish/save fails form validation — so parent can show a checklist popup. */
  onValidationFailed?: (issues: PublishIssue[]) => void;
}

const defaultValues: ProductFormValues = {
  title: "",
  slug: null,
  description: "",
  price: 0,
  comparePrice: null,
  costPrice: null,
  inventory: 0,
  sku: "",
  barcode: "",
  status: "draft",
  productType: "physical",
  copyrightOwner: "",
  copyrightNotice: "",
  images: [],
  digitalFiles: [],
  variants: [],
  details: [],
  reviews: [],
  tags: [],
  ticketPrinterId: null,
  categoryId: null,
  collectionIds: [],
  seo: {},
  commerce: { ...DEFAULT_COMMERCE },
};

function toFormValues(product: Product): ProductFormValues {
  return {
    title: product.title,
    slug: product.slug ?? null,
    description: product.description ?? "",
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    costPrice: product.costPrice ?? null,
    inventory: product.inventory,
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    status: product.status,
    productType: product.productType,
    copyrightOwner: product.copyrightOwner ?? "",
    copyrightNotice: product.copyrightNotice ?? "",
    images: product.imageAssets?.length
      ? product.imageAssets
      : product.images.map((url) => ({ url })),
    digitalFiles: product.digitalFiles ?? [],
    variants: product.variants,
    details: product.details ?? [],
    reviews: product.reviews ?? [],
    tags: product.tags,
    ticketPrinterId: product.ticketPrinterId ?? null,
    categoryId: product.categoryId ?? null,
    collectionIds: product.collectionIds ?? [],
    seo: product.seo ?? {},
    commerce: { ...DEFAULT_COMMERCE, ...(product.commerce ?? {}) },
  };
}

const typeIcons = {
  physical: Package,
  digital: Download,
  service: Briefcase,
  dropshipping: Truck,
} as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="product-editor-card space-y-5">
      <div>
        <h3 className="product-editor-card-title">{title}</h3>
        {description ? <p className="product-editor-card-desc">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function AccordionBlock({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div>
          <p className="text-[13px] font-semibold">{title}</p>
          {description ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-black/[0.06] px-4 py-4 dark:border-white/10">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ProductForm({
  currency,
  ticketPrinters = [],
  initialData,
  seedValues,
  onSubmit,
  formId,
  layout = "sheet",
  storeSlug = "your-store",
  storeName,
  quickStart = false,
  onValidationFailed,
}: ProductFormProps) {
  const symbol = getCurrencySymbol(currency);
  const isPage = layout === "page";
  const [moreSettingsOpen, setMoreSettingsOpen] = useState(
    Boolean(initialData) && !quickStart
  );
  const [advancedOpen, setAdvancedOpen] = useState({
    copyright: false,
    custom: false,
    meta: false,
  });
  const [catalogProducts, setCatalogProducts] = useState<{ id: string; label: string }[]>([]);
  const [dropshipReady, setDropshipReady] = useState(
    () => initialData?.productType !== "dropshipping" || Boolean(initialData)
  );
  const [importing, setImporting] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [mediaTab, setMediaTab] = useState<"images" | "video" | "3d">("images");
  const [draftReady, setDraftReady] = useState(Boolean(initialData));
  const [guidanceIssues, setGuidanceIssues] = useState<PublishIssue[]>([]);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? toFormValues(initialData)
      : {
          ...defaultValues,
          sku: generateProductSku(),
          barcode: generateProductBarcode(),
          ...seedValues,
          commerce: {
            ...defaultValues.commerce,
            ...(seedValues?.commerce ?? {}),
          },
        },
  });

  const title = watch("title");
  const slug = watch("slug");
  const description = watch("description");
  const price = watch("price");
  const costPrice = watch("costPrice");
  const comparePrice = watch("comparePrice");
  const productType = watch("productType");
  const categoryId = watch("categoryId");
  const inventory = watch("inventory");
  const status = watch("status");
  const seo = watch("seo");
  const details = watch("details");
  const images = watch("images");
  const tags = watch("tags");
  const commerce = (watch("commerce") ?? DEFAULT_COMMERCE) as ProductCommerceSettings;

  const showInventory = productTracksInventory(productType);
  const isDigital = productType === "digital";
  const isPhysicalLike = productType === "physical" || productType === "dropshipping";
  const showDropshipGate = productType === "dropshipping" && !dropshipReady;

  const profit =
    typeof costPrice === "number" && costPrice >= 0 && typeof price === "number"
      ? Math.round((price - costPrice) * 100) / 100
      : null;
  const margin =
    profit != null && typeof price === "number" && price > 0
      ? Math.round((profit / price) * 1000) / 10
      : null;

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      setGuidanceIssues([]);
    }
  }, [errors]);

  // Clean oversized supplier links (tracking params) so save/publish isn't blocked
  useEffect(() => {
    const raw = commerce.dropshippingUrl ?? "";
    if (!raw || raw.length < 400) return;
    const cleaned = normalizeSupplierProductUrl(raw);
    if (cleaned && cleaned !== raw) {
      patchCommerce({ dropshippingUrl: cleaned });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when URL length/content needs cleanup
  }, [commerce.dropshippingUrl]);

  // Keep red underlines on every incomplete section, and scroll to the first one
  useEffect(() => {
    const ids = guidanceIssues.map((i) => i.id);
    markIncompletePublishFields(ids);
    if (ids.length === 0) return;

    if (shouldOpenMoreSettings(guidanceIssues)) {
      setMoreSettingsOpen(true);
    }
    if (ids.includes("images")) setMediaTab("images");

    const timer = window.setTimeout(() => {
      focusPublishFieldElement(ids[0]);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [guidanceIssues]);

  useEffect(() => {
    if (productType !== "dropshipping") setDropshipReady(true);
  }, [productType]);

  // Jump to missing publish fields from the checklist popup
  useEffect(() => {
    const onFocusField = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id) return;
      if (id === "category" || id === "details") setMoreSettingsOpen(true);
      if (id === "images") setMediaTab("images");
      window.setTimeout(
        () => focusPublishFieldElement(id),
        id === "category" || id === "details" ? 100 : 0
      );
    };
    const onGuidance = (event: Event) => {
      const issues = (event as CustomEvent<{ issues?: PublishIssue[] }>).detail?.issues;
      if (!Array.isArray(issues) || issues.length === 0) return;
      setGuidanceIssues(issues);
    };
    window.addEventListener(FOCUS_PUBLISH_FIELD_EVENT, onFocusField);
    window.addEventListener(GUIDANCE_ISSUES_EVENT, onGuidance);
    return () => {
      window.removeEventListener(FOCUS_PUBLISH_FIELD_EVENT, onFocusField);
      window.removeEventListener(GUIDANCE_ISSUES_EVENT, onGuidance);
    };
  }, []);

  // Restore unsaved new-product draft after reload
  useEffect(() => {
    if (initialData) {
      setDraftReady(true);
      return;
    }
    const draft = loadProductFormDraft(storeSlug);
    if (draft?.values) {
      reset({ ...defaultValues, ...draft.values });
      setDropshipReady(draft.dropshipReady);
      setMoreSettingsOpen(draft.moreSettingsOpen);
    }
    setDraftReady(true);
  }, [initialData, reset, storeSlug]);

  // Autosave new-product draft so reload keeps content
  useEffect(() => {
    if (initialData || !draftReady) return;
    const subscription = watch(() => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => {
        saveProductFormDraft(storeSlug, {
          values: getValues(),
          dropshipReady,
          moreSettingsOpen,
        });
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [
    draftReady,
    dropshipReady,
    getValues,
    initialData,
    moreSettingsOpen,
    storeSlug,
    watch,
  ]);

  useEffect(() => {
    if (initialData || !draftReady) return;
    saveProductFormDraft(storeSlug, {
      values: getValues(),
      dropshipReady,
      moreSettingsOpen,
    });
  }, [dropshipReady, moreSettingsOpen, draftReady, getValues, initialData, storeSlug]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.products)) return;
        setCatalogProducts(
          data.products
            .filter((p: { id: string }) => p.id !== initialData?.id)
            .map((p: { id: string; title: string }) => ({ id: p.id, label: p.title }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialData?.id]);

  const patchCommerce = (patch: Partial<ProductCommerceSettings>) => {
    setValue("commerce", { ...commerce, ...patch }, { shouldDirty: true });
  };

  const runAiAssist = () => {
    if (!title.trim()) {
      toast.error("Add a product name first");
      return;
    }
    setAiBusy(true);
    window.setTimeout(() => {
      const result = improveProductWithAi({ title, productType });
      setAiBusy(false);
      if (!result) return;
      setValue("description", result.description, { shouldDirty: true });
      setValue(
        "seo",
        {
          ...(seo ?? {}),
          title: result.seoTitle,
          description: result.seoDescription,
        },
        { shouldDirty: true }
      );
      setValue("tags", Array.from(new Set([...(tags ?? []), ...result.tags])), {
        shouldDirty: true,
      });
      patchCommerce({
        highlights: Array.from(
          new Set([...(commerce.highlights ?? []), ...result.highlights])
        ).slice(0, 12),
      });
      toast.success("AI improved description, SEO, highlights, and tags");
    }, 450);
  };

  const toggleHighlight = (label: string) => {
    const current = commerce.highlights ?? [];
    const next = current.includes(label)
      ? current.filter((h) => h !== label)
      : [...current, label].slice(0, 12);
    patchCommerce({ highlights: next });
  };

  const switchRowClass =
    "flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white/50 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]";
  const switchClass =
    "h-5 w-9 data-[state=checked]:bg-[#007AFF]/85 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:[&>span]:translate-x-4";

  const isEditing = Boolean(initialData);
  const productTypeSection = (
    <Section
      title="Product type"
      description={
        isEditing
          ? "Product type is locked after creation and cannot be changed."
          : "Choose how this product is fulfilled."
      }
    >
      <Controller
        name="productType"
        control={control}
        render={({ field }) => (
          <div
            className={cn("grid gap-2.5 sm:grid-cols-2", isEditing && "select-none")}
            aria-disabled={isEditing || undefined}
          >
            {PRODUCT_TYPE_OPTIONS.map((option) => {
              const selected = field.value === option.value;
              const Icon = typeIcons[option.value];
              const locked = isEditing;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={locked}
                  title={
                    locked
                      ? "Product type cannot be changed when editing"
                      : undefined
                  }
                  onClick={() => {
                    if (locked) return;
                    field.onChange(option.value);
                    if (option.value === "dropshipping" && !initialData) {
                      setDropshipReady(false);
                    }
                  }}
                  className={cn(
                    "product-editor-type-tile",
                    selected && "product-editor-type-tile-active",
                    locked && "product-editor-type-tile-locked"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        selected
                          ? locked
                            ? "bg-neutral-200 text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
                            : "bg-[#007AFF]/15 text-[#007AFF]"
                          : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <p className="text-[13px] font-semibold tracking-[-0.01em]">{option.label}</p>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        {option.description}
                      </p>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      />
    </Section>
  );

  const essentials = (
    <>
      <Section
        title="Basic details"
        description="Name and description customers see on your storefront."
      >
        <div className="space-y-2" data-publish-field="title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="title">Product name *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-[#007AFF]"
              disabled={aiBusy}
              onClick={runAiAssist}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {aiBusy ? "Improving…" : "Improve with AI"}
            </Button>
          </div>
          <Input id="title" placeholder="e.g. Handmade Leather Bag" {...register("title")} />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Tell customers what’s special — materials, fit, what’s included…"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Product highlights</Label>
          <p className="text-[11px] text-muted-foreground">Shown as checkmarks on the product page.</p>
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_PRESETS.map((h) => {
              const on = (commerce.highlights ?? []).includes(h);
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggleHighlight(h)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    on
                      ? "border-[#007AFF]/40 bg-[#007AFF]/10 text-[#007AFF]"
                      : "border-black/10 bg-white/60 text-muted-foreground hover:border-black/20 dark:border-white/10 dark:bg-white/5"
                  )}
                >
                  {on ? "✓ " : ""}
                  {h}
                </button>
              );
            })}
          </div>
          <Input
            placeholder="Custom highlight + Enter"
            className="mt-1"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const value = (e.target as HTMLInputElement).value.trim();
              if (!value) return;
              toggleHighlight(value);
              (e.target as HTMLInputElement).value = "";
            }}
          />
        </div>
      </Section>

      <Section title="Media" description="First image is the cover. Photos are compressed automatically.">
        <div data-publish-field="images" className="space-y-4 rounded-xl">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "images" as const, label: "Add images", icon: ImagePlus },
              { id: "video" as const, label: "Add video", icon: Film },
              { id: "3d" as const, label: "Add 3D model", icon: Box },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMediaTab(tab.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors",
                  mediaTab === tab.id
                    ? "border-[#007AFF]/35 bg-[#007AFF]/10 text-[#007AFF]"
                    : "border-black/10 bg-white/60 text-muted-foreground dark:border-white/10 dark:bg-white/5"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {mediaTab === "images" ? (
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <ImageUpload
                images={field.value}
                onChange={field.onChange}
                variant={isDigital ? "ebook" : "product"}
              />
            )}
          />
        ) : null}

        {mediaTab === "video" ? (
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input
              placeholder="YouTube or MP4 link"
              value={(commerce.videos ?? [])[0] ?? ""}
              onChange={(e) =>
                patchCommerce({
                  videos: e.target.value.trim() ? [e.target.value.trim()] : [],
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Paste a link for now — upload support comes next.
            </p>
          </div>
        ) : null}

        {mediaTab === "3d" ? (
          <div className="space-y-2">
            <Label>3D model URL</Label>
            <Input
              placeholder="GLB / GLTF link"
              value={(commerce.models3d ?? [])[0] ?? ""}
              onChange={(e) =>
                patchCommerce({
                  models3d: e.target.value.trim() ? [e.target.value.trim()] : [],
                })
              }
            />
          </div>
        ) : null}
        </div>
      </Section>

      {isDigital ? (
        <Section title="Digital file (PDF)" description="Upload the PDF customers receive (up to 3 files).">
          <div data-publish-field="digitalFiles">
            <Controller
              name="digitalFiles"
              control={control}
              render={({ field }) => (
                <DigitalFileUpload files={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </Section>
      ) : null}

      <Section title="Pricing" description="What customers pay — and what you keep.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2" data-publish-field="price">
            <Label htmlFor="price">Price * ({currency})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="pl-10"
                {...register("price", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return 0;
                    const n = typeof v === "number" ? v : Number(v);
                    return Number.isNaN(n) ? 0 : n;
                  },
                })}
              />
            </div>
            {errors.price ? (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comparePrice">Compare-at price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Original price"
                className="pl-10"
                {...register("comparePrice", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : v),
                })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost per item</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Your cost"
                className="pl-10"
                {...register("costPrice", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : v),
                })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/[0.06] bg-white/50 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] text-muted-foreground">Profit</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {profit != null ? `${symbol}${profit.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white/50 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[11px] text-muted-foreground">Margin</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {margin != null ? `${margin}%` : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className={switchRowClass}>
          <div>
            <p className="text-[13px] font-medium">Tax included</p>
            <p className="text-[11px] text-muted-foreground">Price already includes tax</p>
          </div>
          <Switch
            checked={commerce.taxIncluded === true}
            onCheckedChange={(v) => patchCommerce({ taxIncluded: v })}
            className={switchClass}
          />
        </div>
        {typeof comparePrice === "number" && comparePrice > price ? (
          <p className="text-xs text-muted-foreground">
            Shows as a strikethrough sale price on the storefront.
          </p>
        ) : null}
      </Section>

      <Section title="Inventory" description="Stock, SKU, and low-stock alerts.">
        <div className="space-y-4">
          <div className={switchRowClass}>
            <div>
              <p className="text-[13px] font-medium">Track quantity</p>
              <p className="text-[11px] text-muted-foreground">Count stock for this product</p>
            </div>
            <Switch
              checked={commerce.trackQuantity !== false && showInventory}
              disabled={!showInventory}
              onCheckedChange={(v) => patchCommerce({ trackQuantity: v })}
              className={switchClass}
            />
          </div>

          {showInventory && commerce.trackQuantity !== false ? (
            <div className="grid gap-4 sm:grid-cols-2" data-publish-field="inventory">
              <div className="space-y-2">
                <Label htmlFor="inventory">Quantity</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  {...register("inventory", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined) return 0;
                      const n = typeof v === "number" ? v : Number(v);
                      return Number.isNaN(n) ? 0 : Math.max(0, Math.floor(n));
                    },
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStock">Low stock alert</Label>
                <Input
                  id="lowStock"
                  type="number"
                  min="0"
                  value={commerce.lowStockAlert ?? 5}
                  onChange={(e) =>
                    patchCommerce({
                      lowStockAlert: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-black/[0.05] bg-white/40 px-3.5 py-2.5 text-xs text-muted-foreground">
              {isDigital
                ? "Digital products don’t use warehouse stock."
                : "Inventory tracking is off for this product."}
            </p>
          )}

          <div className="space-y-2">
            <Label>Inventory location</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: "warehouse" as const, label: "Main warehouse", hint: "Your own stock" },
                  {
                    id: "supplier" as const,
                    label: "Supplier inventory",
                    hint: "Dropshipping / partner stock",
                  },
                ] as const
              ).map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => patchCommerce({ inventoryLocation: loc.id })}
                  className={cn(
                    "product-editor-type-tile",
                    (commerce.inventoryLocation ?? "warehouse") === loc.id &&
                      "product-editor-type-tile-active"
                  )}
                >
                  <p className="text-[13px] font-semibold">{loc.label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{loc.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className={switchRowClass}>
            <div>
              <p className="text-[13px] font-medium">Continue selling when out of stock</p>
              <p className="text-[11px] text-muted-foreground">Allow orders at 0 quantity</p>
            </div>
            <Switch
              checked={commerce.continueSellingWhenOutOfStock === true}
              onCheckedChange={(v) => patchCommerce({ continueSellingWhenOutOfStock: v })}
              className={switchClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="sku">SKU / product code</Label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-[#007AFF] hover:underline"
                  onClick={() =>
                    setValue("sku", generateProductSku(), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Generate
                </button>
              </div>
              <Input
                id="sku"
                placeholder="Auto on save"
                {...register("sku")}
              />
              <p className="text-[11px] text-muted-foreground">
                Assigned automatically if empty. Scan or search this code in inventory.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-[#007AFF] hover:underline"
                  onClick={() =>
                    setValue("barcode", generateProductBarcode(), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Generate
                </button>
              </div>
              <Input
                id="barcode"
                placeholder="Auto EAN-13 on save"
                {...register("barcode")}
              />
              <p className="text-[11px] text-muted-foreground">
                Printed on e-tickets. Scanning it finds this product.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {!quickStart ? (
        <Section title="Variants" description="Color, size, or any custom option — with images per value.">
          <div data-publish-field="variants">
            <Controller
              name="variants"
              control={control}
              render={({ field }) => (
                <VariantEditor variants={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </Section>
      ) : null}
    </>
  );

  const moreSettings = (
    <>
      {quickStart ? (
        <Section title="Variants" description="Color, size, or any custom option — with images per value.">
          <div data-publish-field="variants">
            <Controller
              name="variants"
              control={control}
              render={({ field }) => (
                <VariantEditor variants={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </Section>
      ) : null}
      <Section
        title={isDigital ? "Product info" : isPhysicalLike ? "Product info" : "Product details"}
        description="Basic specs first — open more only if you need them."
      >
        <div data-publish-field="details">
        <Controller
          name="details"
          control={control}
          render={({ field }) =>
            isDigital ? (
              <div className="space-y-6">
                <DigitalProductInfo details={field.value} onChange={field.onChange} />
                <div className="border-t border-border/60 pt-5">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">Extra specs</p>
                  <ProductDetailsEditor
                    details={field.value}
                    onChange={field.onChange}
                    presets={DIGITAL_DETAIL_PRESETS}
                    hideLabels={DIGITAL_MANAGED_DETAIL_LABELS}
                    emptyHint="Add custom fields if needed."
                  />
                </div>
              </div>
            ) : isPhysicalLike ? (
              <div className="space-y-6">
                <PhysicalProductInfo details={field.value} onChange={field.onChange} />
                <div className="border-t border-border/60 pt-5">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">Extra specs</p>
                  <ProductDetailsEditor
                    details={field.value}
                    onChange={field.onChange}
                    presets={PHYSICAL_DETAIL_PRESETS}
                    hideLabels={PHYSICAL_MANAGED_DETAIL_LABELS}
                    emptyHint="Add custom fields if needed."
                  />
                </div>
              </div>
            ) : (
              <ProductDetailsEditor details={field.value} onChange={field.onChange} />
            )
          }
        />
        </div>
      </Section>

      <Section title="Organization" description="Category, brand, vendor, collections, and tags.">
        <div data-publish-field="category" className="space-y-2 rounded-xl">
          <ProductCatalogFields
            categoryId={categoryId}
            collectionIds={watch("collectionIds")}
            onCategoryChange={(id) => setValue("categoryId", id, { shouldDirty: true })}
            onCollectionsChange={(ids) => setValue("collectionIds", ids, { shouldDirty: true })}
            productType={productType}
          />
          {errors.categoryId ? (
            <p className="text-xs text-destructive">{errors.categoryId.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Input
              value={commerce.brand ?? ""}
              placeholder="Brand name"
              onChange={(e) => patchCommerce({ brand: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Input
              value={commerce.vendor ?? ""}
              placeholder="Vendor"
              onChange={(e) => patchCommerce({ vendor: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input
              value={commerce.supplier ?? ""}
              placeholder="Supplier"
              onChange={(e) => patchCommerce({ supplier: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput tags={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </Section>

      <Section title="Shipping & tax" description="Delivery and tax settings for this product.">
        <div className="space-y-2">
          <Label>Shipping profile</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { id: "standard" as const, label: "Standard delivery", hint: "Default rates" },
                { id: "express" as const, label: "Express delivery", hint: "Faster, higher rate" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => patchCommerce({ shippingProfile: p.id })}
                className={cn(
                  "product-editor-type-tile",
                  (commerce.shippingProfile ?? "standard") === p.id &&
                    "product-editor-type-tile-active"
                )}
              >
                <p className="text-[13px] font-semibold">{p.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{p.hint}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {(
            [
              {
                key: "requiresShipping" as const,
                label: "Requires shipping",
                hint: "Physical delivery needed",
              },
              {
                key: "freeShipping" as const,
                label: "Free shipping",
                hint: "Waive shipping on this item",
              },
              {
                key: "chargeTax" as const,
                label: "Charge tax",
                hint: "Apply tax at checkout",
              },
            ] as const
          ).map((row) => (
            <div key={row.key} className={switchRowClass}>
              <div>
                <p className="text-[13px] font-medium">{row.label}</p>
                <p className="text-[11px] text-muted-foreground">{row.hint}</p>
              </div>
              <Switch
                checked={Boolean(commerce[row.key])}
                onCheckedChange={(v) => patchCommerce({ [row.key]: v })}
                className={switchClass}
              />
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Package weight (kg)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={commerce.packageWeight ?? ""}
                onChange={(e) =>
                  patchCommerce({
                    packageWeight: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>HS Code</Label>
              <Input
                value={commerce.hsCode ?? ""}
                placeholder="e.g. 4202.21"
                onChange={(e) => patchCommerce({ hsCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Country of origin</Label>
              <Input
                value={commerce.countryOfOrigin ?? ""}
                placeholder="e.g. Morocco"
                onChange={(e) => patchCommerce({ countryOfOrigin: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Schedule" description="Publish now or schedule for later.">
        <div className="grid gap-3 sm:grid-cols-2">
          {(["now", "schedule"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => patchCommerce({ publishMode: mode })}
              className={cn(
                "product-editor-type-tile",
                commerce.publishMode === mode && "product-editor-type-tile-active"
              )}
            >
              <p className="text-[13px] font-semibold">
                {mode === "now" ? "Publish now" : "Schedule"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {mode === "now"
                  ? "Goes live when status is Active"
                  : "Pick a date and time"}
              </p>
            </button>
          ))}
        </div>
        {commerce.publishMode === "schedule" ? (
          <div className="space-y-2">
            <Label>Publish at</Label>
            <Input
              type="datetime-local"
              value={commerce.publishAt?.slice(0, 16) ?? ""}
              onChange={(e) =>
                patchCommerce({
                  publishAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
        ) : null}
      </Section>

      <Section title="Related products" description="Cross-sells shown on the product page.">
        <SearchableMultiSelect
          label="Frequently bought together"
          options={catalogProducts}
          value={commerce.frequentlyBoughtIds ?? []}
          onChange={(ids) => patchCommerce({ frequentlyBoughtIds: ids })}
          placeholder="Search products..."
          emptyMessage={catalogProducts.length === 0 ? "No other products yet" : "No match"}
        />
        <SearchableMultiSelect
          label="Related"
          options={catalogProducts}
          value={commerce.relatedProductIds ?? []}
          onChange={(ids) => patchCommerce({ relatedProductIds: ids })}
          placeholder="Search products..."
          emptyMessage={catalogProducts.length === 0 ? "No other products yet" : "No match"}
        />
        <SearchableMultiSelect
          label="Upsells"
          options={catalogProducts}
          value={commerce.upsellProductIds ?? []}
          onChange={(ids) => patchCommerce({ upsellProductIds: ids })}
          placeholder="Search products..."
          emptyMessage={catalogProducts.length === 0 ? "No other products yet" : "No match"}
        />
      </Section>

      <Section title="SEO" description="How this product appears in Google.">
        <Controller
          name="seo"
          control={control}
          render={({ field }) => (
            <ProductSeoFields
              seo={field.value ?? {}}
              onChange={field.onChange}
              productTitle={title}
              productDescription={description}
              storeSlug={storeSlug}
              storeName={storeName}
              productSlug={slug || slugify(title || "") || null}
              onSlugChange={(s) => setValue("slug", s || null, { shouldDirty: true })}
            />
          )}
        />
      </Section>

      {initialData?.id ? (
        <Section
          title="Sales Channels"
          description="Publish this product to other marketplaces and keep pricing + SEO on point."
        >
          <div className="space-y-3">
            <ProductChannelPanel productId={initialData.id} productTitle={title} />
            <EtsySeoPanel
              title={title || ""}
              tags={tags ?? []}
              description={description ?? ""}
              imageCount={Array.isArray(images) ? images.length : 0}
              onApplyTags={(nextTags) => setValue("tags", nextTags, { shouldDirty: true })}
              onApplySeoTitle={(nextTitle) => setValue("title", nextTitle, { shouldDirty: true })}
            />
            <SmartPricingPanel
              cost={costPrice ?? 0}
              currency={currency}
              onApplyPrice={(nextPrice) => setValue("price", nextPrice, { shouldDirty: true })}
            />
          </div>
        </Section>
      ) : null}

      <section className="product-editor-card space-y-4">
        <div>
          <h3 className="product-editor-card-title">Advanced settings</h3>
          <p className="product-editor-card-desc">
            Copyright, custom fields, and metafields.
          </p>
        </div>

        <AccordionBlock
          title="Copyright protection"
          description="Owner and notice on digital / branded goods"
          open={advancedOpen.copyright}
          onToggle={() => setAdvancedOpen((s) => ({ ...s, copyright: !s.copyright }))}
        >
          <div className="space-y-2">
            <Label htmlFor="copyrightOwner">Copyright owner</Label>
            <Input
              id="copyrightOwner"
              placeholder="Your brand"
              {...register("copyrightOwner")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="copyrightNotice">Copyright notice</Label>
            <Textarea
              id="copyrightNotice"
              rows={3}
              placeholder="© 2026 Your Brand. All rights reserved."
              {...register("copyrightNotice")}
            />
          </div>
        </AccordionBlock>

        <AccordionBlock
          title="Custom fields"
          description="Extra key / value pairs for this product"
          open={advancedOpen.custom}
          onToggle={() => setAdvancedOpen((s) => ({ ...s, custom: !s.custom }))}
        >
          <div className="space-y-2">
            {(commerce.customFields ?? []).map((row, index) => (
              <div key={row.id} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={row.key}
                  onChange={(e) => {
                    const next = [...(commerce.customFields ?? [])];
                    next[index] = { ...row, key: e.target.value };
                    patchCommerce({ customFields: next });
                  }}
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...(commerce.customFields ?? [])];
                    next[index] = { ...row, value: e.target.value };
                    patchCommerce({ customFields: next });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    patchCommerce({
                      customFields: (commerce.customFields ?? []).filter((f) => f.id !== row.id),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                patchCommerce({
                  customFields: [
                    ...(commerce.customFields ?? []),
                    { id: crypto.randomUUID(), key: "", value: "" },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add field
            </Button>
          </div>
        </AccordionBlock>

        <AccordionBlock
          title="Metafields"
          description="Namespaced data for integrations and themes"
          open={advancedOpen.meta}
          onToggle={() => setAdvancedOpen((s) => ({ ...s, meta: !s.meta }))}
        >
          <div className="space-y-2">
            {(commerce.metafields ?? []).map((row, index) => (
              <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <Input
                  placeholder="Namespace"
                  value={row.namespace}
                  onChange={(e) => {
                    const next = [...(commerce.metafields ?? [])];
                    next[index] = { ...row, namespace: e.target.value };
                    patchCommerce({ metafields: next });
                  }}
                />
                <Input
                  placeholder="Key"
                  value={row.key}
                  onChange={(e) => {
                    const next = [...(commerce.metafields ?? [])];
                    next[index] = { ...row, key: e.target.value };
                    patchCommerce({ metafields: next });
                  }}
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...(commerce.metafields ?? [])];
                    next[index] = { ...row, value: e.target.value };
                    patchCommerce({ metafields: next });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    patchCommerce({
                      metafields: (commerce.metafields ?? []).filter((f) => f.id !== row.id),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                patchCommerce({
                  metafields: [
                    ...(commerce.metafields ?? []),
                    { id: crypto.randomUUID(), namespace: "custom", key: "", value: "" },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add metafield
            </Button>
          </div>
        </AccordionBlock>
      </section>
    </>
  );

  const mainColumn = (
    <>
      {guidanceIssues.length > 0 ? (
        <div className="product-editor-card space-y-3 border-amber-500/25 bg-amber-500/[0.06] !p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                Finish these to continue
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Tap an item — we’ll scroll you to the exact field.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGuidanceIssues([])}
              className="rounded-full p-1 text-muted-foreground hover:bg-black/[0.05] hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {guidanceIssues.map((issue) => (
              <li key={`${issue.id}-${issue.hint}`}>
                <button
                  type="button"
                  onClick={() => requestFocusPublishField(issue.id)}
                  className="flex w-full items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-white/70 px-3 py-2.5 text-left transition-colors hover:border-amber-500/40 dark:bg-white/[0.04]"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold">{issue.label}</span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">
                      {issue.hint}
                    </span>
                    <span className="mt-1 inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                      {issue.where}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-[#007AFF]">Go →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {productTypeSection}

      {quickStart ? (
        <div className="product-editor-card !py-3.5">
          <p className="text-[13px] font-semibold tracking-tight text-foreground">
            First product — keep it simple
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Add a name, price, and photos, then publish. Open More settings only if you need variants, SEO, or shipping details.
          </p>
        </div>
      ) : null}

      {showDropshipGate ? (
        <DropshippingSetup
          provider={(commerce.dropshippingProvider as DropshippingProvider | "") || ""}
          url={commerce.dropshippingUrl ?? ""}
          importing={importing}
          onProviderChange={(p) =>
            patchCommerce({
              dropshippingProvider: p,
              supplier:
                p === "aliexpress"
                  ? "AliExpress"
                  : p === "cj"
                    ? "CJdropshipping"
                    : "BigBuy",
              inventoryLocation: "supplier",
            })
          }
          onUrlChange={(url) => {
            const patch: Partial<ProductCommerceSettings> = {
              dropshippingUrl: normalizeSupplierProductUrl(url) || url,
            };
            try {
              const host = new URL(url.trim()).hostname.toLowerCase();
              if (host.includes("aliexpress")) {
                patch.dropshippingProvider = "aliexpress";
                patch.supplier = "AliExpress";
                patch.inventoryLocation = "supplier";
              } else if (host.includes("cjdrop")) {
                patch.dropshippingProvider = "cj";
                patch.supplier = "CJdropshipping";
                patch.inventoryLocation = "supplier";
              } else if (host.includes("bigbuy")) {
                patch.dropshippingProvider = "bigbuy";
                patch.supplier = "BigBuy";
                patch.inventoryLocation = "supplier";
              }
            } catch {
              // ignore invalid partial URLs while typing
            }
            patchCommerce(patch);
          }}
          onImport={async () => {
            const provider = commerce.dropshippingProvider as DropshippingProvider | "";
            const url = normalizeSupplierProductUrl(
              (commerce.dropshippingUrl ?? "").trim()
            );
            if (!provider || !url) {
              toast.error("Choose a supplier and paste a product URL");
              return;
            }
            setImporting(true);
            try {
              // Wipe previous product so a new link never mixes with old import data
              setValue("title", "", { shouldDirty: true });
              setValue("description", "", { shouldDirty: true });
              setValue("price", 0, { shouldDirty: true });
              setValue("comparePrice", null, { shouldDirty: true });
              setValue("costPrice", null, { shouldDirty: true });
              setValue("sku", "", { shouldDirty: true });
              setValue("barcode", "", { shouldDirty: true });
              setValue("slug", null, { shouldDirty: true });
              setValue("images", [], { shouldDirty: true });
              setValue("variants", [], { shouldDirty: true });
              setValue("details", [], { shouldDirty: true });
              setValue("tags", [], { shouldDirty: true });
              patchCommerce({
                brand: "",
                highlights: [],
                packageWeight: null,
                videos: [],
                models3d: [],
              });

              const res = await fetch("/api/products/import-dropship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, provider, rehostImages: false }),
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.message ?? "Import failed");
              }
              const imported = data.product as {
                title?: string;
                description?: string;
                price?: number | null;
                comparePrice?: number | null;
                currency?: string | null;
                sku?: string | null;
                barcode?: string | null;
                brand?: string | null;
                tags?: string[];
                highlights?: string[];
                details?: { id: string; label: string; value: string }[];
                variants?: {
                  id: string;
                  name: string;
                  options: string[];
                  optionImages?: Record<string, string>;
                }[];
                packageWeightKg?: number | null;
                images?: {
                  url: string;
                  width?: number | null;
                  height?: number | null;
                  sizeBytes?: number | null;
                  alt?: string | null;
                }[];
                warnings?: string[];
              };

              const title = imported.title?.trim() || "";
              const salePrice =
                typeof imported.price === "number" && imported.price > 0
                  ? imported.price
                  : null;
              const originalPrice =
                typeof imported.comparePrice === "number" && imported.comparePrice > 0
                  ? imported.comparePrice
                  : null;
              // Sell price starts at supplier sale; compare-at = original (strikethrough)
              const sellPrice = salePrice ?? originalPrice ?? 0;
              const compareAt =
                originalPrice && originalPrice > sellPrice
                  ? originalPrice
                  : null;
              // Cost = what you pay the supplier (sale price)
              const cost = salePrice ?? (originalPrice && originalPrice > 0 ? originalPrice : null);

              const plainDescription = (imported.description || "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              const seoTitle = title.slice(0, 70);
              const seoDescription = plainDescription.slice(0, 160);
              const autoSlug = title ? slugify(title).slice(0, 200) : null;
              const brand = imported.brand?.trim() || "";
              const supplierLabel =
                provider === "aliexpress"
                  ? "AliExpress"
                  : provider === "cj"
                    ? "CJdropshipping"
                    : "BigBuy";

              setValue("title", title, { shouldDirty: true });
              setValue("description", imported.description || "", { shouldDirty: true });
              setValue("slug", autoSlug, { shouldDirty: true });
              setValue("price", sellPrice, { shouldDirty: true });
              setValue("comparePrice", compareAt, { shouldDirty: true });
              setValue("costPrice", cost, { shouldDirty: true });
              setValue("sku", imported.sku || "", { shouldDirty: true });
              setValue("barcode", imported.barcode || "", { shouldDirty: true });
              setValue(
                "images",
                Array.isArray(imported.images)
                  ? imported.images.map((img, i) => ({
                      url: img.url,
                      width: img.width ?? null,
                      height: img.height ?? null,
                      sizeBytes: img.sizeBytes ?? null,
                      alt: img.alt?.trim() || (title ? `${title.slice(0, 80)} ${i + 1}` : null),
                    }))
                  : [],
                { shouldDirty: true }
              );
              setValue(
                "variants",
                Array.isArray(imported.variants)
                  ? imported.variants.map((v) => ({
                      id: v.id || crypto.randomUUID(),
                      name: v.name,
                      options: v.options?.length ? v.options : [""],
                      optionImages: v.optionImages,
                    }))
                  : [],
                { shouldDirty: true }
              );
              setValue(
                "details",
                Array.isArray(imported.details)
                  ? imported.details.map((d) => ({
                      id: d.id || crypto.randomUUID(),
                      label: d.label,
                      value: d.value,
                    }))
                  : [],
                { shouldDirty: true }
              );
              if (imported.details?.length) setMoreSettingsOpen(true);
              setValue("tags", Array.isArray(imported.tags) ? imported.tags : [], {
                shouldDirty: true,
              });
              setValue(
                "seo",
                {
                  title: seoTitle,
                  description: seoDescription,
                  keywords: Array.isArray(imported.tags)
                    ? imported.tags.slice(0, 12)
                    : [],
                },
                { shouldDirty: true }
              );

              patchCommerce({
                inventoryLocation: "supplier",
                trackQuantity: false,
                continueSellingWhenOutOfStock: true,
                requiresShipping: true,
                dropshippingUrl: url,
                dropshippingProvider: provider,
                supplier: supplierLabel,
                vendor: brand || supplierLabel,
                brand,
                highlights: Array.isArray(imported.highlights)
                  ? imported.highlights.slice(0, 12)
                  : [],
                packageWeight:
                  typeof imported.packageWeightKg === "number"
                    ? imported.packageWeightKg
                    : null,
                countryOfOrigin:
                  provider === "aliexpress" || provider === "cj" ? "China" : "",
              });

              setDropshipReady(true);
              const warnings = imported.warnings?.filter(Boolean) ?? [];
              const extras: string[] = [];
              if (sellPrice > 0) extras.push(`price ${sellPrice}`);
              if (compareAt) extras.push(`original ${compareAt}`);
              if (cost != null) extras.push(`cost ${cost}`);
              if (imported.variants?.length) extras.push(`${imported.variants.length} variant options`);
              if (imported.details?.length) extras.push(`${imported.details.length} specs`);
              if (imported.images?.length) extras.push(`${imported.images.length} photos`);
              if (warnings.length) {
                toast.success("Product imported — review the details", {
                  description: [...extras, ...warnings.slice(0, 2)].join(" · "),
                });
              } else {
                toast.success("Product imported", {
                  description: extras.length ? extras.join(" · ") : "Ready to review and publish",
                });
              }
              if (imported.currency && imported.currency.toUpperCase() !== currency.toUpperCase()) {
                toast.message(`Supplier price is in ${imported.currency}`, {
                  description: `Your store uses ${currency}. Adjust sell / compare / cost before publishing.`,
                });
              }
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Import failed");
            } finally {
              setImporting(false);
            }
          }}
          onCreateManually={() => setDropshipReady(true)}
        />
      ) : (
        <>
          {productType === "dropshipping" ? (
            <section
              data-publish-field="dropshippingUrl"
              className="product-editor-card flex flex-wrap items-center justify-between gap-3 !py-3.5"
            >
              <div className="min-w-0 flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Link2 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-[-0.01em]">
                    {commerce.dropshippingProvider
                      ? `Imported from ${
                          DROPSHIPPING_PROVIDERS.find(
                            (p) => p.id === commerce.dropshippingProvider
                          )?.label ?? commerce.supplier ?? "supplier"
                        }`
                      : "Dropshipping source"}
                  </p>
                  {commerce.dropshippingUrl ? (
                    <p
                      className="mt-0.5 truncate text-[11px] text-muted-foreground"
                      title={commerce.dropshippingUrl}
                    >
                      {commerce.dropshippingUrl}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      No supplier link on this product.
                    </p>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {essentials}

          <button
            type="button"
            onClick={() => setMoreSettingsOpen((o) => !o)}
            className="product-editor-card flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <h3 className="product-editor-card-title">More settings</h3>
              <p className="product-editor-card-desc">
                Product info, organization, shipping, SEO, and advanced
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                moreSettingsOpen && "rotate-180"
              )}
            />
          </button>

          {moreSettingsOpen ? moreSettings : null}
        </>
      )}
    </>
  );

  const sticky = (
    <ProductStickySummary
      status={status}
      onStatusChange={(s) => setValue("status", s, { shouldDirty: true })}
      commerce={commerce}
      onCommerceChange={(c) => setValue("commerce", c, { shouldDirty: true })}
      inventory={inventory || 0}
      title={title}
      description={description}
      seoTitle={seo?.title}
      seoDescription={seo?.description}
      imagesCount={Array.isArray(images) ? images.length : 0}
      categoryId={categoryId}
      hasDetails={(details ?? []).length > 0}
      storeSlug={storeSlug}
      productSlug={slug || initialData?.slug || null}
    />
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit, (errs) => {
        const issues = getPublishIssuesFromErrors(errs);
        setGuidanceIssues(issues);

        if (shouldOpenMoreSettings(issues)) {
          setMoreSettingsOpen(true);
        }

        if (issues.length > 0) {
          onValidationFailed?.(issues);
          return;
        }

        toast.error("Can’t save yet", {
          description: "Open the checklist and tap an item to jump to that field.",
        });
      })}
      className={
        isPage
          ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:gap-6"
          : "space-y-5"
      }
    >
      <input type="hidden" {...register("status")} />
      {isPage ? (
        <>
          <div className="space-y-5">{mainColumn}</div>
          {sticky}
        </>
      ) : (
        <>
          {mainColumn}
          {sticky}
        </>
      )}
    </form>
  );
}
