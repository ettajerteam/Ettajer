"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getFontFamily } from "@/lib/storefront-fonts";
import { getThemeTemplate } from "@/lib/themes";
import {
  designTokensToCssVars,
  resolveDesignTokens,
} from "@/lib/design-tokens";
import type { PublicStore } from "@/types/storefront";
import type { NavItem } from "@/lib/navigation";
import { isTrustedBridgeEvent } from "@/lib/builder/events";

interface PreviewAwareShellProps {
  store: PublicStore;
  children: ReactNode;
}

/**
 * Live-updates storefront chrome (CSS vars, theme, navigation) via postMessage
 * so the editor can change theme/nav without remounting the preview iframe.
 */
export function PreviewAwareShell({ store, children }: PreviewAwareShellProps) {
  const [live, setLive] = useState(store);

  useEffect(() => {
    setLive(store);
  }, [store]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedBridgeEvent(event)) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "ettajer:preview-theme" && data.theme && typeof data.theme === "object") {
        const theme = data.theme as Partial<PublicStore>;
        setLive((prev) => ({
          ...prev,
          ...(typeof theme.theme === "string" ? { theme: theme.theme } : null),
          ...(typeof theme.primaryColor === "string"
            ? { primaryColor: theme.primaryColor }
            : null),
          ...(typeof theme.secondaryColor === "string"
            ? { secondaryColor: theme.secondaryColor }
            : null),
          ...(typeof theme.font === "string" ? { font: theme.font } : null),
          ...(theme.logo !== undefined ? { logo: theme.logo as string | null } : null),
          ...(typeof theme.textColor === "string" ? { textColor: theme.textColor } : null),
          ...(typeof theme.mutedColor === "string" ? { mutedColor: theme.mutedColor } : null),
          ...(typeof theme.borderColor === "string" ? { borderColor: theme.borderColor } : null),
          ...(typeof theme.buttonRadius === "string"
            ? { buttonRadius: theme.buttonRadius }
            : null),
        }));
        return;
      }

      if (data.type === "ettajer:preview-navigation" && Array.isArray(data.navigation)) {
        setLive((prev) => ({
          ...prev,
          navigation: data.navigation as NavItem[],
        }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const template = getThemeTemplate(live.theme);
  const tokens = resolveDesignTokens(live.theme, {
    textColor: live.textColor,
    mutedColor: live.mutedColor,
    borderColor: live.borderColor,
    buttonRadius: live.buttonRadius,
  });

  return (
    <div
      className="min-h-screen"
      style={
        {
          "--store-primary": live.primaryColor,
          "--store-secondary": live.secondaryColor,
          "--store-font": getFontFamily(live.font),
          ...designTokensToCssVars(tokens),
          fontFamily: "var(--store-font)",
          backgroundColor: live.theme === "bold" ? "#0A0A0A" : live.secondaryColor,
          color: tokens.textColor,
        } as React.CSSProperties
      }
      data-theme={live.theme}
      data-template={template.id}
      data-preview-live-shell=""
    >
      {children}
    </div>
  );
}
