import sharp from "sharp";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { FounderMembershipPdf } from "@/components/founder/founder-membership-pdf";
import { buildFounderCardSvg } from "@/lib/founder/founder-card-svg";

export interface FounderCardAssets {
  pngBuffer: Buffer;
  pdfBuffer: Buffer;
  pngBase64: string;
}

export async function generateFounderCardAssets(
  name: string,
  founderNumber: number,
): Promise<FounderCardAssets> {
  const svg = buildFounderCardSvg(name, founderNumber);

  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .resize(960, 606, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

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
