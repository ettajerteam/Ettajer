import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import {
  listStoreThemes,
  publishStoreThemeAsMerchant,
  saveStoreThemeAsMerchant,
} from "@/lib/developer/theme-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const themes = await listStoreThemes(store.id, { includeArchived: true });
  return NextResponse.json({ themes });
}

export async function POST(request: Request) {
  const session = await auth();
  const store = await getAuthenticatedStore();
  if (!session?.user?.id || !store) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: string;
    themeId?: string;
    document?: unknown;
    name?: string;
    description?: string | null;
  };

  if (!body.themeId) {
    return NextResponse.json({ error: "themeId required" }, { status: 400 });
  }

  if (body.action === "publish") {
    const theme = await publishStoreThemeAsMerchant({
      storeId: store.id,
      userId: session.user.id,
      themeId: body.themeId,
    });
    return NextResponse.json({ theme });
  }

  if (body.action === "save") {
    if (body.document === undefined) {
      return NextResponse.json({ error: "document required" }, { status: 400 });
    }
    try {
      const theme = await saveStoreThemeAsMerchant({
        storeId: store.id,
        userId: session.user.id,
        themeId: body.themeId,
        document: body.document,
        name: body.name,
        description: body.description,
      });
      return NextResponse.json({ theme });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
