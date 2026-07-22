import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { generatePage, generateSection } from "@/lib/builder/ai/generate";
import type { BlockId } from "@/lib/builder/types";

type GenerateMode = "section" | "page";

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      mode?: GenerateMode;
      prompt?: string;
      blockId?: string;
      storeName?: string;
      storeDescription?: string;
    } | null;

    const mode = body?.mode === "page" ? "page" : "section";
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { message: "Describe what you want to generate (at least a few words)" },
        { status: 400 }
      );
    }
    if (prompt.length > 2000) {
      return NextResponse.json({ message: "Prompt is too long" }, { status: 400 });
    }

    const promptPayload = {
      text: prompt,
      storeName: body?.storeName?.trim() || store.name,
      storeDescription: body?.storeDescription?.trim() || store.description || undefined,
    };

    if (mode === "section") {
      const result = await generateSection(promptPayload, {
        blockId: typeof body?.blockId === "string" ? (body.blockId as BlockId) : undefined,
      });
      if (!result.success || !result.data) {
        return NextResponse.json(
          { message: result.error ?? "Failed to generate section" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        mode,
        section: result.data,
        warnings: result.warnings,
      });
    }

    const result = await generatePage(promptPayload);
    if (!result.success || !result.data) {
      return NextResponse.json(
        { message: result.error ?? "Failed to generate page" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode,
      page: result.data,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error("Builder AI generate error:", error);
    return NextResponse.json({ message: "Generation failed" }, { status: 500 });
  }
}
