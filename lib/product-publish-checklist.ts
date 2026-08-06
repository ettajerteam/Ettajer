import type { FieldErrors, FieldError } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validations/product";

export type PublishIssue = {
  id: string;
  label: string;
  hint: string;
  /** Where to find it in the form */
  where: string;
};

type FieldGuide = {
  id: string;
  label: string;
  where: string;
  openMore?: boolean;
};

const FIELD_GUIDE: Record<string, FieldGuide> = {
  title: {
    id: "title",
    label: "Product name",
    where: "Basic details — top of the form",
  },
  price: {
    id: "price",
    label: "Price",
    where: "Pricing section",
  },
  comparePrice: {
    id: "price",
    label: "Compare-at price",
    where: "Pricing section",
  },
  costPrice: {
    id: "price",
    label: "Cost per item",
    where: "Pricing section",
  },
  images: {
    id: "images",
    label: "Photos",
    where: "Media section",
  },
  digitalFiles: {
    id: "digitalFiles",
    label: "Digital file",
    where: "Digital file section",
  },
  categoryId: {
    id: "category",
    label: "Category",
    where: "More settings → Organization",
    openMore: true,
  },
  inventory: {
    id: "inventory",
    label: "Inventory",
    where: "Inventory section",
  },
  sku: {
    id: "inventory",
    label: "SKU",
    where: "Inventory section",
  },
  variants: {
    id: "variants",
    label: "Variants",
    where: "Variants section",
  },
  details: {
    id: "details",
    label: "Product details",
    where: "More settings → Product info",
    openMore: true,
  },
  description: {
    id: "title",
    label: "Description",
    where: "Basic details",
  },
  productType: {
    id: "title",
    label: "Product type",
    where: "Product type section",
  },
  dropshippingUrl: {
    id: "dropshippingUrl",
    label: "Supplier link",
    where: "Dropshipping source — Change link",
  },
  commerce: {
    id: "dropshippingUrl",
    label: "Supplier / commerce details",
    where: "Dropshipping source or Organization",
  },
  videos: {
    id: "images",
    label: "Video URL",
    where: "Media → Add video",
  },
  models3d: {
    id: "images",
    label: "3D model URL",
    where: "Media → Add 3D model",
  },
};

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/Id$/, "")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function walkFieldErrors(
  errs: FieldErrors<ProductFormValues> | Record<string, unknown>,
  path: string[] = [],
  out: PublishIssue[] = [],
  seen = new Set<string>()
): PublishIssue[] {
  for (const [key, value] of Object.entries(errs ?? {})) {
    if (!value || key === "ref" || key === "type" || key === "types" || key === "root") continue;
    const nextPath = [...path, key];

    if (
      typeof value === "object" &&
      value !== null &&
      "message" in value &&
      typeof (value as FieldError).message === "string" &&
      (value as FieldError).message
    ) {
      const leafKey = nextPath[nextPath.length - 1] ?? key;
      const rootKey = nextPath[0] ?? key;
      const guide = FIELD_GUIDE[leafKey] ?? FIELD_GUIDE[rootKey];
      const id = guide?.id ?? leafKey;
      const message = String((value as FieldError).message);
      const friendlyHint =
        leafKey === "dropshippingUrl" && /500|2048|at most/i.test(message)
          ? "This supplier link is too long. Tap Change link and paste a shorter product URL (without tracking parameters)."
          : message;
      const dedupe = `${id}:${friendlyHint}`;
      if (!seen.has(dedupe)) {
        seen.add(dedupe);
        out.push({
          id,
          label: guide?.label ?? humanizeKey(leafKey),
          hint: friendlyHint,
          where: guide?.where ?? "On the product form",
        });
      }
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          walkFieldErrors(item as Record<string, unknown>, [...nextPath, String(index)], out, seen);
        }
      });
      continue;
    }

    if (typeof value === "object") {
      walkFieldErrors(value as Record<string, unknown>, nextPath, out, seen);
    }
  }
  return out;
}

