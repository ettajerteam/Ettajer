import type { AtlasLocale } from "@/lib/email-marketing/atlas/types";
import {
  createStarterJourneyGraph,
  type EmailJourneyRow,
} from "@/lib/email-marketing/atlas/journeys";
import type { JourneyKind, JourneyTrigger } from "@/lib/email-marketing/atlas/types";

export type CopilotTone =
  | "luxury"
  | "friendly"
  | "professional"
  | "short"
  | "expand";

export interface GeneratedEmailCopy {
  subject: string;
  previewText: string;
  title: string;
  body: string;
  ctaLabel: string;
  promotionIdeas: string[];
}

export interface GeneratedFlowPack {
  businessSummary: string;
  flows: Array<{
    name: string;
    kind: JourneyKind;
    trigger: JourneyTrigger;
    rationale: string;
    nodes: ReturnType<typeof createStarterJourneyGraph>["nodes"];
    edges: ReturnType<typeof createStarterJourneyGraph>["edges"];
    settings: ReturnType<typeof createStarterJourneyGraph>["settings"];
  }>;
}

const TONE_HINTS: Record<CopilotTone, string> = {
  luxury: "refined, sparse, premium",
  friendly: "warm, conversational, approachable",
  professional: "clear, confident, concise",
  short: "as few words as possible",
  expand: "richer detail and storytelling",
};

/**
 * Rule-based AI copilot (production-safe without LLM keys).
 * When OPENAI_API_KEY is present, optionally enhance via fetch.
 */
export async function runEmailCopilot(input: {
  action:
    | "generate_subject"
    | "generate_email"
    | "improve"
    | "rewrite"
    | "translate"
    | "tone"
    | "shorten"
    | "expand"
    | "generate_cta"
    | "promotion_ideas";
  storeName: string;
  category?: string | null;
  locale?: AtlasLocale;
  tone?: CopilotTone;
  text?: string;
  targetLocale?: AtlasLocale;
}): Promise<{ result: string | GeneratedEmailCopy; source: "rules" | "llm" }> {
  const llm = await tryOpenAiCopilot(input);
  if (llm) return { result: llm, source: "llm" };

  const brand = input.storeName || "our store";
  const cat = input.category || "collection";
  const tone = input.tone || "professional";

  if (input.action === "generate_subject") {
    return {
      source: "rules",
      result: pick([
        `${brand}: something you'll love`,
        `New in ${cat} — just for you`,
        `A quiet note from ${brand}`,
        `Your next favorite from ${brand}`,
      ]),
    };
  }

  if (input.action === "generate_cta") {
    return {
      source: "rules",
      result: pick(["Shop now", "Discover more", "See the collection", "Claim yours"]),
    };
  }

  if (input.action === "promotion_ideas") {
    return {
      source: "rules",
      result: [
        "Early access for subscribers",
        "Free shipping weekend",
        "Bundle & save on bestsellers",
        "Loyalty double points day",
        "Limited drop with waitlist",
      ].join("\n"),
    };
  }

  if (input.action === "translate" && input.text) {
    return {
      source: "rules",
      result: translateHeuristic(input.text, input.targetLocale || "en"),
    };
  }

  if (
    (input.action === "improve" ||
      input.action === "rewrite" ||
      input.action === "tone" ||
      input.action === "shorten" ||
      input.action === "expand") &&
    input.text
  ) {
    return {
      source: "rules",
      result: rewriteHeuristic(input.text, input.action, tone),
    };
  }

  const copy: GeneratedEmailCopy = {
    subject: `${brand} — crafted for you`,
    previewText: `Discover ${cat} picks selected for your taste.`,
    title: "Made for moments that matter",
    body: `At ${brand}, we believe great ${cat} should feel effortless. Explore pieces chosen to match how you shop — and what you love next.`,
    ctaLabel: "Explore now",
    promotionIdeas: [
      "Subscriber-only preview",
      "Complimentary gift wrap",
      "Bundle the bestsellers",
    ],
  };
  return { source: "rules", result: applyToneToCopy(copy, tone) };
}

