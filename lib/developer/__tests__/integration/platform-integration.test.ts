/**
 * Integration tests — require DATABASE_URL (CI should set a dedicated test DB).
 * Run: DATABASE_URL=... npx vitest run lib/developer/__tests__/integration
 */
import { describe, expect, it } from "vitest";
import {
  authCtxFromApiKey,
  createTwoStoreFixture,
  hasTestDatabase,
} from "../helpers/test-fixtures";
import { DeveloperApiError } from "@/lib/developer/errors";
import { emptyThemeDocument } from "@/lib/developer/theme-document";
import {
  issueThemePreviewToken,
  verifyThemePreviewToken,
} from "@/lib/developer/preview-token";

describe.runIf(hasTestDatabase)("tenant isolation (db)", () => {
  it("denies cross-store product references in theme validation", async () => {
    const fx = await createTwoStoreFixture();
    try {
      const { validateThemeDocument } = await import("@/lib/developer/theme-validate");
      await expect(
        validateThemeDocument(fx.storeA.id, {
          ...fx.emptyDoc,
          templates: {
            home: {
              version: 1,
              sections: [
                {
                  id: "sec1",
                  type: "product-grid",
                  visible: true,
                  settings: { products: [{ productId: fx.productB.id }] },
                },
              ],
            },
          },
        }),
      ).rejects.toBeInstanceOf(DeveloperApiError);
    } finally {
      await fx.cleanup();
    }
  });

  it("allows same-store product references", async () => {
    const fx = await createTwoStoreFixture();
    try {
      const { validateThemeDocument } = await import("@/lib/developer/theme-validate");
      const doc = await validateThemeDocument(fx.storeA.id, {
        ...fx.emptyDoc,
        templates: {
          home: {
            version: 1,
            sections: [
              {
                id: "sec1",
                type: "product-grid",
                visible: true,
                settings: { products: [{ productId: fx.productA.id }] },
              },
            ],
          },
        },
      });
      expect(doc.templates.home.sections).toHaveLength(1);
    } finally {
      await fx.cleanup();
    }
  });

  it("denies Store A reading Store B theme", async () => {
    const fx = await createTwoStoreFixture();
    try {
      const themeB = await fx.prisma.storeTheme.create({
        data: {
          storeId: fx.storeB.id,
          name: "B Theme",
          source: "ai",
          provider: "claude",
          visibility: "private",
          status: "draft",
          document: fx.asJson(fx.emptyDoc),
        },
      });
      const { getStoreTheme } = await import("@/lib/developer/theme-service");
      await expect(getStoreTheme(fx.storeA.id, themeB.id)).rejects.toBeInstanceOf(
        DeveloperApiError,
      );
    } finally {
      await fx.cleanup();
    }
  });

  it("denies cross-store media and preview ownership", async () => {
    const fx = await createTwoStoreFixture();
    try {
      const mediaB = await fx.prisma.mediaAsset.create({
        data: {
          storeId: fx.storeB.id,
          url: "https://cdn.example.com/b.png",
          filename: "b.png",
          mimeType: "image/png",
          kind: "image",
          size: 1,
        },
      });
      const themeB = await fx.prisma.storeTheme.create({
        data: {
          storeId: fx.storeB.id,
          name: "B Theme",
          source: "ai",
          provider: "claude",
          visibility: "private",
          status: "draft",
          document: fx.asJson(fx.emptyDoc),
        },
      });

      const found = await fx.prisma.mediaAsset.findFirst({
        where: { id: mediaB.id, storeId: fx.storeA.id },
      });
      expect(found).toBeNull();

      const { resolveStorefrontTheme } = await import(
        "@/lib/developer/storefront-theme-resolve"
      );
      const denied = await resolveStorefrontTheme({
        storeId: fx.storeA.id,
        storeOwnerUserId: fx.userA.id,
        previewThemeId: themeB.id,
        sessionUserId: fx.userA.id,
      });
      expect(denied.status).toBe("forbidden");
    } finally {
      await fx.cleanup();
    }
  });
});