/** Extra checks when publishing (stricter than draft save). */
export function getPublishIssues(data: ProductFormValues): PublishIssue[] {
  const issues: PublishIssue[] = [];
  const title = data.title?.trim() ?? "";
  const images = Array.isArray(data.images) ? data.images : [];
  const isPhysicalLike =
    data.productType === "physical" || data.productType === "dropshipping";
  const isDigital = data.productType === "digital";

  if (!title) {
    issues.push({
      id: "title",
      label: "Product name",
      hint: "Type the product name customers will see on your store.",
      where: "Basic details — top of the form",
    });
  }

  if (typeof data.price !== "number" || Number.isNaN(data.price) || data.price <= 0) {
    issues.push({
      id: "price",
      label: "Price",
      hint: "Enter a selling price greater than 0 (example: 199).",
      where: "Pricing section",
    });
  }

  if (images.length === 0 && data.productType !== "service") {
    issues.push({
      id: "images",
      label: "Photos",
      hint: "Upload at least one product photo in Media.",
      where: "Media section",
    });
  }

  if ((isPhysicalLike || isDigital) && !data.categoryId) {
    issues.push({
      id: "category",
      label: "Category",
      hint: "Open More settings → Organization, pick a category or Other.",
      where: "More settings → Organization",
    });
  }

  if (isDigital && (!data.digitalFiles || data.digitalFiles.length === 0)) {
    issues.push({
      id: "digitalFiles",
      label: "Digital file",
      hint: "Upload the PDF/file customers receive after purchase.",
      where: "Digital file section",
    });
  }

  return issues;
}

/** Map react-hook-form / zod errors into a guided checklist. Never returns empty if errs exist. */
export function getPublishIssuesFromErrors(
  errs: FieldErrors<ProductFormValues>
): PublishIssue[] {
  const issues = walkFieldErrors(errs);

  if (issues.length === 0 && errs && Object.keys(errs).length > 0) {
    issues.push({
      id: "title",
      label: "Required information",
      hint: "Some fields still need attention. Tap below to review the form from the top.",
      where: "Product form",
    });
  }

  return issues;
}

export function shouldOpenMoreSettings(issues: PublishIssue[]): boolean {
  return issues.some((i) => {
    const guide = Object.values(FIELD_GUIDE).find((g) => g.id === i.id);
    return guide?.openMore || i.id === "category" || i.id === "details";
  });
}

export const FOCUS_PUBLISH_FIELD_EVENT = "ettajer:focus-publish-field";
export const GUIDANCE_ISSUES_EVENT = "ettajer:guidance-issues";

export function requestFocusPublishField(fieldId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(FOCUS_PUBLISH_FIELD_EVENT, { detail: { id: fieldId } })
  );
}

export function requestGuidanceIssues(issues: PublishIssue[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(GUIDANCE_ISSUES_EVENT, { detail: { issues } })
  );
}

/** Mark incomplete sections with a red underline and clear previous marks. */
export function markIncompletePublishFields(fieldIds: string[]) {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLElement>("[data-publish-field]").forEach((el) => {
    el.classList.remove("publish-field-incomplete", "publish-field-highlight");
    el.removeAttribute("data-incomplete-label");
  });

  const unique = Array.from(new Set(fieldIds.filter(Boolean)));
  for (const id of unique) {
    const el = document.querySelector<HTMLElement>(`[data-publish-field="${id}"]`);
    if (!el) continue;
    el.classList.add("publish-field-incomplete");
  }
}

export function focusPublishFieldElement(fieldId: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(
    `[data-publish-field="${fieldId}"]`
  );
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("publish-field-incomplete");
  el.classList.remove("publish-field-highlight");
  void el.offsetWidth;
  el.classList.add("publish-field-highlight");

  const focusable = el.querySelector<HTMLElement>(
    "input:not([type='hidden']), textarea, select, button, [role='combobox']"
  );
  focusable?.focus?.({ preventScroll: true });

  window.setTimeout(() => {
    el.classList.remove("publish-field-highlight");
  }, 2200);
}
