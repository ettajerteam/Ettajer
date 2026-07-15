"use client";

import type { InspectorElementFocus, InspectorProfile } from "@/lib/builder/inspector-config";
import type { SectionType } from "@/lib/sections/types";
import {
  InspectorFieldGroup,
  InspectorMediaField,
  InspectorTextField,
  InspectorTextareaField,
} from "./inspector-fields";

interface InspectorContentPanelProps {
  sectionType: SectionType;
  profile: InspectorProfile;
  focus: InspectorElementFocus;
  settings: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
}

export function InspectorContentPanel({
  sectionType,
  profile,
  focus,
  settings,
  onChange,
}: InspectorContentPanelProps) {
  const showText = profile.contentGroups.includes("text") && (focus === "text" || focus === "section");
  const showImages = profile.contentGroups.includes("images") && (focus === "image" || focus === "section");
  const showButtons = profile.contentGroups.includes("buttons") && focus === "button";
  const showLinks = profile.contentGroups.includes("links") && focus === "link";

  const textFields = (() => {
    if (!showText) return null;

    if (sectionType === "hero") {
      return (
        <InspectorFieldGroup title="Headline & intro" description="Main message visitors see first" emphasized>
          <InspectorTextField
            id="hero-headline"
            label="Headline"
            value={(settings.headline as string) ?? ""}
            placeholder="Uses store name if empty"
            onChange={(v) => onChange({ headline: v })}
          />
          <InspectorTextareaField
            id="hero-sub"
            label="Subheadline"
            value={(settings.subheadline as string) ?? ""}
            placeholder="Uses store description if empty"
            rows={3}
            onChange={(v) => onChange({ subheadline: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "rich-text") {
      return (
        <InspectorFieldGroup title="Text content" emphasized>
          <InspectorTextField
            id="rt-title"
            label="Title"
            value={(settings.title as string) ?? ""}
            onChange={(v) => onChange({ title: v })}
          />
          <InspectorTextareaField
            id="rt-content"
            label="Content"
            value={(settings.content as string) ?? ""}
            rows={6}
            onChange={(v) => onChange({ content: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "featured-collections" || sectionType === "product-grid") {
      return (
        <InspectorFieldGroup title="Section title">
          <InspectorTextField
            id="section-title"
            label="Title"
            value={(settings.title as string) ?? ""}
            onChange={(v) => onChange({ title: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "footer") {
      return (
        <InspectorFieldGroup title="Footer content">
          <p className="text-xs text-neutral-500">
            Footer shows your store copyright. Powered by Ettajer line is included by default.
          </p>
        </InspectorFieldGroup>
      );
    }

    return null;
  })();

  const imageFields = showImages ? (
    <InspectorFieldGroup
      title={sectionType === "hero" ? "Hero image" : "Image"}
      description={
        sectionType === "hero"
          ? "Override the default theme hero image"
          : "Choose an image from your media library"
      }
      emphasized
    >
      <InspectorMediaField
        id="hero-image-url"
        label={sectionType === "hero" ? "Hero image" : "Image"}
        value={(settings.imageUrl as string) ?? ""}
        altValue={
          sectionType === "hero"
            ? ((settings.imageAlt as string) ?? "")
            : ((settings.alt as string) ?? "")
        }
        onChange={(url) => onChange({ imageUrl: url })}
        onAltChange={(alt) =>
          onChange(
            sectionType === "hero" ? { imageAlt: alt || undefined } : { alt: alt || undefined }
          )
        }
        kind="image"
      />
    </InspectorFieldGroup>
  ) : null;

  const buttonFields = showButtons ? (
    <InspectorFieldGroup title="Call to action" description="Primary button below the headline" emphasized>
      <InspectorTextField
        id="hero-cta"
        label="Button text"
        value={(settings.ctaText as string) ?? ""}
        placeholder="Shop now"
        onChange={(v) => onChange({ ctaText: v })}
      />
    </InspectorFieldGroup>
  ) : null;

  const linkFields = showLinks ? (
    <InspectorFieldGroup title="Button link" description="Where the CTA button navigates" emphasized>
      <InspectorTextField
        id="hero-cta-link"
        label="Link URL"
        value={(settings.ctaLink as string) ?? ""}
        placeholder="/collections or https://..."
        onChange={(v) => onChange({ ctaLink: v })}
      />
    </InspectorFieldGroup>
  ) : null;

  const hasContent = textFields || imageFields || buttonFields || linkFields;

  if (!hasContent) {
    return (
      <p className="text-sm text-neutral-500">
        No content fields for this focus. Try another element tab above.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {textFields}
      {imageFields}
      {buttonFields}
      {linkFields}
    </div>
  );
}
