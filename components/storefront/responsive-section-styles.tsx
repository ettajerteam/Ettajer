import { buildResponsiveCss } from "@/lib/builder/responsive-styles";

interface ResponsiveSectionStylesProps {
  sectionId: string;
  settings: Record<string, unknown>;
}

export function ResponsiveSectionStyles({ sectionId, settings }: ResponsiveSectionStylesProps) {
  const css = buildResponsiveCss(sectionId, settings);
  if (!css) return null;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
