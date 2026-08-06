import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import {
  createAudienceSegment,
  deleteAudienceSegment,
  listAudienceSegments,
  normalizeSegmentDefinitionInput,
  previewSegment,
  refreshSegmentCachedCount,
  serializeAudienceSegment,
  updateAudienceSegment,
} from "@/lib/email-marketing/segments";
import { SEGMENT_FILTER_TYPES } from "@/lib/email-marketing/segment-types";

export const dynamic = "force-dynamic";

const filterSchema = z.object({
  type: z.enum(SEGMENT_FILTER_TYPES),
  value: z.number().optional(),
  minSpent: z.number().optional(),
  values: z.array(z.string()).optional(),
  after: z.string().optional().nullable(),
  before: z.string().optional().nullable(),
  withinDays: z.number().int().positive().optional().nullable(),
});

const definitionSchema = z.object({
  match: z.enum(["all", "any"]).default("all"),
  filters: z.array(filterSchema).min(1).max(20),
});

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const segments = await listAudienceSegments(store.id);
    // Refresh counts so the dashboard stays current
    const refreshed = await Promise.all(
      segments.map(async (segment) => {
        const ageMs = segment.cachedAt
          ? Date.now() - segment.cachedAt.getTime()
          : Number.POSITIVE_INFINITY;
        if (ageMs < 60_000) return segment;
        return (await refreshSegmentCachedCount(segment.id)) ?? segment;
      })
    );

    return NextResponse.json({
      ok: true,
      segments: refreshed.map(serializeAudienceSegment),
    });
  } catch (error) {
    console.error("[email/segments GET]", error);
    return NextResponse.json(
      { message: "Failed to load segments" },
      { status: 500 }
    );
  }
}

const postSchema = z.object({
  action: z.enum(["create", "preview"]).default("create"),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  filters: definitionSchema,
});

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = postSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid segment", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const definition = normalizeSegmentDefinitionInput(parsed.data.filters);

    if (parsed.data.action === "preview") {
      const preview = await previewSegment(store.id, definition);
      return NextResponse.json({ ok: true, ...preview });
    }

    if (!parsed.data.name?.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const segment = await createAudienceSegment({
      storeId: store.id,
      name: parsed.data.name,
      description: parsed.data.description,
      filters: definition,
    });

    return NextResponse.json({
      ok: true,
      segment: serializeAudienceSegment(segment),
    });
  } catch (error) {
    console.error("[email/segments POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create segment",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const schema = z.object({
      id: z.string().min(1),
      name: z.string().trim().min(1).max(120).optional(),
      description: z.string().trim().max(500).optional().nullable(),
      filters: definitionSchema.optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const segment = await updateAudienceSegment({
      storeId: store.id,
      id: parsed.data.id,
      name: parsed.data.name,
      description: parsed.data.description,
      filters: parsed.data.filters
        ? normalizeSegmentDefinitionInput(parsed.data.filters)
        : undefined,
    });

    return NextResponse.json({
      ok: true,
      segment: serializeAudienceSegment(segment),
    });
  } catch (error) {
    console.error("[email/segments PATCH]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update segment",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }
    await deleteAudienceSegment(store.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[email/segments DELETE]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete segment",
      },
      { status: 400 }
    );
  }
}
