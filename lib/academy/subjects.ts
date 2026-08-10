/**
 * Ettajer Academy — subjects, journey modules, and lessons.
 * Code-seeded for v1; shaped for a future CMS.
 */

export type AcademyLesson = {
  slug: string;
  title: string;
  durationMin: number;
  summary: string;
  body: string[];
  resources?: { label: string; href: string }[];
};

export type AcademyModule = {
  slug: string;
  /** Display label, e.g. FOUNDATIONS */
  label: string;
  title: string;
  description: string;
  lessons: AcademyLesson[];
};

/** Distinct editorial presentation per subject on the Academy home */
export type AcademySubjectLayout =
  | "featured-dark"
  | "editorial"
  | "chapters"
  | "quiet";

export type AcademySubject = {
  slug: string;
  /** Short kicker, e.g. PLATFORM */
  kicker: string;
  title: string;
  /** Hero line(s) */
  headline: string;
  subheadline: string;
  description: string;
  /** Editorial accent — CSS color, no gradients */
  accent: string;
  layout: AcademySubjectLayout;
  topics: string[];
  modules: AcademyModule[];
};

export const ACADEMY_SUBJECTS: AcademySubject[] = [
  {
    slug: "platform",
    kicker: "Platform",
    title: "Ettajer Platform School",
    headline: "Master the tools\nbehind your store.",
    subheadline: "Store setup, products, themes, AI, and growth tools — taught the Ettajer way.",
    description:
      "Master the Ettajer platform from beginner to advanced.",
    accent: "#007AFF",
    layout: "featured-dark",
    topics: [
      "Store setup",
      "Products",
      "Themes",
      "AI Store Builder",
      "Domains",
      "Orders",
      "Analytics",
      "Marketing",
    ],
    modules: [
      {
        slug: "store-setup",
        label: "Foundations",
        title: "Store setup",
        description: "Identity, contact, and a live storefront link.",
        lessons: [
          {
            slug: "welcome-ettajer",
            title: "Welcome to Ettajer",
            durationMin: 4,
            summary: "What Ettajer is built for in Morocco.",
            body: [
              "Ettajer is built for Moroccan ecommerce — cash on delivery, WhatsApp-friendly stores, and a clean merchant dashboard.",
              "This school teaches the product itself: how to configure, sell, and grow without fighting the tools.",
              "Finish each lesson, mark it complete, then move forward. Locked modules unlock as you progress.",
            ],
            resources: [{ label: "Open dashboard", href: "/dashboard" }],
          },
          {
            slug: "store-identity",
            title: "Name, logo, and contact",
            durationMin: 6,
            summary: "Trust starts with a clear store identity.",
            body: [
              "Go to Settings → General and set your store name, logo, and contact details.",
              "Use a WhatsApp number customers can reach — it builds trust for COD buyers.",
              "Confirm currency (MAD) and language so checkout feels local.",
            ],
            resources: [
              { label: "General settings", href: "/dashboard/settings?tab=general" },
            ],
          },
          {
            slug: "share-store-link",
            title: "Share your store link",
            durationMin: 4,
            summary: "Start with your Ettajer URL.",
            body: [
              "Copy your storefront link and keep it handy for Instagram, WhatsApp, and ads.",
              "Custom domains come later — get traffic to a working store first.",
            ],
            resources: [{ label: "Domains", href: "/dashboard/domains" }],
          },
        ],
      },
      {
        slug: "products",
        label: "Catalog",
        title: "Products",
        description: "Add products that convert on mobile.",
        lessons: [
          {
            slug: "first-product",
            title: "Add your first product",
            durationMin: 8,
            summary: "One strong product beats a messy catalog.",
            body: [
              "Create one product with clear photos, price, and short copy.",
              "Match the language you already use on WhatsApp or Instagram.",
              "Publish only when the product page looks trustworthy on a phone.",
            ],
            resources: [{ label: "Products", href: "/dashboard/products" }],
          },
          {
            slug: "inventory-basics",
            title: "Inventory basics",
            durationMin: 5,
            summary: "Avoid overselling bestsellers.",
            body: [
              "Track stock for items you fulfill yourself.",
              "Use the inventory view to spot what needs restocking.",
            ],
            resources: [
              { label: "Inventory", href: "/dashboard/products/inventory" },
            ],
          },
        ],
      },
      {
        slug: "themes",
        label: "Design",
        title: "Themes",
        description: "Choose a clean theme and preview on mobile.",
        lessons: [
          {
            slug: "choose-theme",
            title: "Choose and preview a theme",
            durationMin: 7,
            summary: "Clarity over decoration.",
            body: [
              "Open Online Store → Themes and pick a layout that fits your catalog.",
              "Preview on mobile. Most shoppers browse on their phone.",
              "Publish when the homepage shows your best product clearly.",
            ],
            resources: [{ label: "Themes", href: "/dashboard/themes" }],
          },
        ],
      },
      {
        slug: "ai-builder",
        label: "AI",
        title: "AI Store Builder",
        description: "Use AI agents safely with Ettajer MCP.",
        lessons: [
          {
            slug: "ai-principles",
            title: "AI drafts. You publish.",
            durationMin: 5,
            summary: "Keep commerce on Ettajer.",
            body: [
              "AI helps with theme design and copy. Orders and checkout stay on Ettajer.",
              "Never let an agent publish until you’ve previewed.",
            ],
            resources: [
              { label: "Developer console", href: "/dashboard/developer" },
            ],
          },
          {
            slug: "connect-agent",
            title: "Connect an AI agent",
            durationMin: 8,
            summary: "OAuth app + MCP endpoint.",
            body: [
              "Create an OAuth app in Developers → Console for Claude or Cursor.",
              "Authorize your store, then ask the agent for tools/list.",
              "Start with drafts and previews — publish from the dashboard.",
            ],
            resources: [
              { label: "Developer help", href: "/dashboard/developer/help" },
            ],
          },
        ],
      },
      {
        slug: "domains",
        label: "Domains",
        title: "Domains",
        description: "Connect a custom domain when you’re ready.",
        lessons: [
          {
            slug: "custom-domain",
            title: "Connect a custom domain",
            durationMin: 6,
            summary: "Brand credibility for returning buyers.",
            body: [
              "Use Online Store → Domains and follow DNS instructions carefully.",
              "Wait for propagation before changing ads or bio links.",
            ],
            resources: [{ label: "Domains", href: "/dashboard/domains" }],
          },
        ],
      },
      {
        slug: "orders",
        label: "Ops",
        title: "Orders",
        description: "Confirm, fulfill, and stay organized.",
        lessons: [
          {
            slug: "order-workflow",
            title: "Order workflow",
            durationMin: 6,
            summary: "Status updates protect COD performance.",
            body: [
              "Confirm COD orders quickly — speed reduces cancellations.",
              "Update statuses in Ettajer so fulfillment stays clear.",
            ],
            resources: [{ label: "Orders", href: "/dashboard/orders" }],
          },
        ],
      },
      {
        slug: "analytics",
        label: "Insight",
        title: "Analytics",
        description: "Read traffic and conversion without vanity metrics.",
        lessons: [
          {
            slug: "read-reports",
            title: "Read your reports",
            durationMin: 5,
            summary: "Know what actually converts.",
            body: [
              "Use Analytics to see traffic, conversion, and top products.",
              "Pair numbers with what you hear on WhatsApp.",
            ],
            resources: [
              { label: "Reports", href: "/dashboard/analytics/reports" },
            ],
          },
        ],
      },
      {
        slug: "marketing",
        label: "Growth",
        title: "Marketing",
        description: "Pixels, discounts, and campaigns inside Ettajer.",
        lessons: [
          {
            slug: "marketing-hub",
            title: "Marketing hub overview",
            durationMin: 5,
            summary: "Connect pixels before scaling ads.",
            body: [
              "Open Marketing to connect Meta/TikTok and run discounts.",
              "Healthy events matter more than early ad spend.",
            ],
            resources: [{ label: "Marketing", href: "/dashboard/marketing" }],
          },
        ],
      },
    ],
  },
  {
    slug: "ecommerce",
    kicker: "Business",
    title: "Ecommerce",
    headline: "Build a business,\nnot just a store.",
    subheadline: "Fundamentals, offers, conversion, acquisition, and scale — beyond any single platform.",
    description: "Learn how to build and grow a real ecommerce business.",
    accent: "#1D1D1F",
    layout: "editorial",
    topics: [
      "Ecommerce fundamentals",
      "Product research",
      "Offers",
      "Pricing",
      "Store conversion",
      "Customer acquisition",
      "Retention",
      "Scaling",
    ],
    modules: [
      {
        slug: "fundamentals",
        label: "Foundations",
        title: "Ecommerce fundamentals",
        description: "How online stores actually make money.",
        lessons: [
          {
            slug: "unit-economics",
            title: "Unit economics basics",
            durationMin: 7,
            summary: "Profit after ads, shipping, and returns.",
            body: [
              "Revenue is not profit. Subtract product cost, shipping, ads, and returns.",
              "Know your break-even before you scale traffic.",
            ],
          },
          {
            slug: "customer-journey",
            title: "The customer journey",
            durationMin: 6,
            summary: "Awareness → trust → purchase → repeat.",
            body: [
              "Most buyers need multiple touches before they order COD.",
              "Design your store and messages for that journey — not one viral post.",
            ],
          },
        ],
      },
      {
        slug: "product-research",
        label: "Research",
        title: "Product research",
        description: "Find products people already want.",
        lessons: [
          {
            slug: "demand-signals",
            title: "Demand signals",
            durationMin: 8,
            summary: "Look for proof before you buy inventory.",
            body: [
              "Study what sells in your niche on Instagram, TikTok, and marketplaces.",
              "Prefer products with clear differentiation — not copies of everything.",
            ],
          },
        ],
      },
      {
        slug: "offers",
        label: "Offers",
        title: "Offers",
        description: "Price + promise + urgency without spam.",
        lessons: [
          {
            slug: "clear-offer",
            title: "Write a clear offer",
            durationMin: 6,
            summary: "One sentence a stranger understands.",
            body: [
              "State what they get, the price, and delivery expectation.",
              "One strong offer beats five confusing discounts.",
            ],
          },
        ],
      },
      {
        slug: "pricing",
        label: "Pricing",
        title: "Pricing",
        description: "Margins that survive ads and COD.",
        lessons: [
          {
            slug: "pricing-ladder",
            title: "Pricing with margin",
            durationMin: 6,
            summary: "Leave room for paid traffic.",
            body: [
              "Price for contribution margin after shipping and expected return rate.",
              "Test price on a small audience before locking creatives.",
            ],
          },
        ],
      },
      {
        slug: "conversion",
        label: "Conversion",
        title: "Store conversion",
        description: "Make the storefront do the selling.",
        lessons: [
          {
            slug: "mobile-conversion",
            title: "Mobile conversion checklist",
            durationMin: 7,
            summary: "Speed, clarity, trust.",
            body: [
              "Hero product, clear price, delivery info, and COD confidence above the fold.",
              "Remove sections that don’t help the shopper decide.",
            ],
          },
        ],
      },
      {
        slug: "acquisition",
        label: "Acquisition",
        title: "Customer acquisition",
        description: "Organic first, then paid.",
        lessons: [
          {
            slug: "organic-first",
            title: "Organic channels first",
            durationMin: 7,
            summary: "WhatsApp and Instagram before big ad budgets.",
            body: [
              "Your first orders usually come from people who already trust you.",
              "Document what messaging converts — that becomes ad creative later.",
            ],
          },
        ],
      },
      {
        slug: "retention",
        label: "Retention",
        title: "Retention",
        description: "Turn first orders into repeat buyers.",
        lessons: [
          {
            slug: "post-purchase",
            title: "Post-purchase habits",
            durationMin: 5,
            summary: "Fulfill fast. Ask for referrals.",
            body: [
              "Confirm and ship quickly. Follow up after delivery.",
              "Ask happy buyers for referrals and reviews.",
            ],
          },
        ],
      },
      {
        slug: "scaling",
        label: "Scale",
        title: "Scaling",
        description: "Grow what already works.",
        lessons: [
          {
            slug: "scale-what-works",
            title: "Scale what works",
            durationMin: 5,
            summary: "Don’t buy traffic for a broken offer.",
            body: [
              "Scale channels with proven conversion and healthy margins.",
              "Increase budget in steps and watch confirmation rates.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "dropshipping",
    kicker: "Model",
    title: "Dropshipping",
    headline: "Find.\nValidate.\nSell.\nScale.",
    subheadline: "Research, suppliers, store, creative, ads, fulfillment, and scale — one journey.",
    description: "Learn the complete dropshipping workflow.",
    accent: "#0A84FF",
    layout: "chapters",
    topics: [
      "Product research",
      "Supplier selection",
      "Product validation",
      "Importing",
      "Pricing",
      "Store setup",
      "Creative",
      "Advertising",
      "Fulfillment",
      "Scaling",
    ],
    modules: [
      {
        slug: "foundations",
        label: "Foundations",
        title: "Foundations",
        description: "How dropshipping works on Ettajer.",
        lessons: [
          {
            slug: "ds-mindset",
            title: "Dropshipping mindset",
            durationMin: 5,
            summary: "Ops and trust matter as much as ads.",
            body: [
              "You sell; a supplier ships. Your job is offer, creative, confirmation, and customer care.",
              "COD markets punish slow confirmation and weak creative.",
            ],
          },
          {
            slug: "ds-workflow",
            title: "The end-to-end workflow",
            durationMin: 6,
            summary: "From product idea to delivered order.",
            body: [
              "Research → validate → import → price → creative → ads → confirm → fulfill → scale.",
              "Skip steps and you pay in wasted ad spend.",
            ],
          },
        ],
      },
      {
        slug: "product-research",
        label: "Research",
        title: "Product research",
        description: "Find products worth testing.",
        lessons: [
          {
            slug: "ds-research",
            title: "Research winning angles",
            durationMin: 8,
            summary: "Problem, demo, and margin.",
            body: [
              "Look for products with a clear demo and emotional hook.",
              "Check shipping times and margins before you fall in love with a product.",
            ],
          },
        ],
      },
      {
        slug: "suppliers",
        label: "Suppliers",
        title: "Suppliers",
        description: "Select partners you can rely on.",
        lessons: [
          {
            slug: "supplier-selection",
            title: "Supplier selection",
            durationMin: 7,
            summary: "Reliability over lowest price.",
            body: [
              "Order samples when you can. Check packaging and quality.",
              "Prefer suppliers who communicate and ship consistently to Morocco.",
            ],
          },
        ],
      },
      {
        slug: "store-offer",
        label: "Store",
        title: "Store & offer",
        description: "Import, price, and present the offer.",
        lessons: [
          {
            slug: "import-product",
            title: "Import and present",
            durationMin: 7,
            summary: "Clean product pages convert.",
            body: [
              "Import products into Ettajer and rewrite titles for your market.",
              "Show price, delivery expectation, and COD clearly.",
            ],
            resources: [{ label: "Products", href: "/dashboard/products" }],
          },
        ],
      },
      {
        slug: "creative",
        label: "Creative",
        title: "Creative",
        description: "Hooks that stop the scroll.",
        lessons: [
          {
            slug: "ugc-hooks",
            title: "UGC-style hooks",
            durationMin: 8,
            summary: "First three seconds decide everything.",
            body: [
              "Show the product immediately. Talk benefits, not features.",
              "Test three hooks: problem, proof, price.",
            ],
          },
        ],
      },
      {
        slug: "advertising",
        label: "Ads",
        title: "Advertising",
        description: "Test small. Scale winners.",
        lessons: [
          {
            slug: "ads-tests",
            title: "Ad testing basics",
            durationMin: 8,
            summary: "Pixels, creative, simple structure.",
            body: [
              "Connect pixels in Marketing before conversion campaigns.",
              "Keep structure simple. Kill losers fast.",
            ],
            resources: [{ label: "Marketing", href: "/dashboard/marketing" }],
          },
        ],
      },
      {
        slug: "fulfillment",
        label: "Ops",
        title: "Fulfillment",
        description: "Confirm orders and protect ROAS.",
        lessons: [
          {
            slug: "cod-confirm",
            title: "COD confirmation",
            durationMin: 6,
            summary: "Confirmation is part of marketing.",
            body: [
              "Confirm quickly via call or WhatsApp.",
              "Update order status so you know real revenue.",
            ],
            resources: [{ label: "Orders", href: "/dashboard/orders" }],
          },
        ],
      },
      {
        slug: "scaling",
        label: "Scale",
        title: "Scaling",
        description: "Grow winners carefully.",
        lessons: [
          {
            slug: "ds-scale",
            title: "Scale carefully",
            durationMin: 5,
            summary: "Budget steps and creative refresh.",
            body: [
              "Increase budget in steps. Watch confirmation rates.",
              "Refresh creative before fatigue kills results.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "pod",
    kicker: "Model",
    title: "POD",
    headline: "Create something\npeople want to wear.",
    subheadline: "Niche, design, products, branding, store, marketing, and scale.",
    description: "Learn Print-on-Demand from idea to sales.",
    accent: "#636366",
    layout: "quiet",
    topics: [
      "Niche research",
      "Design",
      "Product selection",
      "Branding",
      "Store setup",
      "Marketing",
      "Scaling",
    ],
    modules: [
      {
        slug: "niche",
        label: "Niche",
        title: "Niche research",
        description: "Pick an audience you can speak to.",
        lessons: [
          {
            slug: "find-niche",
            title: "Find a focused niche",
            durationMin: 7,
            summary: "Specific audiences buy more.",
            body: [
              "Broad “t-shirts for everyone” rarely wins. Pick a community with shared identity.",
              "Validate interest with social groups and search demand.",
            ],
          },
        ],
      },
      {
        slug: "design",
        label: "Design",
        title: "Design",
        description: "Designs that read at thumbnail size.",
        lessons: [
          {
            slug: "design-clarity",
            title: "Design for clarity",
            durationMin: 6,
            summary: "Readable on mobile feeds.",
            body: [
              "Strong contrast and a simple idea beat busy artwork.",
              "Test designs as mockups before ordering samples.",
            ],
          },
        ],
      },
      {
        slug: "product-selection",
        label: "Products",
        title: "Product selection",
        description: "Choose blanks that fit your niche.",
        lessons: [
          {
            slug: "choose-blanks",
            title: "Choose the right blanks",
            durationMin: 5,
            summary: "Quality and margin.",
            body: [
              "Start with a few products. Expand after you have winners.",
              "Factor print quality and shipping time into the offer.",
            ],
          },
        ],
      },
      {
        slug: "branding",
        label: "Brand",
        title: "Branding",
        description: "A brand people remember.",
        lessons: [
          {
            slug: "brand-basics",
            title: "Brand basics",
            durationMin: 5,
            summary: "Name, voice, and visual consistency.",
            body: [
              "Consistent name, colors, and tone across store and socials.",
              "POD brands win on identity — not on product uniqueness alone.",
            ],
          },
        ],
      },
      {
        slug: "store-setup",
        label: "Store",
        title: "Store setup",
        description: "Present collections that convert.",
        lessons: [
          {
            slug: "pod-store",
            title: "Build the POD storefront",
            durationMin: 6,
            summary: "Collections and trust pages.",
            body: [
              "Group designs into collections. Feature bestsellers.",
              "Add clear shipping and return expectations.",
            ],
            resources: [{ label: "Themes", href: "/dashboard/themes" }],
          },
        ],
      },
      {
        slug: "marketing",
        label: "Marketing",
        title: "Marketing",
        description: "Content and ads for niche audiences.",
        lessons: [
          {
            slug: "pod-marketing",
            title: "Niche marketing",
            durationMin: 7,
            summary: "Speak their language.",
            body: [
              "Organic content in the niche builds trust before ads.",
              "Retarget engagers with your strongest designs.",
            ],
          },
        ],
      },
      {
        slug: "scaling",
        label: "Scale",
        title: "Scaling",
        description: "More designs, more channels.",
        lessons: [
          {
            slug: "pod-scale",
            title: "Scale POD carefully",
            durationMin: 5,
            summary: "Double down on winners.",
            body: [
              "Expand designs in niches that already convert.",
              "Don’t dilute the brand with random products.",
            ],
          },
        ],
      },
    ],
  },
];

export function getAcademySubject(slug: string): AcademySubject | undefined {
  return ACADEMY_SUBJECTS.find((s) => s.slug === slug);
}

export function getAllLessons(subject: AcademySubject): AcademyLesson[] {
  return subject.modules.flatMap((m) => m.lessons);
}

export function findLesson(
  subjectSlug: string,
  lessonSlug: string,
): {
  subject: AcademySubject;
  module: AcademyModule;
  lesson: AcademyLesson;
  lessonIndexInSubject: number;
  moduleIndex: number;
  lessonIndexInModule: number;
} | null {
  const subject = getAcademySubject(subjectSlug);
  if (!subject) return null;
  let lessonIndexInSubject = 0;
  for (let mi = 0; mi < subject.modules.length; mi++) {
    const mod = subject.modules[mi]!;
    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li]!;
      if (lesson.slug === lessonSlug) {
        return {
          subject,
          module: mod,
          lesson,
          lessonIndexInSubject,
          moduleIndex: mi,
          lessonIndexInModule: li,
        };
      }
      lessonIndexInSubject++;
    }
  }
  return null;
}

export function getAdjacentLessons(
  subjectSlug: string,
  lessonSlug: string,
): { prev: AcademyLesson | null; next: AcademyLesson | null } {
  const subject = getAcademySubject(subjectSlug);
  if (!subject) return { prev: null, next: null };
  const all = getAllLessons(subject);
  const i = all.findIndex((l) => l.slug === lessonSlug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? all[i - 1]! : null,
    next: i < all.length - 1 ? all[i + 1]! : null,
  };
}

export function lessonHref(subjectSlug: string, lessonSlug: string) {
  return `/dashboard/academy/${subjectSlug}/${lessonSlug}`;
}

export function subjectHref(subjectSlug: string) {
  return `/dashboard/academy/${subjectSlug}`;
}

export function countSubjectLessons(subject: AcademySubject): number {
  return getAllLessons(subject).length;
}

export type AcademySearchHit = {
  kind: "subject" | "lesson";
  href: string;
  title: string;
  subtitle: string;
};

export function buildAcademySearchIndex(): AcademySearchHit[] {
  const hits: AcademySearchHit[] = [];
  for (const subject of ACADEMY_SUBJECTS) {
    hits.push({
      kind: "subject",
      href: subjectHref(subject.slug),
      title: subject.title,
      subtitle: subject.description,
    });
    for (const mod of subject.modules) {
      for (const lesson of mod.lessons) {
        hits.push({
          kind: "lesson",
          href: lessonHref(subject.slug, lesson.slug),
          title: lesson.title,
          subtitle: `${subject.title} · ${mod.title}`,
        });
      }
    }
  }
  return hits;
}

export function searchAcademy(query: string, limit = 8): AcademySearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return buildAcademySearchIndex()
    .filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.subtitle.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

