import countryData from "@/lib/country-iso-data.json";

type CountryRecord = {
  name: string;
  longname?: string;
};

const NAME_TO_ISO = new Map<string, string>();

for (const [code, entry] of Object.entries(countryData as Record<string, CountryRecord>)) {
  if (code.length !== 2) continue;
  NAME_TO_ISO.set(entry.name.toLowerCase(), code);
  if (entry.longname) {
    NAME_TO_ISO.set(entry.longname.toLowerCase(), code);
  }
}

const ALIASES: Record<string, string> = {
  usa: "US",
  "u.s.a.": "US",
  "u.s.": "US",
  uk: "GB",
  "u.k.": "GB",
  "great britain": "GB",
  england: "GB",
  uae: "AE",
  "côte d'ivoire": "CI",
  "cote d'ivoire": "CI",
  "south korea": "KR",
  "north korea": "KP",
};

export function countryToIso(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;

  const trimmed = input.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();

  const normalized = trimmed.toLowerCase();
  return ALIASES[normalized] ?? NAME_TO_ISO.get(normalized) ?? null;
}

export function getCountryName(code: string): string {
  const entry = (countryData as Record<string, CountryRecord>)[code.toUpperCase()];
  return entry?.name ?? code.toUpperCase();
}
