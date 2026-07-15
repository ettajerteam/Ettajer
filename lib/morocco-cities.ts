export const MOROCCO_CITIES = [
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
] as const;

export const STORE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
] as const;

export type StoreLanguage = (typeof STORE_LANGUAGES)[number]["value"];