describe.runIf(hasTestDatabase)("publish orphans + idempotency (db)", () => {
  it("removes orphan custom pages and is idempotent", async () => {
    const fx = await createTwoStoreFixture();
    try {
      await fx.prisma.storePage.create({
        data: {
          storeId: fx.storeA.id,
          slug: "lookbook",
          title: "Lookbook",
          content: "{}",
          status: "published",
        },
      });
      await fx.prisma.storePage.create({
        data: {
          storeId: fx.storeA.id,
          slug: "about",
          title: "About",
          content: "{}",
          status: "published",
        },
      });

      const doc = emptyThemeDocument({ theme: "minimal" });
      doc.pages = [
        {
          id: "page_about",
          slug: "about",
          title: "About Us",
          layout: { version: 1, sections: [] },
          status: "published",
        },
      ];

      const theme = await fx.prisma.storeTheme.create({
        data: {
          storeId: fx.storeA.id,
          name: "AI Theme",
          source: "ai",
          provider: "claude",
          visibility: "private",
          status: "draft",
          document: fx.asJson(doc),
        },
      });

      const ctx = authCtxFromApiKey({
        applicationId: fx.appA.id,
        applicationName: fx.appA.name,
        userId: fx.userA.id,
        storeId: fx.storeA.id,
        scopes: fx.scopesA,
        apiKeyId: fx.apiKeyA.id,
        tokenKey: fx.apiKeyA.keyPrefix,
      });

      const { publishStoreTheme } = await import("@/lib/developer/theme-service");
      const first = await publishStoreTheme(ctx, theme.id);
      expect(first.status).toBe("active");

      const pagesAfterFirst = await fx.prisma.storePage.findMany({
        where: { storeId: fx.storeA.id },
        select: { slug: true, title: true },
      });
      const slugs1 = pagesAfterFirst.map((p) => p.slug).sort();
      expect(slugs1).toContain("about");
      expect(slugs1).not.toContain("lookbook");

      const second = await publishStoreTheme(ctx, theme.id);
      expect(second.status).toBe("active");
      const pagesAfterSecond = await fx.prisma.storePage.findMany({
        where: { storeId: fx.storeA.id },
        select: { slug: true },
      });
      expect(pagesAfterSecond.map((p) => p.slug).sort()).toEqual(slugs1);

      const activeCount = await fx.prisma.storeTheme.count({
        where: { storeId: fx.storeA.id, status: "active" },
      });
      expect(activeCount).toBe(1);
    } finally {
      await fx.cleanup();
    }
  });

  it("does not delete protected catalog pages", async () => {
    const fx = await createTwoStoreFixture();
    try {
      await fx.prisma.storePage.create({
        data: {
          storeId: fx.storeA.id,
          slug: "products",
          title: "Products",
          content: "{}",
          status: "published",
        },
      });
      const doc = emptyThemeDocument({ theme: "minimal" });
      const theme = await fx.prisma.storeTheme.create({
        data: {
          storeId: fx.storeA.id,
          name: "Empty AI",
          source: "ai",
          provider: "claude",
          visibility: "private",
          status: "draft",
          document: fx.asJson(doc),
        },
      });
      const ctx = authCtxFromApiKey({
        applicationId: fx.appA.id,
        applicationName: fx.appA.name,
        userId: fx.userA.id,
        storeId: fx.storeA.id,
        scopes: fx.scopesA,
        apiKeyId: fx.apiKeyA.id,
        tokenKey: fx.apiKeyA.keyPrefix,
      });
      const { publishStoreTheme } = await import("@/lib/developer/theme-service");
      await publishStoreTheme(ctx, theme.id);
      const productsPage = await fx.prisma.storePage.findFirst({
        where: { storeId: fx.storeA.id, slug: "products" },
      });
      expect(productsPage).not.toBeNull();
    } finally {
      await fx.cleanup();
    }
  });
});

