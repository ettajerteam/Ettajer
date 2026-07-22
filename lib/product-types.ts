export const PRODUCT_STATUSES = ["draft", "active"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_TYPES = ["physical", "digital", "service", "dropshipping"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_OPTIONS: {
  value: ProductType;
  label: string;
  description: string;
}[] = [
  {
    value: "physical",
    label: "Physical",
    description: "Ships to the customer — inventory and COD checkout.",
  },
  {
    value: "digital",
    label: "Digital",
    description: "Downloads, courses, files — no shipping weight.",
  },
  {
    value: "service",
    label: "Service",
    description: "Appointments, consulting, or delivered work.",
  },
  {
    value: "dropshipping",
    label: "Dropshipping",
    description: "Fulfilled by a supplier after the order.",
  },
];

export function isProductStatus(value: unknown): value is ProductStatus {
  return value === "draft" || value === "active";
}

export function isProductType(value: unknown): value is ProductType {
  return (
    value === "physical" ||
    value === "digital" ||
    value === "service" ||
    value === "dropshipping"
  );
}

export function productTracksInventory(type: ProductType): boolean {
  return type === "physical" || type === "dropshipping";
}
