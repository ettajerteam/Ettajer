import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  deleteBuilderComponent,
  getBuilderComponent,
  updateBuilderComponent,
} from "@/lib/builder/components/service";
import type { BuilderComponent } from "@/lib/builder/components";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const component = await getBuilderComponent(store.id, id);
    if (!component) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ component });
  } catch (error) {
    console.error("Component fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch component" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const patch = body.patch as Partial<BuilderComponent> | undefined;

    if (!patch) {
      return NextResponse.json({ message: "Invalid patch" }, { status: 400 });
    }

    const updated = await updateBuilderComponent(store.id, id, patch);
    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ component: updated });
  } catch (error) {
    console.error("Component update error:", error);
    return NextResponse.json({ message: "Failed to update component" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const ok = await deleteBuilderComponent(store.id, id);
    if (!ok) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Component delete error:", error);
    return NextResponse.json({ message: "Failed to delete component" }, { status: 500 });
  }
}
