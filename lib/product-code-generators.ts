const SKU_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChunk(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SKU_ALPHABET[Math.floor(Math.random() * SKU_ALPHABET.length)];
  }
  return out;
}

/** Merchant-facing product code, e.g. P-K7MQ-3N2A */
export function generateProductSku(): string {
  return `P-${randomChunk(4)}-${randomChunk(4)}`;
}

/** EAN-13 check digit for a 12-digit body. */
export function ean13CheckDigit(body12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = Number(body12[i]);
    sum += i % 2 === 0 ? n : n * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

/**
 * Numeric EAN-13 barcode (scannable by most handheld scanners).
 * Uses internal prefix 200–299 (in-store / company range).
 */
export function generateProductBarcode(): string {
  const prefix = "20";
  let body = prefix;
  while (body.length < 12) {
    body += String(Math.floor(Math.random() * 10));
  }
  return body + ean13CheckDigit(body);
}
