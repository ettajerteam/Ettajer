/**
 * Builder V2 — style primitives.
 * Integrates with the shared style-system; adapters bridge V1 flat section settings.
 */

import type { ElementStyleValues } from "@/lib/builder/style-system";

export type BuilderAlignment = "left" | "center" | "right";

/**
 * Base style values at the element level.
 * Desktop defaults apply when no responsive override is set.
 */
export type BuilderStyle = ElementStyleValues & {
  alignment?: BuilderAlignment;
  /** Extensible for future CSS properties without schema changes */
  [key: string]: unknown;
};

/** Per-breakpoint style overrides including device visibility. */
export interface ResponsiveStyleValue extends BuilderStyle {
  visible?: boolean;
}

/**
 * Responsive style map — `desktop` is the base; tablet/mobile are overrides.
 */
export interface ResponsiveStyle {
  desktop?: ResponsiveStyleValue;
  tablet?: ResponsiveStyleValue;
  mobile?: ResponsiveStyleValue;
}
