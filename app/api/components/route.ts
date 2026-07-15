import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  createBuilderComponent,
  listBuilderComponents,
} from "@/lib/builder/components/service";
import type { BuilderComponent } from "@/lib/builder/components";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const components = await listBuilderComponents(store.id);
    return NextResponse.json({ components });
  } catch (error) {
    console.error("Components list error:", error);
    return NextResponse.json({ message: "Failed to list components" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const input = body.component as BuilderComponent | undefined;

    if (!input?.name || !input.root) {
      return NextResponse.json({ message: "Invalid component" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const component: BuilderComponent = {
      ...input,
      storeId: store.id,
      version: input.version ?? 1,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    };

    const saved = await createBuilderComponent(component);
    return NextResponse.json({ component: saved }, { status: 201 });
  } catch (error) {
    console.error("Component create error:", error);
    return NextResponse.json({ message: "Failed to create component" }, { status: 500 });
  }
}
