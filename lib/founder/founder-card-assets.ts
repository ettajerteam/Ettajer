import path from "path";
import { Resvg } from "@resvg/resvg-js";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { FounderMembershipPdf } from "@/components/founder/founder-membership-pdf";
import { buildFounderCardSvg } from "@/lib/founder/founder-card-svg";

export interface FounderCardAssets {
  pngBuffer: Buffer;
  pdfBuffer: Buffer;
  pngBase64: string;
}

function fontPaths(): string[] {
  const dir = path.join(process.cwd(), "assets", "fonts");
  return [
    path.join(dir, "NotoSans-SemiBold.ttf"),
    path.join(dir, "NotoSansArabic-SemiBold.ttf"),
  ];
}

export async function generateFounderCardAssets(
  name: string,
  founderNumber: number,
): Promise<FounderCardAssets> {
  const svg = buildFounderCardSvg(name, founderNumber);

  // resvg + bundled Noto fonts — Sharp/librsvg has no Arial on Vercel, which
  // rendered tofu boxes (□) instead of founder numbers and names.
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 960 },
    font: {
      fontFiles: fontPaths(),
      loadSystemFonts: false,
      defaultFontFamily: "Noto Sans",
    },
  });
  const pngBuffer = Buffer.from(resvg.render().asPng());

  const pdfBuffer = await renderToBuffer(
    FounderMembershipPdf({
      name,
      founderNumber,
      cardPngBase64: pngBuffer.toString("base64"),
    }) as ReactElement,
  );

  return {
    pngBuffer,
    pdfBuffer: Buffer.from(pdfBuffer),
    pngBase64: pngBuffer.toString("base64"),
  };
}

export function getFounderAttachmentNames(founderNumber: number) {
  const padded = String(founderNumber).padStart(4, "0");
  return {
    pdf: `Ettajer-Founder-Certificate-${padded}.pdf`,
    png: `Ettajer-Founder-Card-${padded}.png`,
  };
}
