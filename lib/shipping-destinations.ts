/** Worldwide shipping destinations: region → countries, optional city lists. */

export type ShippingRegionId =
  | "africa"
  | "europe"
  | "middle_east"
  | "asia"
  | "north_america"
  | "south_america"
  | "oceania";

export type ShippingCountry = {
  code: string;
  name: string;
  /** Optional major cities for finer zone matching */
  cities?: readonly string[];
};

export type ShippingRegion = {
  id: ShippingRegionId;
  name: string;
  countries: readonly ShippingCountry[];
};

const MA_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fes",
  "Tangier",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "Mohammedia",
  "Khouribga",
  "El Jadida",
  "Beni Mellal",
  "Nador",
  "Taza",
  "Settat",
  "Larache",
  "Ksar El Kebir",
  "Sale",
  "Temara",
  "Khemisset",
  "Berrechid",
  "Khenifra",
  "Errachidia",
  "Essaouira",
  "Ouarzazate",
  "Dakhla",
  "Laayoune",
  "Guelmim",
  "Tiznit",
  "Inezgane",
  "Ait Melloul",
  "Taroudant",
  "Sidi Slimane",
  "Sidi Kacem",
  "Youssoufia",
  "Midelt",
  "Azrou",
  "Ifrane",
  "Chefchaouen",
  "Al Hoceima",
  "Fnideq",
  "Martil",
  "Berkane",
  "Taourirt",
  "Guercif",
  "Fquih Ben Salah",
  "Sidi Bennour",
] as const;

const DZ_CITIES = [
  "Algiers",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Batna",
  "Setif",
  "Djelfa",
  "Sidi Bel Abbes",
  "Biskra",
  "Tebessa",
  "El Oued",
  "Skikda",
  "Tiaret",
  "Bejaia",
  "Tlemcen",
  "Ouargla",
  "Bechar",
  "Mostaganem",
  "Bordj Bou Arreridj",
  "Chlef",
  "Souk Ahras",
  "Mascara",
  "El Eulma",
  "Tizi Ouzou",
  "Jijel",
  "Relizane",
  "Saida",
  "Guelma",
  "Laghouat",
  "Ain Defla",
  "Mila",
  "Bouira",
  "Tipaza",
  "Ain Temouchent",
] as const;

const TN_CITIES = [
  "Tunis",
  "Sfax",
  "Sousse",
  "Kairouan",
  "Bizerte",
  "Gabes",
  "Ariana",
  "Gafsa",
  "Monastir",
  "Ben Arous",
  "Kasserine",
  "Medenine",
  "Nabeul",
  "Tataouine",
  "Beja",
  "Jendouba",
  "Mahdia",
  "Sidi Bouzid",
  "Tozeur",
  "Kebili",
  "Zaghouan",
  "Siliana",
  "Manouba",
  "Le Kef",
  "Hammamet",
  "Djerba",
  "La Marsa",
  "Carthage",
  "Zarzis",
] as const;

const EG_CITIES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Shubra El Kheima",
  "Port Said",
  "Suez",
  "Mansoura",
  "Tanta",
  "Asyut",
  "Ismailia",
  "Faiyum",
  "Zagazig",
  "Damietta",
  "Aswan",
  "Minya",
  "Damanhur",
  "Beni Suef",
  "Qena",
  "Sohag",
  "Hurghada",
  "Luxor",
  "6th of October",
  "Sharm El Sheikh",
  "New Cairo",
] as const;

