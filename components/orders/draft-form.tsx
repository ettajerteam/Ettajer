"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Check,
  Circle,
  CreditCard,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  ScanBarcode,
  Search,
  StickyNote,
  Trash2,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";
import { dashboardCard, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { isProductType, productTracksInventory } from "@/lib/product-types";
import type { DraftDetail, DraftPaymentMethod } from "@/types/drafts";
import type { CustomerListItem } from "@/types/customers";
import type { Product } from "@/types";

interface DraftLineItem {
  productId: string;
  title: string;
  image: string | null;
  price: number;
  catalogPrice: number;
  inventory: number;
  tracksInventory: boolean;
  sku: string | null;
  barcode: string | null;
  quantity: number;
}

interface DraftFormProps {
  products: Product[];
  currency: string;
  draft?: DraftDetail;
  recentCustomers?: CustomerListItem[];
}

const fieldClass =
  "h-8 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] shadow-none focus-visible:ring-1 focus-visible:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]";

const PAYMENT_OPTIONS: {
  value: DraftPaymentMethod;
  label: string;
  hint: string;
  icon: typeof Banknote;
}[] = [
  { value: "cod", label: "Cash on delivery", hint: "Collect on delivery", icon: Banknote },
  { value: "paypal", label: "PayPal", hint: "Pay via PayPal", icon: Wallet },
  { value: "stripe", label: "Card / online", hint: "Paid via card", icon: CreditCard },
  { value: "other", label: "Other", hint: "Transfer or manual", icon: Wallet },
];

function productStockMeta(product: Product) {
  const type = isProductType(product.productType) ? product.productType : "physical";
  const tracks = productTracksInventory(type);
  return { tracks, outOfStock: tracks && product.inventory <= 0 };
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export function DraftForm({
  products,
  currency,
  draft,
  recentCustomers = [],
}: DraftFormProps) {
  const router = useRouter();
  const isEdit = Boolean(draft);
  const customerSearchRef = useRef<HTMLDivElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState(draft?.customerName ?? "");
  const [customerEmail, setCustomerEmail] = useState(draft?.customerEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState(draft?.customerPhone ?? "");
  const [street, setStreet] = useState(draft?.shippingAddress?.street ?? "");
  const [city, setCity] = useState(draft?.shippingAddress?.city ?? "");
  const [state, setState] = useState(draft?.shippingAddress?.state ?? "");
  const [postalCode, setPostalCode] = useState(draft?.shippingAddress?.postalCode ?? "");
  const [country, setCountry] = useState(draft?.shippingAddress?.country || "Morocco");
  const [shipping, setShipping] = useState(String(draft?.shipping ?? 0));
  const [tax, setTax] = useState(String(draft?.tax ?? 0));
  const [discount, setDiscount] = useState(String(draft?.discount ?? 0));
  const [paymentMethod, setPaymentMethod] = useState<DraftPaymentMethod>(
    draft?.paymentMethod ?? "cod"
  );
  const [merchantNote, setMerchantNote] = useState(draft?.merchantNote ?? "");
  const [productSearch, setProductSearch] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerListItem[]>([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [items, setItems] = useState<DraftLineItem[]>(() => {
    const catalog = new Map(products.map((p) => [p.id, p]));
    return (
      draft?.items.map((item) => {
        const product = catalog.get(item.productId);
        const type = product
          ? isProductType(product.productType)
            ? product.productType
            : "physical"
          : "physical";
        return {
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: item.price,
          catalogPrice: product?.price ?? item.price,
          inventory: item.inventory,
          tracksInventory: productTracksInventory(type),
          sku: product?.sku ?? null,
          barcode: product?.barcode ?? null,
          quantity: item.quantity,
        };
      }) ?? []
    );
  });

  const markDirty = () => setDirty(true);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!customerSearchRef.current?.contains(e.target as Node)) {
        setCustomerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = customerQuery.trim();
    if (q.length < 2) {
      setCustomerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(q)}&sort=recent`);
        const data = await res.json();
        if (res.ok) setCustomerResults(data.customers ?? []);
      } finally {
        setCustomerLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [customerQuery]);

  const sellableProducts = useMemo(
    () => products.filter((p) => p.status !== "archived"),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    let list = sellableProducts;
    if (q) {
      list = sellableProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
      list = [...list].sort((a, b) => {
        const score = (p: Product) => {
          if (p.barcode?.toLowerCase() === q) return 0;
          if (p.sku?.toLowerCase() === q) return 1;
          if (p.title.toLowerCase().startsWith(q)) return 2;
          return 3;
        };
        return score(a) - score(b);
      });
    }
    return list.slice(0, 12);
  }, [sellableProducts, productSearch]);

  const suggestionCustomers = useMemo(() => {
    if (customerQuery.trim().length >= 2) return customerResults;
    return recentCustomers.slice(0, 5);
  }, [customerQuery, customerResults, recentCustomers]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingValue = Number(shipping) || 0;
  const taxValue = Number(tax) || 0;
  const discountValue = Math.min(
    Math.max(0, Number(discount) || 0),
    subtotal + shippingValue + taxValue
  );
  const total = Math.max(0, subtotal + shippingValue + taxValue - discountValue);
  const wa = whatsappHref(customerPhone);

  const checklist = [
    {
      id: "customer",
      label: "Customer details",
      done: Boolean(customerName.trim() && customerEmail.trim()),
    },
    { id: "products", label: "At least one product", done: items.length > 0 },
    {
      id: "address",
      label: "Shipping address",
      done: Boolean(street.trim() && city.trim()),
      optional: true,
    },
    { id: "payment", label: "Payment method", done: Boolean(paymentMethod) },
  ] as const;

  async function selectCustomer(customer: CustomerListItem) {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone ?? "");
    setCustomerQuery("");
    setCustomerOpen(false);
    markDirty();

    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      const data = await res.json();
      if (res.ok && data.customer?.address) {
        const addr = data.customer.address;
        setStreet(addr.street ?? "");
        setCity(addr.city ?? "");
        setState(addr.state ?? "");
        setPostalCode(addr.postalCode ?? "");
        setCountry(addr.country || "Morocco");
      }
      toast.success(`Loaded ${customer.name}`);
    } catch {
      toast.success(`Selected ${customer.name}`);
    }
  }

  function clearCustomer() {
    setSelectedCustomerId(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("Morocco");
    markDirty();
  }

  function addProduct(product: Product, opts?: { fromScan?: boolean }) {
    const { tracks, outOfStock } = productStockMeta(product);
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (tracks && existing.quantity >= existing.inventory) {
          toast.error("No more stock available");
          return prev;
        }
        const nextQty = tracks
          ? Math.min(existing.quantity + 1, existing.inventory)
          : existing.quantity + 1;
        toast.success(
          opts?.fromScan
            ? `Scanned · ${product.title} ×${nextQty}`
            : `Updated ${product.title} ×${nextQty}`
        );
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQty } : item
        );
      }

      toast.success(opts?.fromScan ? `Scanned · ${product.title}` : `Added ${product.title}`);
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          image: product.images[0] ?? null,
          price: product.price,
          catalogPrice: product.price,
          inventory: product.inventory,
          tracksInventory: tracks,
          sku: product.sku ?? null,
          barcode: product.barcode ?? null,
          quantity: 1,
        },
      ];
    });
    markDirty();
  }

  function tryAddFromSearch() {
    const q = productSearch.trim().toLowerCase();
    if (!q) return;

    const exact =
      sellableProducts.find((p) => p.barcode?.toLowerCase() === q) ||
      sellableProducts.find((p) => p.sku?.toLowerCase() === q) ||
      filteredProducts[0];

    if (!exact) {
      toast.error("No product found for that code");
      return;
    }

    const { outOfStock } = productStockMeta(exact);
    if (outOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    addProduct(exact, { fromScan: Boolean(exact.barcode?.toLowerCase() === q || exact.sku?.toLowerCase() === q) });
    setProductSearch("");
    productSearchRef.current?.focus();
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const max = item.tracksInventory ? item.inventory : 9999;
          return { ...item, quantity: Math.max(1, Math.min(quantity, max)) };
        })
        .filter((item) => item.quantity > 0)
    );
    markDirty();
  }

  function updatePrice(productId: string, price: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, price: Math.max(0, Number.isFinite(price) ? price : 0) }
          : item
      )
    );
    markDirty();
  }

  function resetPrice(productId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, price: item.catalogPrice } : item
      )
    );
    markDirty();
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    markDirty();
  }

  function applyDiscountPercent(pct: number) {
    const amount = Math.round(((subtotal * pct) / 100) * 100) / 100;
    setDiscount(String(amount));
    markDirty();
  }

  async function handleSave() {
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || null,
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        shipping: shippingValue,
        tax: taxValue,
        discount: discountValue,
        paymentMethod,
        merchantNote: merchantNote.trim() || null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const url = draft ? `/api/drafts/${draft.id}` : "/api/drafts";
      const method = draft ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save draft");

      const draftId = draft?.id ?? data.draft.id;
      setDirty(false);
      toast.success(draft ? "Draft updated" : "Draft saved");
      if (!draft) {
        router.push(`/dashboard/orders/drafts/${draftId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const actions = (
    <Button
      className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      disabled={saving || items.length === 0}
      loading={saving}
      onClick={() => void handleSave()}
    >
      {saving ? "Saving…" : "Save draft"}
    </Button>
  );

  return (
    <div className="space-y-3 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-neutral-500 hover:text-neutral-900"
            asChild
          >
            <Link href="/dashboard/orders/drafts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                {isEdit ? "Edit draft" : "New manual order"}
              </p>
              {dirty ? (
                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Unsaved
                </span>
              ) : null}
            </div>
            <p className={dashboardSubtitle}>
              {isEdit ? draft?.orderNumber : "Phone, WhatsApp, scan, or in-person sales"}
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">{actions}</div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <section className={cn(dashboardCard, "p-4")}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
                  <User className="h-3.5 w-3.5 text-neutral-500" />
                </div>
                <div>
                  <h2 className={dashboardTitle}>Customer</h2>
                  <p className={dashboardSubtitle}>Search existing or add a new one</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {customerPhone ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-neutral-400 hover:text-neutral-900"
                      asChild
                    >
                      <a href={`tel:${customerPhone}`} title="Call">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {wa ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-emerald-600"
                        asChild
                      >
                        <a href={wa} target="_blank" rel="noreferrer" title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : null}
                  </>
                ) : null}
                {(customerName || customerEmail) && (
                  <button
                    type="button"
                    onClick={clearCustomer}
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-neutral-400 transition-colors hover:bg-[#F5F5F7] hover:text-neutral-700 dark:hover:bg-white/5"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div ref={customerSearchRef} className="relative mb-3">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setCustomerOpen(true);
                }}
                onFocus={() => setCustomerOpen(true)}
                placeholder="Search by name, email, or phone…"
                className={cn(fieldClass, "pl-8")}
              />
              {customerOpen && (suggestionCustomers.length > 0 || customerLoading) && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[10px] border border-black/[0.08] bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1C1C1E]">
                  {customerLoading ? (
                    <p className="px-3 py-2 text-[11px] text-neutral-400">Searching…</p>
                  ) : (
                    suggestionCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => void selectCustomer(c)}
                        className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[#F5F5F7] dark:hover:bg-white/[0.05]"
                      >
                        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                            {c.name}
                          </p>
                          <p className="truncate text-[10px] text-neutral-400">
                            {c.email}
                            {c.phone ? ` · ${c.phone}` : ""} · {c.orderCount} orders
                          </p>
                        </div>
                        {selectedCustomerId === c.id && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="customerName" className="text-[10px] text-neutral-400">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setSelectedCustomerId(null);
                    markDirty();
                  }}
                  placeholder="Full name"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="customerEmail" className="text-[10px] text-neutral-400">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setSelectedCustomerId(null);
                    markDirty();
                  }}
                  placeholder="customer@email.com"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="customerPhone" className="text-[10px] text-neutral-400">
                  Phone
                </Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    markDirty();
                  }}
                  placeholder="+212 6…"
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "p-4")}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
                <MapPin className="h-3.5 w-3.5 text-neutral-500" />
              </div>
              <div>
                <h2 className={dashboardTitle}>Shipping address</h2>
                <p className={dashboardSubtitle}>
                  Autofills from past orders when you pick a customer
                </p>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="street" className="text-[10px] text-neutral-400">
                  Street
                </Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    markDirty();
                  }}
                  placeholder="Street address"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city" className="text-[10px] text-neutral-400">
                  City
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    markDirty();
                  }}
                  placeholder="Casablanca"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state" className="text-[10px] text-neutral-400">
                  Region
                </Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    markDirty();
                  }}
                  placeholder="Région"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="postalCode" className="text-[10px] text-neutral-400">
                  Postal code
                </Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    markDirty();
                  }}
                  placeholder="20000"
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country" className="text-[10px] text-neutral-400">
                  Country
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    markDirty();
                  }}
                  placeholder="Morocco"
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "p-4")}>
            <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
                  <Package className="h-3.5 w-3.5 text-neutral-500" />
                </div>
                <div>
                  <h2 className={dashboardTitle}>Products</h2>
                  <p className={dashboardSubtitle}>
                    {itemCount > 0
                      ? `${itemCount} item${itemCount === 1 ? "" : "s"} · ${formatCurrency(subtotal, currency)}`
                      : "Search, scan barcode, or click to add"}
                  </p>
                </div>
              </div>
              <div className="relative w-full sm:max-w-[260px]">
                <ScanBarcode className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <Input
                  ref={productSearchRef}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      tryAddFromSearch();
                    }
                  }}
                  placeholder="Search or scan barcode…"
                  className={cn(fieldClass, "pl-7")}
                />
              </div>
            </div>

            {sellableProducts.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-black/[0.08] px-4 py-8 text-center dark:border-white/10">
                <p className="text-[12px] text-neutral-500">No products in your catalog yet.</p>
                <Link
                  href="/dashboard/products/new"
                  className="mt-2 inline-block text-[12px] font-medium text-[#007AFF] hover:underline"
                >
                  Add a product
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="rounded-[10px] border border-dashed border-black/[0.08] px-4 py-6 text-center text-[12px] text-neutral-400 dark:border-white/10">
                No products match “{productSearch}”
              </p>
            ) : (
              <div className="mb-3 grid gap-1.5 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const { tracks, outOfStock } = productStockMeta(product);
                  const inCart = items.find((i) => i.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => addProduct(product)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[10px] border p-2 text-left transition-colors duration-150",
                        inCart
                          ? "border-neutral-900/20 bg-[#F5F5F7] dark:border-white/20 dark:bg-white/[0.05]"
                          : "border-black/[0.05]",
                        outOfStock
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-[#F5F5F7]/90 dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-black/[0.05] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-neutral-400">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                          {product.title}
                        </p>
                        <p className="truncate text-[10px] text-neutral-400">
                          {formatCurrency(product.price, currency)}
                          {product.sku ? ` · ${product.sku}` : ""}
                          {" · "}
                          {outOfStock
                            ? "Out of stock"
                            : tracks
                              ? `${product.inventory} in stock`
                              : "No stock limit"}
                          {inCart ? ` · ×${inCart.quantity}` : ""}
                        </p>
                      </div>
                      {inCart ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-neutral-900 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-neutral-900">
                          {inCart.quantity}
                        </span>
                      ) : (
                        !outOfStock && <Plus className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {items.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-black/[0.08] px-4 py-8 text-center text-[12px] text-neutral-400 dark:border-white/10">
                No products yet. Scan a barcode, search SKU, or click a product.
              </div>
            ) : (
              <div className="space-y-1.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                    Line items
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setItems([]);
                      markDirty();
                    }}
                    className="text-[10px] text-neutral-400 hover:text-red-600"
                  >
                    Clear all
                  </button>
                </div>
                {items.map((item) => {
                  const priceChanged = item.price !== item.catalogPrice;
                  return (
                    <div
                      key={item.productId}
                      className="rounded-[10px] border border-black/[0.05] px-2.5 py-2 transition-colors hover:bg-[#F5F5F7]/70 dark:border-white/10 dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#F5F5F7] dark:bg-white/[0.05]">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="truncate text-[10px] text-neutral-400">
                            {[item.sku, item.barcode].filter(Boolean).join(" · ") || "No code"}
                            {item.tracksInventory ? ` · max ${item.inventory}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-md border-black/[0.06] dark:border-white/10"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, Number(e.target.value) || 1)
                            }
                            className={cn(fieldClass, "w-11 px-1 text-center")}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-md border-black/[0.06] dark:border-white/10"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="hidden w-20 text-right text-[12px] font-medium text-neutral-900 sm:block dark:text-white">
                          {formatCurrency(item.price * item.quantity, currency)}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                          className="h-7 w-7 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 pl-12">
                        <Label className="text-[10px] text-neutral-400">Unit price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updatePrice(item.productId, Number(e.target.value) || 0)
                          }
                          className={cn(fieldClass, "w-24")}
                        />
                        {priceChanged ? (
                          <button
                            type="button"
                            onClick={() => resetPrice(item.productId)}
                            className="text-[10px] text-[#007AFF] hover:underline"
                          >
                            Reset to {formatCurrency(item.catalogPrice, currency)}
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-300">Catalog price</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className={cn(dashboardCard, "p-4")}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
                <StickyNote className="h-3.5 w-3.5 text-neutral-500" />
              </div>
              <div>
                <h2 className={dashboardTitle}>Internal note</h2>
                <p className={dashboardSubtitle}>Visible only to your team</p>
              </div>
            </div>
            <Textarea
              value={merchantNote}
              onChange={(e) => {
                setMerchantNote(e.target.value);
                markDirty();
              }}
              placeholder="WhatsApp order, COD confirm call, courier notes…"
              className="min-h-[72px] rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] shadow-none dark:border-white/10 dark:bg-white/[0.05]"
              maxLength={2000}
            />
          </section>
        </div>

        <aside className="space-y-3">
          <div className={cn(dashboardCard, "space-y-3 p-4 lg:sticky lg:top-24")}>
            <div>
              <h2 className={dashboardTitle}>Draft checklist</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>Helpful before saving</p>
            </div>
            <ul className="space-y-1.5">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-[11px]">
                  {item.done ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-neutral-300" />
                  )}
                  <span
                    className={
                      item.done ? "text-neutral-700 dark:text-neutral-200" : "text-neutral-400"
                    }
                  >
                    {item.label}
                    {"optional" in item && item.optional ? (
                      <span className="text-neutral-300"> · optional</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
              <h2 className={dashboardTitle}>Payment</h2>
              {PAYMENT_OPTIONS.map((option) => {
                const active = paymentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(option.value);
                      markDirty();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left transition-colors",
                      active
                        ? "border-neutral-900 bg-[#F5F5F7] dark:border-white dark:bg-white/[0.06]"
                        : "border-black/[0.05] hover:bg-[#F5F5F7]/80 dark:border-white/10 dark:hover:bg-white/[0.03]"
                    )}
                  >
                    <option.icon className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-[10px] text-neutral-400">{option.hint}</p>
                    </div>
                    {active && <Check className="h-3.5 w-3.5 text-neutral-900 dark:text-white" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-black/[0.05] pt-3 dark:border-white/10">
              <h2 className={dashboardTitle}>Summary</h2>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Items ({itemCount})</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shipping" className="text-[10px] text-neutral-400">
                    Shipping
                  </Label>
                  <Input
                    id="shipping"
                    type="number"
                    min="0"
                    step="0.01"
                    value={shipping}
                    onChange={(e) => {
                      setShipping(e.target.value);
                      markDirty();
                    }}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tax" className="text-[10px] text-neutral-400">
                    Tax
                  </Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => {
                      setTax(e.target.value);
                      markDirty();
                    }}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount" className="text-[10px] text-neutral-400">
                      Discount
                    </Label>
                    <div className="flex gap-1">
                      {[0, 5, 10].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            if (pct === 0) {
                              setDiscount("0");
                              markDirty();
                            } else {
                              applyDiscountPercent(pct);
                            }
                          }}
                          className="rounded px-1.5 py-0.5 text-[10px] text-neutral-400 transition-colors hover:bg-[#F5F5F7] hover:text-neutral-700 dark:hover:bg-white/5"
                        >
                          {pct === 0 ? "0" : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => {
                      setDiscount(e.target.value);
                      markDirty();
                    }}
                    className={fieldClass}
                  />
                </div>
                {discountValue > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>−{formatCurrency(discountValue, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-black/[0.05] pt-2 text-[13px] dark:border-white/10">
                  <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden space-y-1.5 pt-1 sm:block">
              <div className="flex flex-col gap-1.5">{actions}</div>
              <p className="pt-1 text-center text-[10px] leading-relaxed text-neutral-400">
                Save keeps this as a draft you can edit anytime.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 p-3 backdrop-blur sm:hidden dark:border-white/10 dark:bg-[#121212]/95">
        <div className="mb-2 flex items-center justify-between text-[12px]">
          <span className="text-neutral-400">{itemCount} items</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {formatCurrency(total, currency)}
          </span>
        </div>
        <div className="flex gap-1.5">{actions}</div>
      </div>
    </div>
  );
}
