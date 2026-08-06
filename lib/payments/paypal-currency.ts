/** Currencies PayPal Checkout accepts for capture (ISO 4217). */
export const PAYPAL_SUPPORTED_CURRENCIES = [
  "AUD",
  "BRL",
  "CAD",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "HKD",
  "HUF",
  "ILS",
  "JPY",
  "MYR",
  "MXN",
  "TWD",
  "NZD",
  "NOK",
  "PHP",
  "PLN",
  "GBP",
  "SGD",
  "SEK",
  "CHF",
  "THB",
  "USD",
] as const;

export type PaypalSupportedCurrency =
  (typeof PAYPAL_SUPPORTED_CURRENCIES)[number];

export function isPaypalCurrencySupported(currency: string): boolean {
  return PAYPAL_SUPPORTED_CURRENCIES.includes(
    currency.trim().toUpperCase() as PaypalSupportedCurrency
  );
}

export function paypalCurrencyHint(storeCurrency: string): string {
  const code = storeCurrency.trim().toUpperCase() || "MAD";
  if (isPaypalCurrencySupported(code)) {
    return `Checkout will charge in ${code}. Money goes to your PayPal account.`;
  }
  return `Your store currency is ${code}, which PayPal does not support. Switch store currency to USD or EUR in Settings → Languages, then connect PayPal.`;
}
