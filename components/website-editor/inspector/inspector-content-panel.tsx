"use client";

import { useId } from "react";
import type { InspectorElementFocus, InspectorProfile } from "@/lib/builder/inspector-config";
import type { SectionType } from "@/lib/sections/types";
import {
  InspectorFieldGroup,
  InspectorMediaField,
  InspectorTextField,
  InspectorTextareaField,
} from "./inspector-fields";
import { InspectorRichTextField } from "./inspector-rich-text-field";

interface InspectorContentPanelProps {
  sectionType: SectionType;
  profile: InspectorProfile;
  focus: InspectorElementFocus;
  settings: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
  /** When true, show every content group (ignore edit-focus filter). */
  showAll?: boolean;
}

export function InspectorContentPanel({
  sectionType,
  profile,
  focus,
  settings,
  onChange,
  showAll = false,
}: InspectorContentPanelProps) {
  const idPrefix = useId().replace(/:/g, "");
  const fid = (name: string) => `${idPrefix}-${name}`;

  const showText =
    profile.contentGroups.includes("text") &&
    (showAll || focus === "text" || focus === "section");
  const showImages =
    profile.contentGroups.includes("images") &&
    (showAll || focus === "image" || focus === "section");
  const showButtons =
    profile.contentGroups.includes("buttons") &&
    (showAll || focus === "button" || focus === "section");
  const showLinks =
    profile.contentGroups.includes("links") &&
    (showAll || focus === "link" || focus === "section");

  const textFields = (() => {
    if (!showText) return null;

    if (sectionType === "hero") {
      return (
        <InspectorFieldGroup title="Text">
          <InspectorTextField
            id={fid("hero-headline")}
            label="Headline"
            value={(settings.headline as string) ?? ""}
            placeholder="Uses store name if empty"
            onChange={(v) => onChange({ headline: v })}
          />
          <InspectorTextareaField
            id={fid("hero-sub")}
            label="Subtitle"
            value={(settings.subheadline as string) ?? ""}
            placeholder="Uses store description if empty"
            rows={2}
            onChange={(v) => onChange({ subheadline: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "rich-text") {
      return (
        <InspectorFieldGroup title="Text">
          <InspectorTextField
            id={fid("rt-title")}
            label="Title"
            value={(settings.title as string) ?? ""}
            onChange={(v) => onChange({ title: v })}
          />
          <InspectorRichTextField
            id={fid("rt-content")}
            label="Content"
            value={(settings.content as string) ?? ""}
            placeholder="Write your story here…"
            description="Write normally — use Bold for emphasis. No HTML needed."
            onChange={(v) => onChange({ content: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "featured-collections") {
      return (
        <InspectorFieldGroup title="Text">
          <InspectorTextField
            id={fid("section-title")}
            label="Title"
            value={(settings.title as string) ?? ""}
            onChange={(v) => onChange({ title: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "product-grid") {
      return (
        <InspectorFieldGroup title="Text">
          <InspectorTextField
            id={fid("section-title")}
            label="Title"
            value={(settings.title as string) ?? ""}
            onChange={(v) => onChange({ title: v })}
          />
        </InspectorFieldGroup>
      );
    }

    if (sectionType === "footer") {
      return (
        <InspectorFieldGroup title="Footer">
          <p className="text-xs text-neutral-500">
            Shows your store copyright. Powered by Ettajer is included by default.
          </p>
        </InspectorFieldGroup>
      );
    }

    return null;
  })();

  const imageFields = showImages ? (
    <InspectorFieldGroup title="Image">
      <InspectorMediaField
        id={fid("hero-image-url")}
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
    <InspectorFieldGroup title="Button">
      <InspectorTextField
        id={fid("hero-cta")}
        label="Button text"
        value={(settings.ctaText as string) ?? ""}
        placeholder="Shop now"
        onChange={(v) => onChange({ ctaText: v })}
      />
      {showLinks || showAll ? (
        <InspectorTextField
          id={fid("hero-cta-link")}
          label="Button link"
          value={(settings.ctaLink as string) ?? ""}
          placeholder="/products or https://..."
          onChange={(v) => onChange({ ctaLink: v })}
        />
      ) : null}
    </InspectorFieldGroup>
  ) : null;

  const linkFields =
    showLinks && !showButtons ? (
      <InspectorFieldGroup title="Link">
        <InspectorTextField
          id={fid("hero-cta-link")}
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
        This section has no editable text or images. Try Style or More.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {textFields}
      {imageFields}
      {buttonFields}
      {linkFields}
    </div>
  );
}