export const SHIPPING_REGIONS: readonly ShippingRegion[] = [
  {
    id: "africa",
    name: "Africa",
    countries: [
      { code: "MA", name: "Morocco", cities: MA_CITIES },
      { code: "DZ", name: "Algeria", cities: DZ_CITIES },
      { code: "TN", name: "Tunisia", cities: TN_CITIES },
      { code: "EG", name: "Egypt", cities: EG_CITIES },
      { code: "SN", name: "Senegal" },
      { code: "CI", name: "Ivory Coast" },
      { code: "NG", name: "Nigeria" },
      { code: "GH", name: "Ghana" },
      { code: "KE", name: "Kenya" },
      { code: "ZA", name: "South Africa" },
      { code: "ET", name: "Ethiopia" },
      { code: "TZ", name: "Tanzania" },
      { code: "UG", name: "Uganda" },
      { code: "RW", name: "Rwanda" },
      { code: "CM", name: "Cameroon" },
      { code: "ML", name: "Mali" },
      { code: "BF", name: "Burkina Faso" },
      { code: "NE", name: "Niger" },
      { code: "MR", name: "Mauritania" },
      { code: "LY", name: "Libya" },
      { code: "SD", name: "Sudan" },
      { code: "AO", name: "Angola" },
      { code: "MZ", name: "Mozambique" },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    countries: [
      { code: "FR", name: "France" },
      { code: "ES", name: "Spain" },
      { code: "PT", name: "Portugal" },
      { code: "DE", name: "Germany" },
      { code: "IT", name: "Italy" },
      { code: "BE", name: "Belgium" },
      { code: "NL", name: "Netherlands" },
      { code: "GB", name: "United Kingdom" },
      { code: "IE", name: "Ireland" },
      { code: "CH", name: "Switzerland" },
      { code: "AT", name: "Austria" },
      { code: "SE", name: "Sweden" },
      { code: "NO", name: "Norway" },
      { code: "DK", name: "Denmark" },
      { code: "FI", name: "Finland" },
      { code: "PL", name: "Poland" },
      { code: "CZ", name: "Czech Republic" },
      { code: "RO", name: "Romania" },
      { code: "GR", name: "Greece" },
      { code: "TR", name: "Turkey" },
      { code: "LU", name: "Luxembourg" },
      { code: "HR", name: "Croatia" },
      { code: "HU", name: "Hungary" },
      { code: "BG", name: "Bulgaria" },
    ],
  },
  {
    id: "middle_east",
    name: "Middle East",
    countries: [
      { code: "AE", name: "United Arab Emirates" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "QA", name: "Qatar" },
      { code: "KW", name: "Kuwait" },
      { code: "BH", name: "Bahrain" },
      { code: "OM", name: "Oman" },
      { code: "JO", name: "Jordan" },
      { code: "LB", name: "Lebanon" },
      { code: "IQ", name: "Iraq" },
      { code: "IL", name: "Israel" },
      { code: "PS", name: "Palestine" },
    ],
  },
  {
    id: "asia",
    name: "Asia",
    countries: [
      { code: "CN", name: "China" },
      { code: "JP", name: "Japan" },
      { code: "KR", name: "South Korea" },
      { code: "IN", name: "India" },
      { code: "PK", name: "Pakistan" },
      { code: "BD", name: "Bangladesh" },
      { code: "ID", name: "Indonesia" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
      { code: "TH", name: "Thailand" },
      { code: "VN", name: "Vietnam" },
      { code: "PH", name: "Philippines" },
      { code: "HK", name: "Hong Kong" },
      { code: "TW", name: "Taiwan" },
    ],
  },
  {
    id: "north_america",
    name: "North America",
    countries: [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
      { code: "MX", name: "Mexico" },
    ],
  },
  {
    id: "south_america",
    name: "South America",
    countries: [
      { code: "BR", name: "Brazil" },
      { code: "AR", name: "Argentina" },
      { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" },
      { code: "PE", name: "Peru" },
      { code: "EC", name: "Ecuador" },
      { code: "UY", name: "Uruguay" },
    ],
  },
  {
    id: "oceania",
    name: "Oceania",
    countries: [
      { code: "AU", name: "Australia" },
      { code: "NZ", name: "New Zealand" },
    ],
  },
] as const;

/** Flat country list (deduped by code). */
export const SHIPPING_COUNTRIES: ShippingCountry[] = (() => {
  const map = new Map<string, ShippingCountry>();
  for (const region of SHIPPING_REGIONS) {
    for (const c of region.countries) {
      if (!map.has(c.code)) map.set(c.code, c);
    }
  }
  return Array.from(map.values());
})();

export type ShippingCountryCode = string;

export const ALL_SHIPPING_CITIES: string[] = SHIPPING_COUNTRIES.flatMap((c) => [
  ...(c.cities ?? []),
]);

/** @deprecated Prefer getCitiesForCountry("MA") */
export const MOROCCO_CITIES = MA_CITIES;

export function getCountriesForRegion(regionId: ShippingRegionId): ShippingCountry[] {
  return [...(SHIPPING_REGIONS.find((r) => r.id === regionId)?.countries ?? [])];
}

export function getCountryByCode(code: string): ShippingCountry | undefined {
  const upper = code.trim().toUpperCase();
  return SHIPPING_COUNTRIES.find((c) => c.code === upper);
}

export function countryCodeToName(code: string): string {
  return getCountryByCode(code)?.name ?? code;
}

export function getCitiesForCountry(code: string): readonly string[] {
  return getCountryByCode(code)?.cities ?? [];
}

export function findCountryCodeByName(name: string): string | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;
  const byName = SHIPPING_COUNTRIES.find((c) => c.name.toLowerCase() === n);
  if (byName) return byName.code;
  const byCode = SHIPPING_COUNTRIES.find((c) => c.code.toLowerCase() === n);
  return byCode?.code ?? null;
}

export function findCountryCodeForCity(city: string): string | null {
  const c = city.trim().toLowerCase();
  if (!c) return null;
  for (const country of SHIPPING_COUNTRIES) {
    if (country.cities?.some((x) => x.toLowerCase() === c)) return country.code;
  }
  return null;
}

export function resolveCountryCode(input: string | undefined | null): string | null {
  if (!input?.trim()) return null;
  const raw = input.trim();
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  return findCountryCodeByName(raw);
}

export const STORE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
] as const;

export type StoreLanguage = (typeof STORE_LANGUAGES)[number]["value"];
