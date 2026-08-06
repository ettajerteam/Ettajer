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

/** Parse stored CSV or legacy single value into a unique ordered list. */
export function parseBusinessModels(
  value: string | string[] | null | undefined
): BusinessModel[] {
  if (value == null) return [];
  const parts = Array.isArray(value)
    ? value
    : value.split(/[,|]/).map((part) => part.trim());
  const seen = new Set<BusinessModel>();
  const result: BusinessModel[] = [];
  for (const part of parts) {
    if (!part || !isBusinessModel(part) || seen.has(part)) continue;
    seen.add(part);
    result.push(part);
  }
  return result;
}

/** Stable sorted CSV for Store.businessModel persistence. */
export function serializeBusinessModels(models: BusinessModel[]): string {
  return Array.from(new Set(models.filter(isBusinessModel))).sort().join(",");
}

export function hasDigitalCatalog(models: BusinessModel[]): boolean {
  return models.includes("digital");
}

export function hasPhysicalCatalog(models: BusinessModel[]): boolean {
  return models.includes("physical") || models.includes("dropshipping");
}

/** Normalize API / form input into a validated non-empty list when possible. */
export function resolveBusinessModelsFromBody(body: {
  businessModels?: unknown;
  businessModel?: unknown;
}): BusinessModel[] {
  if (Array.isArray(body.businessModels)) {
    return parseBusinessModels(body.businessModels as string[]);
  }
  if (typeof body.businessModels === "string") {
    return parseBusinessModels(body.businessModels);
  }
  if (typeof body.businessModel === "string") {
    return parseBusinessModels(body.businessModel);
  }
  return [];
}
