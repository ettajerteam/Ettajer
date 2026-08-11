/**
 * Heuristic Etsy SEO score (0-100), based on well-documented Etsy listing
 * best practices: title length, tag usage (max 13), description depth, and
 * image count (max 10). No external calls — pure scoring from listing fields.
 */

const ETSY_MAX_TAGS = 13;
const ETSY_MAX_TITLE_CHARS = 140;
const ETSY_MAX_IMAGES = 10;

export interface EtsySeoScoreInput {
  title: string;
  tags: string[];
  description: string;
  imageCount: number;
}

export interface EtsySeoScoreResult {
  score: number;
  breakdown: {
    titleScore: number;
    tagScore: number;
    descriptionScore: number;
    imageScore: number;
  };
  suggestions: string[];
}

function scoreTitleLength(title: string): { score: number; suggestion: string | null } {
  const len = title.trim().length;
  // Etsy search rewards fuller, keyword-rich titles; sweet spot ~100-140 chars.
  if (len === 0) return { score: 0, suggestion: "Add a title." };
  if (len < 40) {
    return {
      score: Math.round((len / 40) * 15),
      suggestion: "Title is short — add more descriptive keywords (aim for 100-140 characters).",
    };
  }
  if (len < 100) {
    return { score: 15 + Math.round(((len - 40) / 60) * 10), suggestion: null };
  }
  if (len <= ETSY_MAX_TITLE_CHARS) {
    return { score: 30, suggestion: null };
  }
  return { score: 25, suggestion: `Title exceeds Etsy's ${ETSY_MAX_TITLE_CHARS}-character limit.` };
}

function scoreTags(tags: string[]): { score: number; suggestion: string | null } {
  const count = Math.min(tags.length, ETSY_MAX_TAGS);
  const score = Math.round((count / ETSY_MAX_TAGS) * 30);
  const suggestion =
    tags.length < ETSY_MAX_TAGS
      ? `Using ${tags.length}/${ETSY_MAX_TAGS} tags — add more relevant keywords to improve search reach.`
      : null;
  return { score, suggestion };
}

function scoreDescription(description: string): { score: number; suggestion: string | null } {
  const len = description.trim().length;
  if (len === 0) return { score: 0, suggestion: "Add a product description." };
  if (len < 100) {
    return {
      score: Math.round((len / 100) * 10),
      suggestion: "Description is thin — expand with materials, dimensions, and use cases.",
    };
  }
  if (len < 200) {
    return { score: 10 + Math.round(((len - 100) / 100) * 10), suggestion: null };
  }
  return { score: 20, suggestion: null };
}

function scoreImages(imageCount: number): { score: number; suggestion: string | null } {
  const count = Math.min(imageCount, ETSY_MAX_IMAGES);
  const score = Math.round((count / ETSY_MAX_IMAGES) * 20);
  const suggestion =
    imageCount < 5
      ? `Only ${imageCount} image(s) — add more angles/lifestyle shots (Etsy allows up to ${ETSY_MAX_IMAGES}).`
      : null;
  return { score, suggestion };
}

export function computeEtsySeoScore(input: EtsySeoScoreInput): EtsySeoScoreResult {
  const title = scoreTitleLength(input.title);
  const tags = scoreTags(input.tags);
  const description = scoreDescription(input.description);
  const images = scoreImages(input.imageCount);

  const score = Math.max(
    0,
    Math.min(100, title.score + tags.score + description.score + images.score)
  );

  const suggestions = [title.suggestion, tags.suggestion, description.suggestion, images.suggestion].filter(
    (s): s is string => Boolean(s)
  );

  return {
    score,
    breakdown: {
      titleScore: title.score,
      tagScore: tags.score,
      descriptionScore: description.score,
      imageScore: images.score,
    },
    suggestions,
  };
}
