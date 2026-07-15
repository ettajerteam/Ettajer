"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { DraftDetail } from "@/types/drafts";
import type { Product } from "@/types";

interface DraftLineItem {
  productId: string;
  title: string;
  image: string | null;
  price: number;
  inventory: number;
  quantity: number;
}

interface DraftFormProps {
  products: Product[];
  currency: string;
  draft?: DraftDetail;
}

export function DraftForm({ products, currency, draft }: DraftFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState(draft?.customerName ?? "");
  const [customerEmail, setCustomerEmail] = useState(draft?.customerEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState(draft?.customerPhone ?? "");
  const [shipping, setShipping] = useState(String(draft?.shipping ?? 0));
  const [tax, setTax] = useState(String(draft?.tax ?? 0));
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<DraftLineItem[]>(
    draft?.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      inventory: item.inventory,
      quantity: item.quantity,
    })) ?? []
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [products, productSearch]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingValue = Number(shipping) || 0;
  const taxValue = Number(tax) || 0;
  const total = subtotal + shippingValue + taxValue;

  function addProduct(product: Product) {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.inventory) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          image: product.images[0] ?? null,
          price: product.price,
          inventory: product.inventory,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.inventory)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  async function handleSubmit(saveOnly: boolean) {
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shipping: shippingValue,
        tax: taxValue,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
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

      if (saveOnly) {
        toast.success(draft ? "Draft updated" : "Draft created");
        router.push(`/dashboard/orders/drafts/${draftId}`);
        router.refresh();
        return;
      }

      const completeRes = await fetch(`/api/drafts/${draftId}/complete`, { method: "POST" });
      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(completeData.message ?? "Draft saved but failed to complete");
      }

      toast.success("Draft converted to order");
      router.push(`/dashboard/orders/${completeData.order.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="premium-card space-y-5 p-6 sm:p-7">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Customer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@email.com"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+212 6..."
              />
            </div>
          </div>
        </section>

        <section className="premium-card space-y-5 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">Products</h2>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products"
                className="pl-9"
              />
            </div>
          </div>

          {filteredProducts.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="flex items-center gap-3 rounded-xl border border-border/80 p-3 text-left transition-all duration-200 hover:border-border hover:bg-muted/45"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price, currency)} · {product.inventory} in stock
                    </p>
                  </div>
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-9 text-center text-sm text-muted-foreground">
              Search and add products to this draft order.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-xl border border-border/80 p-3 transition-colors duration-200 hover:bg-muted/35"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price, currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, Number(e.target.value) || 1)
                      }
                      className="h-8 w-14 px-2 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="w-24 text-right text-sm font-medium">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="premium-card space-y-5 p-6 sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping</Label>
              <Input
                id="shipping"
                type="number"
                min="0"
                step="0.01"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between border-t pt-3 text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              className="h-11 w-full rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90"
              disabled={saving}
              onClick={() => handleSubmit(false)}
            >
              {saving ? "Saving..." : "Complete draft"}
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl"
              disabled={saving}
              onClick={() => handleSubmit(true)}
            >
              Save draft
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
