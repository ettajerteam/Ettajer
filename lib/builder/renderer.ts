/**
 * Builder Renderer — registry-driven section rendering.
 *
 * UI components live in `components/builder/`; resolution logic lives here.
 * V1 `section-renderer.tsx` delegates to `RegistryBlockRenderer`.
 */

export { resolveSectionBlock, getSectionTypeLabel } from "./resolve-block";
export type { ResolvedSectionBlock } from "./resolve-block";

export { RegistryBlockRenderer } from "@/components/builder/registry-block-renderer";
export type { RegistryBlockRendererProps } from "@/components/builder/registry-block-renderer";
export { BlockRenderErrorBoundary } from "@/components/builder/block-render-error-boundary";
export { UnknownBlockPlaceholder } from "@/components/builder/block-placeholder";
