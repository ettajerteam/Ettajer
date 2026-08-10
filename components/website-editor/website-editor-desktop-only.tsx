"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ExternalLink, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorShellSkeleton } from "@/components/website-editor/editor-skeleton";
import { useIsPhone } from "@/hooks/use-is-phone";
import type { StorePageRow } from "@/lib/pages";
import type { NavItem } from "@/lib/navigation";
import type { StoreThemeData, PreviewPaths } from "@/types/theme";
import type { StoreThemeSourceLabel } from "@/lib/developer/theme-editor-bridge";

const WebsiteEditorClient = dynamic(
  () =>
    import("@/components/website-editor/website-editor-client").then(
      (m) => m.WebsiteEditorClient
    ),
  {
    ssr: false,
    loading: () => <EditorShellSkeleton />,
  }
);

interface WebsiteEditorDesktopOnlyProps {
  store: StoreThemeData;
  previewPaths: PreviewPaths;
  initialPages: StorePageRow[];
  productCount?: number;
  storeThemeId?: string;
  storeThemeName?: string;
  storeThemeSource?: StoreThemeSourceLabel;
  initialNavigation?: NavItem[];
}

/**
 * Website editor is desktop-only. Phones never mount the editor client.
 */
export function WebsiteEditorDesktopOnly({
  store,
  previewPaths,
  initialPages,
  productCount = 0,
  storeThemeId,
  storeThemeName,
  storeThemeSource,
  initialNavigation,
}: WebsiteEditorDesktopOnlyProps) {
  const isPhone = useIsPhone();

  if (isPhone === null) {
    return <EditorShellSkeleton />;
  }

  if (isPhone) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F2F2F7] px-6 py-12 text-center">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <Monitor className="h-7 w-7 text-[#007AFF]" />
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white">
            <Smartphone className="h-3.5 w-3.5" />
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Open the website editor on a computer
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
          Editing layouts needs a larger screen. On your phone you can still preview the live
          storefront or manage themes from the Themes hub — open the editor on a laptop or tablet
          to build and publish.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          <Button asChild className="h-12 rounded-xl bg-[#007AFF] hover:bg-[#0071EB]">
            <Link href="/dashboard/themes">Go to Themes</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl">
            <Link
              href={
                storeThemeId
                  ? `/store/${store.slug}?preview=true&previewThemeId=${storeThemeId}`
                  : `/store/${store.slug}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview storefront
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 rounded-xl">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <WebsiteEditorClient
      store={store}
      previewPaths={previewPaths}
      initialPages={initialPages}
      productCount={productCount}
      storeThemeId={storeThemeId}
      storeThemeName={storeThemeName}
      storeThemeSource={storeThemeSource}
      initialNavigation={initialNavigation}
    />
  );
}
