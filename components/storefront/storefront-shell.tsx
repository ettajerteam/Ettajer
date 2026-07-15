import type { PublicStore } from "@/types/storefront";
import { Suspense } from "react";
import { getFontFamily } from "@/lib/storefront";
import { getThemeTemplate } from "@/lib/themes";
import { StorefrontCartProvider } from "@/components/storefront/cart/storefront-cart-provider";
import { MarketingPixels } from "@/components/storefront/marketing-pixels";
import { UtmCapture } from "@/components/storefront/utm-capture";

interface StorefrontShellProps {
  store: PublicStore;
  children: React.ReactNode;
  preview?: boolean;
  purchaseEvent?: {
    value: number;
    currency: string;
    orderNumber: string;
  };
}

export function StorefrontShell({ store, children, preview, purchaseEvent }: StorefrontShellProps) {
  const template = getThemeTemplate(store.theme);

  return (
    <div
      className="min-h-screen"
      style={
        {
          "--store-primary": store.primaryColor,
          "--store-secondary": store.secondaryColor,
          "--store-font": getFontFamily(store.font),
          fontFamily: "var(--store-font)",
          backgroundColor: store.theme === "bold" ? "#0A0A0A" : store.secondaryColor,
          color: store.theme === "bold" ? "#FFFFFF" : "#1A1A1A",
        } as React.CSSProperties
      }
      data-theme={store.theme}
      data-template={template.id}
    >
      {preview && (
        <div className="sticky top-0 z-50 bg-[#007AFF] text-white text-center text-xs py-1.5 font-medium">
          Preview Mode — This is how your store looks to customers
        </div>
      )}
      <StorefrontCartProvider store={store}>{children}</StorefrontCartProvider>
      <Suspense fallback={null}>
        <UtmCapture />
      </Suspense>
      <MarketingPixels marketing={store.marketing} purchase={purchaseEvent} />
    </div>
  );
}