export async function generateAiFlowPack(input: {
  storeName: string;
  businessDescription: string;
  locale?: AtlasLocale;
}): Promise<GeneratedFlowPack> {
  const desc = input.businessDescription.trim() || "ecommerce store";
  const brand = input.storeName || "Store";

  const plans: Array<{
    name: string;
    kind: JourneyKind;
    trigger: JourneyTrigger;
    rationale: string;
  }> = [
    {
      name: "Welcome Series",
      kind: "welcome",
      trigger: "newsletter_signup",
      rationale: `Introduce ${brand} and convert new subscribers discovering: ${desc}`,
    },
    {
      name: "Abandoned Cart",
      kind: "cart_recovery",
      trigger: "cart_abandoned",
      rationale: "Recover intent with timely reminders and light incentives",
    },
    {
      name: "Win Back",
      kind: "win_back",
      trigger: "manual_entry",
      rationale: "Re-engage inactive buyers before churn risk rises",
    },
    {
      name: "Post Purchase",
      kind: "post_purchase",
      trigger: "any_purchase",
      rationale: "Reinforce trust and seed cross-sell / review prompts",
    },
    {
      name: "VIP Journey",
      kind: "vip",
      trigger: "manual_entry",
      rationale: "Reward high-value customers with exclusivity",
    },
  ];

  return {
    businessSummary: desc,
    flows: plans.map((p) => {
      const graph = createStarterJourneyGraph({
        kind: p.kind,
        trigger: p.trigger,
        storeName: brand,
      });
      // Personalize first email body with business description
      const emailNode = graph.nodes.find((n) => n.type === "email");
      if (emailNode) {
        emailNode.config.body = `${emailNode.config.body}\n\nInspired by your world: ${desc}`;
      }
      return {
        name: p.name,
        kind: p.kind,
        trigger: p.trigger,
        rationale: p.rationale,
        ...graph,
      };
    }),
  };
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function applyToneToCopy(
  copy: GeneratedEmailCopy,
  tone: CopilotTone
): GeneratedEmailCopy {
  if (tone === "luxury") {
    return {
      ...copy,
      subject: copy.subject.replace(/!/g, ""),
      body: `${copy.body}\n\nQuiet luxury. Considered details.`,
      ctaLabel: "Discover",
    };
  }
  if (tone === "friendly") {
    return {
      ...copy,
      subject: `Hey — ${copy.subject}`,
      body: `${copy.body}\n\nWe're glad you're here.`,
      ctaLabel: "Take a look",
    };
  }
  if (tone === "short") {
    return {
      ...copy,
      body: copy.body.split(".")[0] + ".",
      previewText: copy.previewText.split(".")[0] + ".",
    };
  }
  if (tone === "expand") {
    return {
      ...copy,
      body: `${copy.body}\n\nEvery piece is chosen with care — materials, fit, and finish — so your next order feels inevitable.`,
    };
  }
  return copy;
}

function rewriteHeuristic(
  text: string,
  action: string,
  tone: CopilotTone
): string {
  let out = text.trim();
  if (action === "shorten") {
    out = out.split(/[.!?]/).slice(0, 2).join(". ").trim();
    if (out && !/[.!?]$/.test(out)) out += ".";
  }
  if (action === "expand") {
    out = `${out}\n\nHere's why it matters: clarity, craft, and a smoother path to checkout.`;
  }
  if (action === "tone" || action === "rewrite" || action === "improve") {
    out = `${out}\n\n(${TONE_HINTS[tone]})`;
  }
  return out;
}

function translateHeuristic(text: string, locale: AtlasLocale): string {
  // Lightweight marker — production LLM path used when key present
  const prefix =
    locale === "fr"
      ? "[FR] "
      : locale === "ar"
        ? "[AR] "
        : locale === "es"
          ? "[ES] "
          : "";
  return `${prefix}${text}`;
}

async function tryOpenAiCopilot(input: {
  action: string;
  storeName: string;
  category?: string | null;
  text?: string;
  tone?: CopilotTone;
  targetLocale?: AtlasLocale;
}): Promise<string | GeneratedEmailCopy | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  try {
    const prompt = `You are an ecommerce email copywriter for ${input.storeName}.
Action: ${input.action}
Tone: ${input.tone || "professional"}
Category: ${input.category || "general"}
Locale: ${input.targetLocale || "en"}
Text: ${input.text || "(generate fresh)"}
Return concise marketing copy. If generating a full email, return JSON with keys subject, previewText, title, body, ctaLabel, promotionIdeas (array).`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        messages: [
          { role: "system", content: "Return only the requested copy." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    if (input.action === "generate_email") {
      try {
        return JSON.parse(content) as GeneratedEmailCopy;
      } catch {
        return content;
      }
    }
    return content;
  } catch {
    return null;
  }
}

export type { EmailJourneyRow };
