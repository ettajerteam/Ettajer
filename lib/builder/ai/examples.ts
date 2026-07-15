/**
 * Typed example demonstrating luxury perfume generation output.
 * Run manually: npx tsx lib/builder/ai/examples.ts
 */
import { generateSite } from "./generate";
import type { AiGeneratedSite } from "./types";

export const LUXURY_PERFUME_PROMPT = "Create luxury perfume ecommerce website";

/** Expected output shape for the luxury perfume prompt (for docs / dev reference). */
export type LuxuryPerfumeExample = AiGeneratedSite;

export async function runLuxuryPerfumeExample(): Promise<LuxuryPerfumeExample | undefined> {
  const result = await generateSite(LUXURY_PERFUME_PROMPT);

  if (!result.success || !result.data) {
    console.error("Generation failed:", result.error);
    return undefined;
  }

  const site = result.data;

  console.log("=== Luxury Perfume Site ===");
  console.log("Provider:", site.metadata.provider);
  console.log("Confidence:", site.metadata.confidence);
  console.log("Theme:", site.theme);
  console.log("Navigation:", site.navigation.map((n) => n.label).join(" → "));
  console.log("Home sections:", site.pages[0]?.sections.map((s) => s.blockId).join(" → "));

  if (result.warnings?.length) {
    console.log("Warnings:", result.warnings);
  }

  return site;
}

if (require.main === module) {
  runLuxuryPerfumeExample().catch(console.error);
}
