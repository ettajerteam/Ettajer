import type { PublicStore } from "@/types/storefront";
import { Suspense } from "react";
import { getFontFamily, getStoreFontWeight } from "@/lib/storefront-fonts";
import { getThemeTemplate } from "@/lib/themes";
import {
  designTokensToCssVars,
  resolveDesignTokens,
} from "@/lib/design-tokens";
import { resolveStoreCtaColors } from "@/lib/storefront/cta-contrast";
import { getStorefrontCopy, getStorefrontDir, getStorefrontLang } from "@/lib/storefront/storefront-i18n";
import { StorefrontCartProvider } from "@/components/storefront/cart/storefront-cart-provider";
import { MarketingPixels } from "@/components/storefront/marketing-pixels";
import { UtmCapture } from "@/components/storefront/utm-capture";
import { StorefrontAnalytics } from "@/components/storefront/storefront-analytics";
import { PreviewAwareShell } from "@/components/storefront/preview-aware-shell";

interface StorefrontShellProps {
  store: PublicStore;
  children: React.ReactNode;
  preview?: boolean;
  purchaseEvent?: {
    value: number;
    currency: string;
    orderNumber: string;
    contentIds?: string[];
    numItems?: number;
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    city?: string | null;
    country?: string | null;
    zip?: string | null;
  };
}

export function StorefrontShell({ store, children, preview, purchaseEvent }: StorefrontShellProps) {
  const template = getThemeTemplate(store.theme);
  const tokens = resolveDesignTokens(store.theme, {
    textColor: store.textColor,
    mutedColor: store.mutedColor,
    borderColor: store.borderColor,
    buttonRadius: store.buttonRadius,
  });
  const copy = getStorefrontCopy(store.language);
  const dir = getStorefrontDir(store.language);
  const lang = getStorefrontLang(store.language);
  const showAnnounce =
    store.announceBarEnabled && Boolean(store.announceBarText?.trim());
  const fontWeight = getStoreFontWeight(store.font);
  const ctaSurface = store.theme === "bold" ? "dark" : "light";
  const cta = resolveStoreCtaColors(store.primaryColor, ctaSurface);

  const inner = (
    <>
      {preview && (
        <div className="sticky top-0 z-50 bg-[#007AFF] text-center text-xs font-medium py-1.5 text-white">
          {copy.previewBanner}
        </div>
      )}
      {showAnnounce ? (
        <div
          className="px-4 py-2 text-center text-[12px] font-medium tracking-wide sm:text-[13px]"
          style={{
            backgroundColor: cta.fill,
            color: cta.onFill,
          }}
          role="status"
        >
          {store.announceBarText}
        </div>
      ) : null}
      <StorefrontCartProvider store={store}>{children}</StorefrontCartProvider>
      <Suspense fallback={null}>
        <UtmCapture />
      </Suspense>
      {!preview ? (
        <Suspense fallback={null}>
          <StorefrontAnalytics storeSlug={store.slug} />
        </Suspense>
      ) : null}
      <MarketingPixels
        marketing={store.marketing}
        storeSlug={store.slug}
        purchase={purchaseEvent}
      />
    </>
  );

  if (preview) {
    return (
      <PreviewAwareShell store={store}>
        <div lang={lang} dir={dir}>
          {inner}
        </div>
      </PreviewAwareShell>
    );
  }

  return (
    <div
      lang={lang}
      dir={dir}
      className="min-h-screen font-light antialiased"
      style={
        {
          "--store-primary": store.primaryColor,
          "--store-secondary": store.secondaryColor,
          "--store-font": getFontFamily(store.font),
          ...cta.cssVars,
          ...designTokensToCssVars(tokens),
          fontFamily: "var(--store-font)",
          fontWeight,
          backgroundColor: store.theme === "bold" ? "#0A0A0A" : store.secondaryColor,
          color: tokens.textColor,
        } as React.CSSProperties
      }
      data-theme={store.theme}
      data-template={template.id}
    >
      {inner}
    </div>
  );
}
