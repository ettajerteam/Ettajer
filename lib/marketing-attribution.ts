export interface UtmAttribution {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

const STORAGE_KEY = "ettajer_utm";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function parseUtmFromSearchParams(
  searchParams: URLSearchParams
): Partial<UtmAttribution> | null {
  const attribution: Partial<UtmAttribution> = {};
  let hasAny = false;

  const source = searchParams.get("utm_source");
  const medium = searchParams.get("utm_medium");
  const campaign = searchParams.get("utm_campaign");
  const term = searchParams.get("utm_term");
  const content = searchParams.get("utm_content");

  if (source) {
    attribution.utmSource = source;
    hasAny = true;
  }
  if (medium) {
    attribution.utmMedium = medium;
    hasAny = true;
  }
  if (campaign) {
    attribution.utmCampaign = campaign;
    hasAny = true;
  }
  if (term) {
    attribution.utmTerm = term;
    hasAny = true;
  }
  if (content) {
    attribution.utmContent = content;
    hasAny = true;
  }

  return hasAny ? attribution : null;
}

export function captureUtmFromUrl(search: string): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(search);
  const incoming = parseUtmFromSearchParams(params);
  if (!incoming) return;

  const existing = getStoredAttribution();
  const merged: UtmAttribution = {
    utmSource: incoming.utmSource ?? existing?.utmSource ?? null,
    utmMedium: incoming.utmMedium ?? existing?.utmMedium ?? null,
    utmCampaign: incoming.utmCampaign ?? existing?.utmCampaign ?? null,
    utmTerm: incoming.utmTerm ?? existing?.utmTerm ?? null,
    utmContent: incoming.utmContent ?? existing?.utmContent ?? null,
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function getStoredAttribution(): UtmAttribution | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UtmAttribution>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      utmSource: parsed.utmSource ?? null,
      utmMedium: parsed.utmMedium ?? null,
      utmCampaign: parsed.utmCampaign ?? null,
      utmTerm: parsed.utmTerm ?? null,
      utmContent: parsed.utmContent ?? null,
    };
  } catch {
    return null;
  }
}

export function hasAttributionData(attribution: UtmAttribution | null): boolean {
  if (!attribution) return false;
  return Boolean(
    attribution.utmSource ||
      attribution.utmMedium ||
      attribution.utmCampaign ||
      attribution.utmTerm ||
      attribution.utmContent
  );
}

export function buildUtmQueryString(attribution: Partial<UtmAttribution>): string {
  const params = new URLSearchParams();
  if (attribution.utmSource) params.set("utm_source", attribution.utmSource);
  if (attribution.utmMedium) params.set("utm_medium", attribution.utmMedium);
  if (attribution.utmCampaign) params.set("utm_campaign", attribution.utmCampaign);
  if (attribution.utmTerm) params.set("utm_term", attribution.utmTerm);
  if (attribution.utmContent) params.set("utm_content", attribution.utmContent);
  return params.toString();
}

export function getUtmParamKeys(): readonly string[] {
  return UTM_KEYS;
}
