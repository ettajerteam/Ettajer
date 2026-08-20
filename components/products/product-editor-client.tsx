"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/products/product-form";
import {
  ProductPublishDialog,
  type PublishDialogState,
} from "@/components/products/product-publish-dialog";
import {
  getPublishIssues,
  requestFocusPublishField,
  requestGuidanceIssues,
} from "@/lib/product-publish-checklist";
import type { PublishIssue } from "@/lib/product-publish-checklist";
import { setProductPublishedFlash } from "@/lib/product-published-flash";
import type { ProductFormValues } from "@/lib/validations/product";
import { normalizeProductVariants } from "@/lib/product-variants";
import type { Product, ProductStatus } from "@/types";
import type { TicketPrinter } from "@/lib/ticket-printers";
import { cn } from "@/lib/utils";
import { clearProductFormDraft } from "@/lib/product-form-draft-storage";
import { firstSaleShareStorageKey } from "@/components/dashboard/home/home-first-sale-rail";

interface ProductEditorClientProps {
  currency: string;
  ticketPrinters?: TicketPrinter[];
  product?: Product | null;
  storeSlug: string;
  storeName?: string;
  quickStart?: boolean;
}

export function ProductEditorClient({
  currency,
  ticketPrinters = [],
  product = null,
  storeSlug,
  storeName,
  quickStart = false,
}: ProductEditorClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);
  const [showDock, setShowDock] = useState(false);
  const [publishDialog, setPublishDialog] = useState<PublishDialogState>({
    open: false,
  });
  const statusRef = useRef<ProductStatus>(product?.status ?? "draft");
  const isEditing = !!product;
  const formId = "product-editor-form";
  const currentStatus = product?.status ?? "draft";
  const isFirstSaleCreate = quickStart && !isEditing;

  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      setShowDock(mobile || window.scrollY > 160);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const goToCatalog = () => {
    setPublishDialog({ open: false });
    router.push("/dashboard/products");
    router.refresh();
  };

  const goToHomeLaunch = () => {
    setPublishDialog({ open: false });
    router.push("/dashboard?launch=1");
    router.refresh();
  };

  const markShared = () => {
    try {
      window.localStorage.setItem(firstSaleShareStorageKey(storeSlug), "1");
    } catch {
      /* ignore */
    }
  };

  const saveProduct = async (data: ProductFormValues, status: ProductStatus) => {
    const cleanedVariants = normalizeProductVariants(data.variants);

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

    if (status === "active") {
      const issues = getPublishIssues(payload);
      if (issues.length > 0) {
        setPublishDialog({ open: true, mode: "missing", issues });
        requestGuidanceIssues(issues);
        return;
      }
      setPublishDialog({
        open: true,
        mode: "publishing",
        title: payload.title.trim(),
      });
    }

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

      if (!isEditing) {
        clearProductFormDraft(storeSlug);
      }

      if (status === "draft") {
        toast.success(isEditing ? "Draft saved" : "Saved as draft");
        router.push("/dashboard/products");
        router.refresh();
        return;
      }

      setProductPublishedFlash(payload.title.trim());
      setPublishDialog({
        open: true,
        mode: "published",
        title: payload.title.trim(),
        firstSaleShare: isFirstSaleCreate,
      });
      toast.success("Product uploaded", {
        description: `${payload.title.trim()} is now live in your catalog.`,
      });
      if (!isEditing && !isFirstSaleCreate) {
        window.setTimeout(() => goToCatalog(), 1200);
      }
    } catch (error) {
      setPublishDialog({ open: false });
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

  const actions = (
    <>
      <Button
        variant="outline"
        className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
        asChild
        disabled={loading}
      >
        <Link href="/dashboard/products">Cancel</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
        loading={loading && pendingStatus === "draft"}
        disabled={loading}
        onClick={() => requestSave("draft")}
      >
        Save draft
      </Button>
      <Button
        type="button"
        className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        loading={loading && pendingStatus === "active"}
        disabled={loading}
        onClick={() => requestSave("active")}
      >
        {currentStatus === "active" ? "Save & publish" : "Publish"}
      </Button>
    </>
  );

  return (
    <div className="space-y-3 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/products"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Products
          </Link>
          <Badge
            variant={currentStatus === "active" ? "success" : "secondary"}
            className="rounded-md px-2 py-0.5 text-[10px] font-medium"
          >
            {currentStatus === "active"
              ? "Active"
              : currentStatus === "archived"
                ? "Archived"
                : "Draft"}
          </Badge>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">{actions}</div>
      </div>

      <ProductForm
        key={product?.id ?? (quickStart ? "new-first" : "new")}
        currency={currency}
        ticketPrinters={ticketPrinters}
        initialData={product ?? undefined}
        onSubmit={handleSubmit}
        formId={formId}
        layout="page"
        storeSlug={storeSlug}
        storeName={storeName}
        quickStart={quickStart && !isEditing}
        onValidationFailed={(issues) =>
          setPublishDialog({ open: true, mode: "missing", issues })
        }
      />

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 py-4 transition-all duration-300 sm:px-6 lg:left-[var(--sidebar-width,0px)]",
          showDock ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
        aria-hidden={!showDock}
      >
        <div
          className={cn(
            "pointer-events-auto mx-auto flex max-w-[1320px] items-center justify-end gap-2",
            !showDock && "pointer-events-none"
          )}
        >
          {actions}
        </div>
      </div>

      <ProductPublishDialog
        state={publishDialog}
        storeSlug={storeSlug}
        storeName={storeName}
        onShared={markShared}
        onClose={() => {
          if (publishDialog.open && publishDialog.mode === "published") {
            if (publishDialog.firstSaleShare) {
              goToHomeLaunch();
              return;
            }
            goToCatalog();
            return;
          }
          if (publishDialog.open && publishDialog.mode === "publishing") return;
          if (publishDialog.open && publishDialog.mode === "missing") {
            const first = publishDialog.issues[0];
            setPublishDialog({ open: false });
            if (first) {
              window.setTimeout(() => requestFocusPublishField(first.id), 140);
            }
            return;
          }
          setPublishDialog({ open: false });
        }}
        onViewCatalog={
          publishDialog.open &&
          publishDialog.mode === "published" &&
          publishDialog.firstSaleShare
            ? goToHomeLaunch
            : goToCatalog
        }
        onGoToIssue={(issue: PublishIssue) => {
          setPublishDialog({ open: false });
          window.setTimeout(() => requestFocusPublishField(issue.id), 140);
        }}
      />
    </div>
  );
}
