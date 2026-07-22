"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/products/product-form";
import type { ProductFormValues } from "@/lib/validations/product";
import type { Product, ProductStatus } from "@/types";
import type { TicketPrinter } from "@/lib/ticket-printers";

interface ProductEditorClientProps {
  currency: string;
  ticketPrinters?: TicketPrinter[];
  product?: Product | null;
}

export function ProductEditorClient({
  currency,
  ticketPrinters = [],
  product = null,
}: ProductEditorClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);
  const statusRef = useRef<ProductStatus>(product?.status ?? "draft");
  const isEditing = !!product;
  const formId = "product-editor-form";
  const currentStatus = product?.status ?? "draft";

  const saveProduct = async (data: ProductFormValues, status: ProductStatus) => {
    const cleanedVariants = data.variants
      .filter((v) => v.name.trim())
      .map((v) => ({
        ...v,
        name: v.name.trim(),
        options: v.options.filter((o) => o.trim()),
      }))
      .filter((v) => v.options.length > 0);

    const cleanedDetails = data.details
      .filter((d) => d.label.trim() && d.value.trim())
      .map((d) => ({
        ...d,
        label: d.label.trim(),
        value: d.value.trim(),
      }));

    const payload: ProductFormValues = {
      ...data,
      status,
      variants: cleanedVariants,
      details: cleanedDetails,
    };

    setLoading(true);
    setPendingStatus(status);
    try {
      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message ?? "Failed to save product");

      if (status === "draft") {
        toast.success(isEditing ? "Draft saved" : "Saved as draft");
      } else {
        toast.success(isEditing ? "Product published" : "Product published");
      }

      if (!isEditing && result.product?.id) {
        router.replace(`/dashboard/products/${result.product.id}/edit`);
        router.refresh();
        return;
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
      setPendingStatus(null);
    }
  };

  const handleSubmit = async (data: ProductFormValues) => {
    await saveProduct(data, statusRef.current);
  };

  const requestSave = (status: ProductStatus) => {
    statusRef.current = status;
    const form = document.getElementById(formId) as HTMLFormElement | null;
    form?.requestSubmit();
  };

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Products
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">
              {isEditing ? "Edit product" : "Add product"}
            </h1>
            <Badge variant={currentStatus === "active" ? "success" : "secondary"}>
              {currentStatus === "active" ? "Active" : "Draft"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? "Update photos, pricing, type, variants, and copyrights."
              : "Full product page — save as draft anytime, publish when ready."}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            loading={loading && pendingStatus === "draft"}
            disabled={loading}
            onClick={() => requestSave("draft")}
          >
            Save as draft
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            loading={loading && pendingStatus === "active"}
            disabled={loading}
            onClick={() => requestSave("active")}
          >
            {currentStatus === "active" ? "Save & publish" : "Publish"}
          </Button>
        </div>
      </div>

      <ProductForm
        key={product?.id ?? "new"}
        currency={currency}
        ticketPrinters={ticketPrinters}
        initialData={product ?? undefined}
        onSubmit={handleSubmit}
        formId={formId}
        layout="page"
      />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:left-[var(--sidebar-width,0px)]">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-2">
          <Button variant="outline" className="rounded-xl" asChild disabled={loading}>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            loading={loading && pendingStatus === "draft"}
            disabled={loading}
            onClick={() => requestSave("draft")}
          >
            Save draft
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            loading={loading && pendingStatus === "active"}
            disabled={loading}
            onClick={() => requestSave("active")}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
