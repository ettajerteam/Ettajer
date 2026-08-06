import {
  DEFAULT_ETICKET_PREFERENCES,
  DEFAULT_INVOICE_PREFERENCES,
  ETICKET_TEMPLATE_IDS,
  INVOICE_TEMPLATE_IDS,
  type EticketPreferences,
  type EticketTemplateId,
  type InvoicePreferences,
  type InvoiceTemplateId,
} from "@/lib/shop-preferences";

export interface EticketTemplateOption {
  id: EticketTemplateId;
  label: string;
  description: string;
  preset: Partial<EticketPreferences>;
}

export interface InvoiceTemplateOption {
  id: InvoiceTemplateId;
  label: string;
  description: string;
  preset: Partial<InvoicePreferences>;
}

export const ETICKET_TEMPLATE_OPTIONS: EticketTemplateOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Full packing label with all fields",
    preset: {},
  },
  {
    id: "compact",
    label: "Compact",
    description: "58×40mm, essentials only",
    preset: {
      size: "58x40",
      showStoreQr: false,
      showBarcode: true,
      showCustomer: false,
      showPrice: true,
      onePerUnit: true,
    },
  },
  {
    id: "bold",
    label: "Bold",
    description: "Large price & order number",
    preset: {
      size: "80x100",
      showPrice: true,
      showCustomer: true,
      showBarcode: true,
      showStoreQr: true,
      onePerUnit: true,
    },
  },
];

export const INVOICE_TEMPLATE_OPTIONS: InvoiceTemplateOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Standard A4 invoice",
    preset: {},
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean layout, less chrome",
    preset: {
      showLogo: false,
      showPaymentStatus: false,
    },
  },
  {
    id: "branded",
    label: "Branded",
    description: "Logo-forward with payment status",
    preset: {
      showLogo: true,
      showPaymentStatus: true,
    },
  },
];

function isEticketTemplateId(value: string): value is EticketTemplateId {
  return (ETICKET_TEMPLATE_IDS as readonly string[]).includes(value);
}

function isInvoiceTemplateId(value: string): value is InvoiceTemplateId {
  return (INVOICE_TEMPLATE_IDS as readonly string[]).includes(value);
}

/** Returns preset preference patches for the given e-ticket template. */
export function applyEticketTemplate(id: EticketTemplateId): Partial<EticketPreferences> {
  const option = ETICKET_TEMPLATE_OPTIONS.find((t) => t.id === id);
  return {
    template: id,
    ...(option?.preset ?? {}),
  };
}

/** Returns preset preference patches for the given invoice template. */
export function applyInvoiceTemplate(id: InvoiceTemplateId): Partial<InvoicePreferences> {
  const option = INVOICE_TEMPLATE_OPTIONS.find((t) => t.id === id);
  return {
    template: id,
    ...(option?.preset ?? {}),
  };
}

/** Resolve a template id safely with fallback to classic. */
export function resolveEticketTemplateId(value: unknown): EticketTemplateId {
  return typeof value === "string" && isEticketTemplateId(value) ? value : "classic";
}

/** Resolve a template id safely with fallback to classic. */
export function resolveInvoiceTemplateId(value: unknown): InvoiceTemplateId {
  return typeof value === "string" && isInvoiceTemplateId(value) ? value : "classic";
}

/** Merge template preset over defaults (does not persist — for UI preview). */
export function mergeEticketTemplateDefaults(
  id: EticketTemplateId
): EticketPreferences {
  return {
    ...DEFAULT_ETICKET_PREFERENCES,
    ...applyEticketTemplate(id),
  };
}

/** Merge template preset over defaults (does not persist — for UI preview). */
export function mergeInvoiceTemplateDefaults(
  id: InvoiceTemplateId
): InvoicePreferences {
  return {
    ...DEFAULT_INVOICE_PREFERENCES,
    ...applyInvoiceTemplate(id),
  };
}
