import { slugify } from "@/lib/utils";

export type ProductAiAssistResult = {
  description: string;
  seoTitle: string;
  seoDescription: string;
  highlights: string[];
  tags: string[];
};

/** Lightweight on-device assist until a hosted LLM endpoint is wired. */
export function improveProductWithAi(input: {
  title: string;
  productType?: string;
}): ProductAiAssistResult | null {
  const title = input.title.trim();
  if (title.length < 2) return null;

  const type = input.productType ?? "physical";
  const typeHint =
    type === "digital"
      ? "instant download"
      : type === "service"
        ? "professional service"
        : type === "dropshipping"
          ? "ready to ship from our partner network"
          : "cash on delivery across Morocco";

  const description = [
    `<p><strong>${escapeHtml(title)}</strong> is designed for everyday use — quality you can feel, details that matter.</p>`,
    `<p>Perfect for customers who want something reliable, stylish, and ${escapeHtml(typeHint)}. Order with confidence and enjoy a smooth checkout experience.</p>`,
    `<ul><li>Carefully selected materials and finish</li><li>Clear product details so you know exactly what you get</li><li>Fast fulfillment and friendly support</li></ul>`,
  ].join("");

  const seoTitle = title.length > 55 ? `${title.slice(0, 52).trim()}…` : title;
  const seoDescription =
    `Buy ${title} online — ${typeHint}. Quality product with easy returns and trusted COD checkout.`.slice(
      0,
      160
    );

  const highlights =
    type === "digital"
      ? ["Instant delivery", "Premium quality", "Easy to use"]
      : type === "service"
        ? ["Professional", "Reliable", "Book easily"]
        : ["Premium quality", "Lightweight", "Fast shipping"];

  const baseTag = slugify(title).split("-").filter(Boolean).slice(0, 3);
  const tags = Array.from(
    new Set([...baseTag, type === "dropshipping" ? "dropshipping" : "new", "bestseller"])
  ).slice(0, 8);

  return { description, seoTitle, seoDescription, highlights, tags };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
