import type { BlockDefinition } from "../types";
import {
  BASIC_BACKGROUND_STYLE,
  BASIC_SPACING_STYLES,
  STANDARD_ADVANCED_FIELDS,
  TITLE_CONTENT_FIELD,
} from "./shared-schemas";

export const videoBlock: Omit<BlockDefinition, "component"> = {
  id: "video",
  category: "media",
  name: "Video",
  description: "Embed YouTube, Vimeo, or MP4",
  icon: "video",
  legacySectionType: "video",
  implemented: true,
  thumbnail: { type: "gradient", value: "from-red-50 to-rose-100" },
  defaultContent: {
    title: "",
    videoSource: "url",
    videoUrl: "",
    aspectRatio: "16/9",
  },
  defaultStyles: {
    desktop: {
      padding: "2.5rem 1.5rem",
    },
  },
  settingsSchema: {
    focuses: ["section", "text", "image"],
    content: [
      TITLE_CONTENT_FIELD,
      {
        key: "videoSource",
        type: "select",
        label: "Video source",
        group: "links",
        focus: "section",
        options: [
          { value: "url", label: "YouTube / Vimeo URL" },
          { value: "file", label: "Uploaded video file" },
        ],
      },
      {
        key: "videoUrl",
        type: "url",
        label: "Embed URL",
        group: "links",
        focus: ["section", "link"],
        placeholder: "https://www.youtube.com/watch?v=…",
        description: "Paste a YouTube or Vimeo link",
        showWhen: { key: "videoSource", equals: "url" },
      },
      {
        key: "videoUrl",
        type: "media",
        label: "Video file",
        group: "images",
        focus: ["image", "section"],
        description: "Choose an MP4 / WebM from your media library",
        mediaKind: "video",
        showWhen: { key: "videoSource", equals: "file" },
      },
      {
        key: "posterUrl",
        type: "media",
        label: "Poster image (file videos)",
        group: "images",
        focus: ["image", "section"],
        showWhen: { key: "videoSource", equals: "file" },
      },
      {
        key: "aspectRatio",
        type: "select",
        label: "Aspect ratio",
        group: "layout",
        focus: "section",
        tab: "layout",
        options: [
          { value: "16/9", label: "16:9" },
          { value: "4/3", label: "4:3" },
          { value: "1/1", label: "1:1" },
          { value: "9/16", label: "9:16" },
        ],
      },
    ],
    styles: [BASIC_BACKGROUND_STYLE],
    layout: BASIC_SPACING_STYLES,
    advanced: STANDARD_ADVANCED_FIELDS,
  },
};
