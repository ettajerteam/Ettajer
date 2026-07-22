export const BUSINESS_MODELS = ["physical", "digital", "dropshipping"] as const;

export type BusinessModel = (typeof BUSINESS_MODELS)[number];

export function isBusinessModel(value: string): value is BusinessModel {
  return (BUSINESS_MODELS as readonly string[]).includes(value);
}

export interface BusinessModelOption {
  id: BusinessModel;
  icon: "package" | "download" | "truck";
}

export const BUSINESS_MODEL_OPTIONS: BusinessModelOption[] = [
  { id: "physical", icon: "package" },
  { id: "digital", icon: "download" },
  { id: "dropshipping", icon: "truck" },
];
