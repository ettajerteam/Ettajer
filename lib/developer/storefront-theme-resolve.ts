import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { asThemeDocument, type StoreThemeDocumentV1 } from "@/lib/developer/theme-document";
import { verifyThemePreviewToken } from "@/lib/developer/preview-token";
import type { HomeLayout } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";

/**
 * Live StorePage slugs that must never be deleted during theme publish.
 * Dedicated commerce/catalog routes + reserved system paths.
 */
export const PROTECTED_LIVE_PAGE_SLUGS = [
  "products",
  "collections",
  "search",
  "blog",
  "cart",
  "checkout",
] as const;

export type ResolvedPreviewTheme = {
  themeId: string;
  document: StoreThemeDocumentV1;
  branding: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logo: string | null;
  };
  navigation: NavItem[];
};

export type ResolveStorefrontThemeResult =
  | { status: "live" }
  | { status: "preview"; resolved: ResolvedPreviewTheme }
  | { status: "forbidden" };

/**
 * Canonical storefront theme resolver.
 * Every themed storefront route must use this — never duplicate ownership checks.
 */
export async function resolveStorefrontTheme(input: {
  storeId: string;
  storeOwnerUserId: string;
  previewThemeId?: string | null;
  previewToken?: string | null;
  sessionUserId?: string | null;
}): Promise<ResolveStorefrontThemeResult> {
  const themeId = input.previewThemeId?.trim() || null;
  if (!themeId) return { status: "live" };

  const sessionOk = Boolean(
    input.sessionUserId && input.sessionUserId === input.storeOwnerUserId,
  );
  const tokenOk = Boolean(
    input.previewToken &&
      verifyThemePreviewToken(input.previewToken, {
        storeId: input.storeId,
        themeId,
      }),
  );

  if (!sessionOk && !tokenOk) {
    return { status: "forbidden" };
  }

  const draft = await prisma.storeTheme.findFirst({
    where: {
      id: themeId,
      storeId: input.storeId,
      // Private AI / merchant drafts and active private themes may be previewed.
      visibility: "private",
      status: { in: ["draft", "active"] },
    },
  });

  // Same response as unauthorized — do not leak cross-store theme existence.
  if (!draft) return { status: "forbidden" };

  const document = asThemeDocument(draft.document);
  return {
    status: "preview",
    resolved: {
      themeId: draft.id,
      document,
      branding: {
        theme: document.theme.theme,
        primaryColor: document.theme.primaryColor,
        secondaryColor: document.theme.secondaryColor,
        font: document.theme.font,
        logo: document.theme.logo ?? null,
      },
      navigation: document.navigation,
    },
  };
}

/** Convenience: load session + resolve from common storefront searchParams. */
export async function resolveStorefrontThemeFromRequest(input: {
  storeId: string;
  storeOwnerUserId: string;
  searchParams: {
    previewThemeId?: string;
    previewToken?: string;
    preview?: string;
  };
}): Promise<ResolveStorefrontThemeResult> {
  const themeId = input.searchParams.previewThemeId?.trim();
  if (!themeId) return { status: "live" };

  const session = await auth();
  return resolveStorefrontTheme({
    storeId: input.storeId,
    storeOwnerUserId: input.storeOwnerUserId,
    previewThemeId: themeId,
    previewToken: input.searchParams.previewToken,
    sessionUserId: session?.user?.id ?? null,
  });
}

export function getThemeTemplateLayout(
  document: StoreThemeDocumentV1,
  key: "home" | "product" | "collection" | "blogPost",
): HomeLayout | null {
  if (key === "home") return document.templates.home;
  if (key === "product") return document.templates.product ?? null;
  if (key === "collection") return document.templates.collection ?? null;
  if (key === "blogPost") return document.templates.blogPost ?? null;
  return null;
}

export function getThemePageBySlug(
  document: StoreThemeDocumentV1,
  slug: string,
): StoreThemeDocumentV1["pages"][number] | null {
  return document.pages.find((p) => p.slug === slug) ?? null;
}

/** Overlay draft branding onto a serialized public store object. */
export function applyResolvedThemeBranding<
  T extends {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logo?: string | null;
  },
>(store: T, resolved: ResolvedPreviewTheme | null): T {
  if (!resolved) return store;
  return {
    ...store,
    theme: resolved.branding.theme,
    primaryColor: resolved.branding.primaryColor,
    secondaryColor: resolved.branding.secondaryColor,
    font: resolved.branding.font,
    logo: resolved.branding.logo || store.logo,
  };
}
