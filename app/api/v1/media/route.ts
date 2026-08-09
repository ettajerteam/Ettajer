import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import {
  listMediaForStore,
  registerMediaUrlForStore,
} from "@/lib/developer/commerce-read";
import { prisma } from "@/lib/db";
import { persistUploadedFile } from "@/lib/media/storage";
import { logDeveloperAction } from "@/lib/developer/audit";
import { DeveloperApiError } from "@/lib/developer/errors";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "media:read",
  handler: async (req, ctx) => {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const page = await listMediaForStore(ctx.storeId, { limit, cursor });
    return jsonData({ media: page.items }, { pagination: page.pagination });
  },
});

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: "media:write",
  handler: async (req, ctx) => {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as {
        url?: string;
        filename?: string;
        mimeType?: string;
        kind?: string;
        alt?: string;
      };
      if (!body.url) {
        throw new DeveloperApiError("VALIDATION_ERROR", "url is required.");
      }
      const asset = await registerMediaUrlForStore(ctx, {
        url: body.url,
        filename: body.filename,
        mimeType: body.mimeType,
        kind: body.kind,
        alt: body.alt,
      });
      return jsonData({ media: asset }, { status: 201 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new DeveloperApiError("VALIDATION_ERROR", "file is required.");
    }
    const persisted = await persistUploadedFile(ctx.storeId, file);
    const asset = await prisma.mediaAsset.create({
      data: {
        storeId: ctx.storeId,
        url: persisted.url,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        kind: String(form.get("kind") || "image"),
        size: file.size,
        alt: typeof form.get("alt") === "string" ? String(form.get("alt")) : null,
      },
    });

    await logDeveloperAction({
      applicationId: ctx.applicationId,
      userId: ctx.userId,
      storeId: ctx.storeId,
      actorType: ctx.actor,
      action: "media.created",
      resource: "media",
      resourceId: asset.id,
    });

    return jsonData({ media: asset }, { status: 201 });
  },
});