describe.runIf(hasTestDatabase)("preview token + AI workflow (db)", () => {
  it("issues preview token usable only for that store/theme", async () => {
    const fx = await createTwoStoreFixture();
    try {
      process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-secret-for-preview";
      const theme = await fx.prisma.storeTheme.create({
        data: {
          storeId: fx.storeA.id,
          name: "Previewable",
          source: "ai",
          provider: "claude",
          visibility: "private",
          status: "draft",
          document: fx.asJson(fx.emptyDoc),
        },
      });
      const issued = issueThemePreviewToken({
        storeId: fx.storeA.id,
        themeId: theme.id,
      });
      expect(
        verifyThemePreviewToken(issued.token, {
          storeId: fx.storeA.id,
          themeId: theme.id,
        }),
      ).not.toBeNull();
      expect(
        verifyThemePreviewToken(issued.token, {
          storeId: fx.storeB.id,
          themeId: theme.id,
        }),
      ).toBeNull();

      const { resolveStorefrontTheme } = await import(
        "@/lib/developer/storefront-theme-resolve"
      );
      const ok = await resolveStorefrontTheme({
        storeId: fx.storeA.id,
        storeOwnerUserId: fx.userA.id,
        previewThemeId: theme.id,
        previewToken: issued.token,
      });
      expect(ok.status).toBe("preview");

      const cross = await resolveStorefrontTheme({
        storeId: fx.storeB.id,
        storeOwnerUserId: fx.userB.id,
        previewThemeId: theme.id,
        previewToken: issued.token,
      });
      expect(cross.status).toBe("forbidden");
    } finally {
      await fx.cleanup();
    }
  });

  it("runs create → sections with real products → publish end-to-end", async () => {
    const fx = await createTwoStoreFixture();
    try {
      const ctx = authCtxFromApiKey({
        applicationId: fx.appA.id,
        applicationName: fx.appA.name,
        userId: fx.userA.id,
        storeId: fx.storeA.id,
        scopes: fx.scopesA,
        apiKeyId: fx.apiKeyA.id,
        tokenKey: fx.apiKeyA.keyPrefix,
      });

      const {
        createStoreTheme,
        createThemePage,
        createThemeSection,
        publishStoreTheme,
        getStoreTheme,
      } = await import("@/lib/developer/theme-service");
      const { createThemePreviewAccess } = await import("@/lib/developer/theme-preview");

      const created = await createStoreTheme(ctx, {
        name: "Atlas Editorial",
        provider: "claude",
      });
      await createThemePage(ctx, created.id, {
        slug: "about",
        title: "About",
      });
      await createThemeSection(ctx, created.id, {
        templateKey: "home",
        sectionType: "hero",
        settings: { headline: "Hello" },
      });
      await createThemeSection(ctx, created.id, {
        templateKey: "home",
        sectionType: "product-grid",
        settings: { products: [{ productId: fx.productA.id }] },
      });
      await createThemeSection(ctx, created.id, {
        templateKey: "product",
        sectionType: "product-gallery",
        settings: {},
      });
      await createThemeSection(ctx, created.id, {
        templateKey: "collection",
        sectionType: "collection-page-banner",
        settings: {},
      });

      process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-secret-for-preview";
      const preview = await createThemePreviewAccess(ctx, created.id);
      expect(preview.previewUrl).toContain("previewToken=");
      expect(preview.previewUrl).toContain(created.id);

      const published = await publishStoreTheme(ctx, created.id);
      expect(published.status).toBe("active");
      expect(published.id).toBe(created.id);

      const live = await getStoreTheme(fx.storeA.id, created.id);
      expect(live.status).toBe("active");

      const about = await fx.prisma.storePage.findFirst({
        where: { storeId: fx.storeA.id, slug: "about" },
      });
      expect(about).not.toBeNull();

      // Store B cannot publish/get Store A theme
      const ctxB = authCtxFromApiKey({
        applicationId: fx.appB.id,
        applicationName: fx.appB.name,
        userId: fx.userB.id,
        storeId: fx.storeB.id,
        scopes: fx.scopesB,
        apiKeyId: fx.apiKeyB.id,
        tokenKey: fx.apiKeyB.keyPrefix,
      });
      await expect(publishStoreTheme(ctxB, created.id)).rejects.toBeInstanceOf(
        DeveloperApiError,
      );
    } finally {
      await fx.cleanup();
    }
  });
});

describe("preview token unit", () => {
  it("rejects tampered tokens", () => {
    process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "unit-test-secret";
    const issued = issueThemePreviewToken({
      storeId: "store1",
      themeId: "theme1",
    });
    const tampered = issued.token.replace(/\.$/, "") + "x";
    expect(
      verifyThemePreviewToken(tampered, { storeId: "store1", themeId: "theme1" }),
    ).toBeNull();
  });
});
