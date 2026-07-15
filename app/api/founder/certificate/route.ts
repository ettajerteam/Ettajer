import { NextResponse } from "next/server";
import { generateFounderCardAssets, getFounderAttachmentNames } from "@/lib/founder/founder-card-assets";

/**
 * Dev-only: preview founder certificate PDF.
 * GET /api/founder/certificate?name=Youssef&number=42
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "Youssef";
  const number = Number(searchParams.get("number") ?? "42");

  if (!Number.isFinite(number) || number < 1 || number > 100) {
    return NextResponse.json({ message: "Invalid founder number" }, { status: 400 });
  }

  try {
    const assets = await generateFounderCardAssets(name, number);
    const filenames = getFounderAttachmentNames(number);

    return new NextResponse(new Uint8Array(assets.pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filenames.pdf}"`,
      },
    });
  } catch (error) {
    console.error("Founder certificate preview error:", error);
    return NextResponse.json({ message: "Failed to generate certificate" }, { status: 500 });
  }
}
