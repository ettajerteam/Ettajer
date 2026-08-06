import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  createJourney,
  deleteJourney,
  getJourney,
  listJourneys,
  updateJourney,
} from "@/lib/email-marketing/atlas/journeys";
import { generateAiFlowPack } from "@/lib/email-marketing/atlas/ai";
import {
  JOURNEY_KINDS,
  JOURNEY_TRIGGERS,
  isJourneyTrigger,
} from "@/lib/email-marketing/atlas/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const journey = await getJourney(authStore.id, id);
      if (!journey) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, journey });
    }
    const journeys = await listJourneys(authStore.id);
    return NextResponse.json({
      ok: true,
      journeys,
      triggers: JOURNEY_TRIGGERS,
      kinds: JOURNEY_KINDS,
    });
  } catch (error) {
    console.error("[email/journeys GET]", error);
    return NextResponse.json(
      { message: "Failed to load journeys" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  kind: z.string().optional(),
  trigger: z.string().min(1),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  settings: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const action = body?.action as string | undefined;

    if (action === "generate_ai") {
      const desc = String(body?.businessDescription || "").trim();
      if (!desc) {
        return NextResponse.json(
          { message: "businessDescription required" },
          { status: 400 }
        );
      }
      const store = await prisma.store.findUnique({
        where: { id: authStore.id },
        select: { name: true },
      });
      const pack = await generateAiFlowPack({
        storeName: store?.name || "Store",
        businessDescription: desc,
      });
      const created = [];
      for (const flow of pack.flows) {
        const journey = await createJourney({
          storeId: authStore.id,
          name: flow.name,
          description: flow.rationale,
          kind: flow.kind,
          trigger: flow.trigger,
          storeName: store?.name,
          nodes: flow.nodes,
          edges: flow.edges,
          settings: flow.settings,
        });
        created.push(journey);
      }
      return NextResponse.json({
        ok: true,
        businessSummary: pack.businessSummary,
        journeys: created,
      });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    if (!isJourneyTrigger(parsed.data.trigger)) {
      return NextResponse.json(
        { message: "Unknown trigger" },
        { status: 400 }
      );
    }
    const storeRow = await prisma.store.findUnique({
      where: { id: authStore.id },
      select: { name: true },
    });
    const journey = await createJourney({
      storeId: authStore.id,
      name: parsed.data.name,
      description: parsed.data.description,
      kind: parsed.data.kind,
      trigger: parsed.data.trigger,
      storeName: storeRow?.name,
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      settings: parsed.data.settings,
    });
    return NextResponse.json({ ok: true, journey });
  } catch (error) {
    console.error("[email/journeys POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create journey",
      },
      { status: 500 }
    );
  }
}

const putSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  settings: z.record(z.unknown()).optional(),
});

export async function PUT(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const journey = await updateJourney(authStore.id, parsed.data.id, {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      settings: parsed.data.settings,
    });
    return NextResponse.json({ ok: true, journey });
  } catch (error) {
    console.error("[email/journeys PUT]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update journey",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "id required" }, { status: 400 });
    }
    await deleteJourney(authStore.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[email/journeys DELETE]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete journey",
      },
      { status: 500 }
    );
  }
}
