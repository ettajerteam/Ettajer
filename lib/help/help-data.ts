import {
  Rocket,
  Layout,
  Truck,
  Globe,
  CreditCard,
  Megaphone,
  UserCircle,
  ArrowLeftRight,
  Package,
  BarChart3,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HelpArticle = {
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string;
  body: string[];
  popular?: boolean;
  keywords?: string[];
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Launch your store and publish your first products.",
    icon: Rocket,
  },
  {
    id: "catalog",
    title: "Catalog",
    description: "Products, collections, categories, and inventory.",
    icon: Package,
  },
  {
    id: "store-builder",
    title: "Store builder",
    description: "Design pages, sections, and your brand look.",
    icon: Layout,
  },
  {
    id: "orders-cod",
    title: "Orders & COD",
    description: "Checkout, verification, and fulfillment.",
    icon: Truck,
  },
  {
    id: "domains-hosting",
    title: "Domains & hosting",
    description: "Custom domains, SSL, and performance.",
    icon: Globe,
  },
  {
    id: "billing",
    title: "Billing & plans",
    description: "Subscriptions, trials, and invoices.",
    icon: CreditCard,
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Pixels, campaigns, and ad platforms.",
    icon: Megaphone,
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Traffic, conversion, and reports.",
    icon: BarChart3,
  },
  {
    id: "account",
    title: "Account",
    description: "Login, team access, and security.",
    icon: UserCircle,
  },
  {
    id: "migration",
    title: "Migration",
    description: "Move from Shopify, WooCommerce, and more.",
    icon: ArrowLeftRight,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Fix common issues quickly.",
    icon: Wrench,
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  // Getting started
  {
    slug: "how-long-does-setup-take",
    title: "How long does setup take?",
    excerpt: "Most merchants launch in under five minutes with the visual builder.",
    categoryId: "getting-started",
    popular: true,
    keywords: ["setup", "launch", "start", "onboarding"],
    body: [
      "Ettajer is built for speed. After you sign up, pick a template and start editing visually — no code required.",
      "Most merchants publish their first storefront in under five minutes. Product import, COD checkout, and domain connection can be added right after launch.",
      "If you need a hand, our support team can walk you through your first publish.",
    ],
  },
  {
    slug: "create-your-first-product",
    title: "Create your first product",
    excerpt: "Add photos, pricing, variants, and inventory in the dashboard.",
    categoryId: "getting-started",
    popular: true,
    keywords: ["product", "add", "catalog", "photo"],
    body: [
      "Go to Dashboard → Products → Add product. Upload images, set your price, and add variants like size or color if needed.",
      "Products appear on your storefront as soon as they are published. Draft products stay hidden until you are ready.",
      "Use collections and categories to organize your catalog for buyers browsing on mobile.",
    ],
  },
  {
    slug: "publish-your-storefront",
    title: "Publish your storefront",
    excerpt: "Make your store live and share your store URL with customers.",
    categoryId: "getting-started",
    keywords: ["publish", "live", "launch", "url"],
    body: [
      "Open Themes in your dashboard, customize your homepage in the visual editor, then click Publish.",
      "Your store gets a default Ettajer URL immediately. You can connect a custom domain anytime from Settings.",
      "After publishing, test checkout on your phone — most Moroccan buyers shop on mobile.",
    ],
  },
  // Catalog
  {
    slug: "collections-vs-categories",
    title: "Collections vs categories",
    excerpt: "When to use each and how they appear on your storefront.",
    categoryId: "catalog",
    popular: true,
    keywords: ["collection", "category", "organize"],
    body: [
      "Categories classify products by type (e.g. Shoes, Accessories). Collections are curated groups you build for campaigns (e.g. Summer Sale, Best Sellers).",
      "Manage categories from Dashboard → Categories and collections from Dashboard → Collections.",
      "Both appear in navigation and product grids. Use collections for merchandising and categories for browse structure.",
    ],
  },
  {
    slug: "manage-product-inventory",
    title: "Manage product inventory",
    excerpt: "Track stock levels and avoid overselling.",
    categoryId: "catalog",
    keywords: ["inventory", "stock", "quantity"],
    body: [
      "Open Dashboard → Products → Inventory to see stock across all variants.",
      "Set quantity per variant when editing a product. When stock hits zero, buyers see out-of-stock on the storefront.",
      "Update inventory after receiving new shipments or processing returns.",
    ],
  },
  {
    slug: "import-products-csv",
    title: "Import products via CSV",
    excerpt: "Bulk upload your catalog from a spreadsheet.",
    categoryId: "catalog",
    keywords: ["import", "csv", "bulk", "upload"],
    body: [
      "Export or build a CSV with columns for title, price, description, images, and variants.",
      "Go to Dashboard → Products → Import, upload your file, and map columns to Ettajer fields.",
      "Review the preview before confirming. Large imports may take a few minutes.",
    ],
  },
  {
    slug: "product-images-best-practices",
    title: "Product images best practices",
    excerpt: "Photos that convert on mobile in Morocco.",
    categoryId: "catalog",
    keywords: ["images", "photos", "product"],
    body: [
      "Use square or 4:5 images at least 1200px wide. Bright, natural lighting works best for lifestyle products.",
      "Show the product alone and in context. First image is the thumbnail everywhere — make it clear and uncluttered.",
      "Ettajer optimizes images automatically for fast loading on mobile networks.",
    ],
  },
  // Store builder
  {
    slug: "use-the-visual-builder",
    title: "Use the visual builder",
    excerpt: "Drag sections, edit text inline, and preview changes live.",
    categoryId: "store-builder",
    popular: true,
    keywords: ["builder", "editor", "theme", "design"],
    body: [
      "Open Themes → Customize to enter the visual builder. Click any section to edit content, images, or layout.",
      "Add new blocks from the left panel — hero banners, product grids, testimonials, and more.",
      "Changes save as drafts until you publish. Preview on desktop and mobile before going live.",
    ],
  },
  {
    slug: "add-and-arrange-sections",
    title: "Add and arrange sections",
    excerpt: "Build your homepage with drag-and-drop blocks.",
    categoryId: "store-builder",
    keywords: ["sections", "blocks", "layout"],
    body: [
      "In the theme editor, open the Add panel on the left. Pick a block type and drop it where you want it on the page.",
      "Drag sections to reorder. Click a section to edit its content in the right panel.",
      "Delete sections you do not need — less clutter improves conversion on mobile.",
    ],
  },
  {
    slug: "customize-brand-colors-and-fonts",
    title: "Customize brand colors and fonts",
    excerpt: "Match your logo and keep your storefront consistent.",
    categoryId: "store-builder",
    keywords: ["colors", "fonts", "brand", "style"],
    body: [
      "In the theme editor, open Global styles to set primary colors, backgrounds, and typography.",
      "Colors apply across buttons, headings, and accents automatically.",
      "For best results, use two brand colors and one neutral — minimal palettes convert better on mobile.",
    ],
  },
  {
    slug: "preview-mobile-storefront",
    title: "Preview your store on mobile",
    excerpt: "Most buyers in Morocco shop on phones — always check mobile view.",
    categoryId: "store-builder",
    keywords: ["mobile", "preview", "responsive"],
    body: [
      "In the theme editor, switch to mobile preview using the device toggle at the top.",
      "Check that text is readable, buttons are tappable, and product images load quickly.",
      "Publish only after mobile looks right — it drives the majority of COD orders.",
    ],
  },
  {
    slug: "save-draft-vs-publish",
    title: "Save draft vs publish",
    excerpt: "Understand when changes go live on your storefront.",
    categoryId: "store-builder",
    keywords: ["draft", "publish", "save"],
    body: [
      "Edits in the builder are saved as drafts automatically. Your live storefront does not change until you click Publish.",
      "Use Save draft when experimenting. Publish when you are ready for customers to see updates.",
      "You can revert by republishing a previous version from Themes if needed.",
    ],
  },
  // Orders & COD
  {
    slug: "how-cod-checkout-works",
    title: "How COD checkout works",
    excerpt: "Cash on delivery is built in — no payment gateway required.",
    categoryId: "orders-cod",
    popular: true,
    keywords: ["cod", "cash", "delivery", "checkout"],
    body: [
      "Ettajer includes native Cash on Delivery checkout. Buyers enter name, phone, city, and address — no card required.",
      "Enable COD in Settings → Payments. Customize the COD message, minimum order, and checkout note under Settings → Checkout.",
      "Orders appear in Dashboard → Orders with full customer details ready for your courier.",
    ],
  },
  {
    slug: "set-up-whatsapp-cod-verification",
    title: "Set up WhatsApp COD verification",
    excerpt: "Confirm orders before you ship to cut fake deliveries.",
    categoryId: "orders-cod",
    popular: true,
    keywords: ["whatsapp", "sms", "verification", "cod"],
    body: [
      "Enable Cash on Delivery in Settings → Payments so shoppers can order without a card.",
      "Add your WhatsApp number in Settings → Storefront contact so customers can reach you from the shop footer.",
      "After an order arrives in Dashboard → Orders, confirm details with the customer on WhatsApp or phone before you pack and hand off to your courier.",
    ],
  },
  {
    slug: "reduce-fake-cod-orders",
    title: "Reduce fake COD orders",
    excerpt: "Confirm buyers before you ship.",
    categoryId: "orders-cod",
    popular: true,
    keywords: ["fake", "fraud", "cod", "verification"],
    body: [
      "Fake COD orders are a common problem in Morocco. Confirm name, phone, and address before you dispatch.",
      "Enable COD in Settings → Payments, then review every new order in Dashboard → Orders and reach out on WhatsApp when something looks off.",
      "Merchants typically see fewer returned or refused deliveries after confirming buyers before shipping.",
    ],
  },
  {
    slug: "cod-address-fields-morocco",
    title: "COD address fields for Morocco",
    excerpt: "City, neighborhood, and phone — what to collect at checkout.",
    categoryId: "orders-cod",
    keywords: ["address", "city", "morocco", "neighborhood"],
    body: [
      "COD checkout collects name, phone, city, neighborhood (quartier), and full address — fields Moroccan couriers expect.",
      "Require a valid mobile number. Landlines make delivery harder.",
      "Limit where you deliver in Settings → Shipping by choosing cities for each zone.",
    ],
  },
  {
    slug: "handle-refused-cod-deliveries",
    title: "Handle refused COD deliveries",
    excerpt: "What to do when a customer refuses the package.",
    categoryId: "orders-cod",
    keywords: ["refused", "return", "cod", "delivery"],
    body: [
      "Mark the order as refused or returned in Dashboard → Orders. This keeps your records accurate.",
      "Contact the customer via phone or WhatsApp to understand why — often it is wrong size or changed mind.",
      "Enable pre-shipment verification to catch non-serious buyers before you pay courier fees.",
    ],
  },
  {
    slug: "manage-orders-and-fulfillment",
    title: "Manage orders and fulfillment",
    excerpt: "Update status, notify customers, and track deliveries.",
    categoryId: "orders-cod",
    popular: true,
    keywords: ["orders", "fulfill", "ship", "status"],
    body: [
      "Open any order from Dashboard → Orders to see line items, customer info, and payment method.",
      "Update order status — pending, confirmed, shipped, delivered. Customers can be notified automatically.",
      "Export orders or integrate with your courier workflow as your volume grows.",
    ],
  },
  {
    slug: "recover-abandoned-carts",
    title: "Recover abandoned carts",
    excerpt: "Win back buyers who left checkout without ordering.",
    categoryId: "orders-cod",
    popular: true,
    keywords: ["abandoned", "cart", "recovery"],
    body: [
      "View abandoned checkouts in Dashboard → Orders → Abandoned.",
      "See customer contact info and cart contents. Follow up via WhatsApp or phone — personal outreach works well for COD.",
      "Use Marketing → Campaigns for automated reminders on higher plans.",
    ],
  },
  {
    slug: "create-draft-orders",
    title: "Create draft orders",
    excerpt: "Place orders manually for phone or WhatsApp sales.",
    categoryId: "orders-cod",
    keywords: ["draft", "manual", "order"],
    body: [
      "Go to Dashboard → Orders → Drafts → Create draft order.",
      "Add products, set customer details, and save. Convert to a real order when the customer confirms.",
      "Useful for Instagram DM sales and phone orders common in Morocco.",
    ],
  },
  {
    slug: "handle-returns-and-refunds",
    title: "Handle returns and refunds",
    excerpt: "Process returned items and update inventory.",
    categoryId: "orders-cod",
    keywords: ["return", "refund", "exchange"],
    body: [
      "Open Dashboard → Orders → Returns to see return requests and process them.",
      "Update order status and restock inventory when items come back.",
      "For COD, refunds are typically handled in cash or bank transfer — document the refund in order notes.",
    ],
  },
  // Domains & hosting
  {
    slug: "connect-a-custom-domain",
    title: "Connect a custom domain",
    excerpt: "Use your own domain with automatic SSL and CDN.",
    categoryId: "domains-hosting",
    popular: true,
    keywords: ["domain", "dns", "ssl", "custom"],
    body: [
      "Go to Online Store → Domains. Enter your domain name and follow the DNS instructions.",
      "Ettajer provisions SSL automatically once DNS propagates — usually within a few hours.",
      "Custom domains are available on all paid plans.",
    ],
  },
  {
    slug: "fix-custom-domain-not-working",
    title: "Fix custom domain not working",
    excerpt: "DNS, propagation, and SSL troubleshooting.",
    categoryId: "troubleshooting",
    popular: true,
    keywords: ["domain", "dns", "ssl", "not working"],
    body: [
      "Confirm your A or CNAME records match exactly what Ettajer shows in Online Store → Domains.",
      "DNS changes can take up to 48 hours to propagate worldwide. Use a DNS checker to verify.",
      "If SSL is pending, wait for DNS to resolve first. Contact support with your domain if issues persist after 48 hours.",
    ],
  },
  {
    slug: "store-speed-and-hosting",
    title: "Store speed and hosting",
    excerpt: "Edge hosting, image optimization, and fast checkout.",
    categoryId: "domains-hosting",
    keywords: ["speed", "hosting", "cdn", "performance"],
    body: [
      "Every Ettajer storefront is served from the edge with pre-rendered pages and optimized images.",
      "You do not need separate hosting — your store, checkout, and admin run on one platform.",
      "Core Web Vitals are tuned for mobile buyers in Morocco.",
    ],
  },
  // Billing
  {
    slug: "pricing-plans-and-trial",
    title: "Pricing plans and free trial",
    excerpt: "Start with 0 DH your first month on Growth, then monthly or annual billing.",
    categoryId: "billing",
    popular: true,
    keywords: ["pricing", "plan", "trial", "growth"],
    body: [
      "Ettajer offers Starter, Growth, and Business plans. Growth includes 0 DH for your first month.",
      "After the trial, you are billed monthly or annually. Annual billing saves roughly 20%.",
      "Upgrade or downgrade anytime from Settings → Billing.",
    ],
  },
  {
    slug: "transaction-fees-explained",
    title: "Transaction fees explained",
    excerpt: "0% platform fees on Growth and Business plans.",
    categoryId: "billing",
    keywords: ["fees", "transaction", "commission"],
    body: [
      "Ettajer charges 0% transaction fees on Growth and Business plans.",
      "Starter includes a small platform fee. Payment gateway fees still apply if you use card payments.",
      "COD orders do not incur card processing fees.",
    ],
  },
  // Marketing
  {
    slug: "connect-marketing-pixels",
    title: "Connect marketing pixels",
    excerpt: "Meta, Google, TikTok, and more from the marketing dashboard.",
    categoryId: "marketing",
    popular: true,
    keywords: ["pixel", "tracking", "ads", "marketing"],
    body: [
      "Open Dashboard → Marketing → Integrations to connect Meta, Google Tag Manager, TikTok, Pinterest, and Snapchat.",
      "Paste your pixel ID and Ettajer injects tracking on storefront and checkout events automatically.",
      "Use the analytics dashboard to see traffic alongside your ad platforms.",
    ],
  },
  {
    slug: "connect-meta-pixel",
    title: "Connect Meta Pixel",
    excerpt: "Track Facebook and Instagram ad conversions.",
    categoryId: "marketing",
    popular: true,
    keywords: ["meta", "facebook", "instagram", "pixel"],
    body: [
      "Find your Pixel ID in Meta Events Manager → Data Sources → Pixels.",
      "In Ettajer, go to Marketing → Integrations → Meta. Paste the Pixel ID and enable PageView, AddToCart, and Purchase events.",
      "Use Meta's Test Events tool to verify firing before scaling ad spend.",
    ],
  },
  {
    slug: "connect-tiktok-pixel",
    title: "Connect TikTok Pixel",
    excerpt: "Measure TikTok ad performance and optimize campaigns.",
    categoryId: "marketing",
    keywords: ["tiktok", "pixel", "ads"],
    body: [
      "Get your Pixel ID from TikTok Ads Manager → Assets → Events → Web Events.",
      "In Ettajer Marketing → Integrations → TikTok, paste the ID and enable standard e-commerce events.",
      "TikTok works well for fashion and lifestyle brands targeting Moroccan youth.",
    ],
  },
  {
    slug: "connect-google-tag-manager",
    title: "Connect Google Tag Manager",
    excerpt: "Manage Google Ads and Analytics tags in one place.",
    categoryId: "marketing",
    keywords: ["google", "gtm", "analytics", "ads"],
    body: [
      "Create a GTM container at tagmanager.google.com and copy the Container ID (GTM-XXXX).",
      "In Ettajer Marketing → Integrations → Google or GTM, paste the ID.",
      "Configure tags inside GTM for Google Ads conversions and GA4 without editing your store code.",
    ],
  },
  {
    slug: "connect-pinterest-tag",
    title: "Connect Pinterest Tag",
    excerpt: "Track Pinterest ad clicks and purchases.",
    categoryId: "marketing",
    keywords: ["pinterest", "tag", "ads"],
    body: [
      "Find your Tag ID in Pinterest Ads → Ads → Conversions.",
      "Paste it in Marketing → Integrations → Pinterest and enable checkout events.",
      "Strong for home decor, fashion, and visual product categories.",
    ],
  },
  {
    slug: "connect-snapchat-pixel",
    title: "Connect Snapchat Pixel",
    excerpt: "Attribute Snapchat ad spend to store purchases.",
    categoryId: "marketing",
    keywords: ["snapchat", "pixel", "ads"],
    body: [
      "Get your Pixel ID from Snapchat Ads Manager → Events Manager.",
      "Add it in Marketing → Integrations → Snapchat.",
      "Enable Purchase and AddToCart for full funnel tracking.",
    ],
  },
  {
    slug: "create-discounts-and-campaigns",
    title: "Create discounts and campaigns",
    excerpt: "Promo codes, sales, and abandoned cart emails.",
    categoryId: "marketing",
    keywords: ["discount", "coupon", "campaign", "promo"],
    body: [
      "Go to Marketing → Discounts to create percentage or fixed-amount codes.",
      "Set expiry dates and usage limits. Share codes on Instagram and WhatsApp.",
      "Marketing → Campaigns handles abandoned cart recovery and promotional emails.",
    ],
  },
  {
    slug: "built-in-seo",
    title: "Built-in SEO",
    excerpt: "Sitemaps, meta tags, and clean URLs out of the box.",
    categoryId: "marketing",
    keywords: ["seo", "google", "search", "sitemap"],
    body: [
      "Every store includes server-rendered pages, XML sitemaps, canonical URLs, and Open Graph previews.",
      "Set your shop title, meta description, and keywords in Settings → SEO. Leave fields blank to use your store name and description.",
      "You can also refine titles on individual pages and products from the editor.",
    ],
  },
  // Analytics
  {
    slug: "understand-your-analytics-dashboard",
    title: "Understand your analytics dashboard",
    excerpt: "Traffic, conversion rate, and revenue at a glance.",
    categoryId: "analytics",
    popular: true,
    keywords: ["analytics", "reports", "traffic", "conversion"],
    body: [
      "Open Dashboard → Analytics for live visitors, sessions, and conversion rate.",
      "Reports show revenue over time, top products, and traffic sources.",
      "Compare periods to see if marketing campaigns or seasonal sales are working.",
    ],
  },
  {
    slug: "track-live-store-visitors",
    title: "Track live store visitors",
    excerpt: "See who is on your store right now.",
    categoryId: "analytics",
    keywords: ["live", "visitors", "realtime"],
    body: [
      "Analytics → Live shows active sessions on your storefront in real time.",
      "Useful during flash sales or Instagram live sessions to gauge traffic spikes.",
      "Pair with Marketing attribution to connect ad clicks to live sessions.",
    ],
  },
  // Account
  {
    slug: "reset-password-and-login",
    title: "Reset password and login",
    excerpt: "Recover access to your merchant account.",
    categoryId: "account",
    keywords: ["password", "login", "account"],
    body: [
      "On the login page, click Forgot password and enter your email.",
      "Reset links expire after 1 hour and can only be used once.",
      "After 10 failed sign-in attempts, your account locks for 15 minutes.",
      "If you signed up with Google, use Continue with Google or set a password via Forgot password.",
      "Still locked out? Contact support with the email on your account.",
    ],
  },
  {
    slug: "configure-checkout-settings",
    title: "Configure checkout settings",
    excerpt: "COD, minimum order, and storefront messaging.",
    categoryId: "getting-started",
    keywords: ["checkout", "settings", "cod", "seo"],
    body: [
      "Open Dashboard → Settings. Use Payments to enable Cash on Delivery, and Checkout to set a minimum order, checkout note, COD message, and announcement bar.",
      "Storefront contact controls WhatsApp and whether email/phone appear in the footer. SEO controls how your shop shows in Google.",
      "After saving, open your live store and place a test order to confirm checkout looks right.",
    ],
  },
  {
    slug: "manage-customers",
    title: "Manage customers",
    excerpt: "View profiles, order history, and contact info.",
    categoryId: "account",
    keywords: ["customers", "crm", "profiles"],
    body: [
      "Dashboard → Customers lists everyone who ordered or signed up on your store.",
      "Open a customer to see order history, total spend, and contact details.",
      "Export customer lists for email campaigns or WhatsApp broadcasts (respect opt-in rules).",
    ],
  },
  // Migration
  {
    slug: "migrate-from-shopify",
    title: "Migrate from Shopify",
    excerpt: "Import products, customers, and orders with the migration assistant.",
    categoryId: "migration",
    popular: true,
    keywords: ["shopify", "migrate", "import"],
    body: [
      "Open Dashboard → Settings → Migration and connect your Shopify store via API or upload a product CSV.",
      "We import products with images, variants, and descriptions. URL redirects can preserve SEO.",
      "For large catalogs, our team can assist on Business plans.",
    ],
  },
  {
    slug: "migrate-from-woocommerce",
    title: "Migrate from WooCommerce",
    excerpt: "Bring your catalog over with CSV import.",
    categoryId: "migration",
    keywords: ["woocommerce", "wordpress", "migrate"],
    body: [
      "Export products from WooCommerce as CSV, then import via Dashboard → Products → Import.",
      "Map columns to Ettajer fields and review a preview before confirming.",
      "Rebuild your storefront in the visual builder — typically less than a day.",
    ],
  },
  // Troubleshooting
  {
    slug: "store-not-loading",
    title: "Store not loading or blank page",
    excerpt: "Fix white screens and connection errors.",
    categoryId: "troubleshooting",
    popular: true,
    keywords: ["blank", "loading", "error", "down"],
    body: [
      "Clear your browser cache and try an incognito window. Check if the issue is only on your device or for all visitors.",
      "If you recently changed DNS, wait up to 48 hours for propagation.",
      "Ensure your store is published in Themes. Draft-only changes do not affect the live URL.",
      "Contact support if the store is down for all visitors for more than 30 minutes.",
    ],
  },
  {
    slug: "pixel-not-firing",
    title: "Marketing pixel not firing",
    excerpt: "Verify Meta, TikTok, or Google tracking is working.",
    categoryId: "troubleshooting",
    popular: true,
    keywords: ["pixel", "tracking", "not working", "meta"],
    body: [
      "Confirm the Pixel ID is correct in Marketing → Integrations with no extra spaces.",
      "Disable ad blockers when testing. Use the platform's Test Events tool (Meta, TikTok) to verify.",
      "Events fire on the live storefront — preview mode in the builder may not trigger pixels.",
      "Allow 24 hours for ad platforms to show data after first install.",
    ],
  },
  {
    slug: "orders-not-appearing",
    title: "Orders not appearing in dashboard",
    excerpt: "When checkout succeeds but orders are missing.",
    categoryId: "troubleshooting",
    keywords: ["orders", "missing", "checkout"],
    body: [
      "Refresh Dashboard → Orders. Check filters — you may be viewing a date range that excludes new orders.",
      "Confirm the customer completed checkout (not just added to cart).",
      "If payment or verification failed, the order may be in Abandoned instead of Orders.",
      "Contact support with the customer phone number and approximate order time.",
    ],
  },
  {
    slug: "images-not-uploading",
    title: "Images not uploading",
    excerpt: "Fix product or section image upload failures.",
    categoryId: "troubleshooting",
    keywords: ["image", "upload", "photo"],
    body: [
      "Use JPG, PNG, or WebP under 10 MB per file.",
      "Check your internet connection — large files on slow mobile networks may timeout.",
      "Try a different browser. Disable VPN if uploads consistently fail.",
      "Contact support if a specific file fails repeatedly after resizing.",
    ],
  },
];

export function getCategoryById(id: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((category) => category.id === id);
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.categoryId === categoryId);
}

export function getPopularArticles(): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.popular);
}

export function searchArticles(query: string, limit = 50): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);

  const scored = HELP_ARTICLES.map((article) => {
    const category = getCategoryById(article.categoryId);
    const title = article.title.toLowerCase();
    const excerpt = article.excerpt.toLowerCase();
    const keywords = (article.keywords ?? []).join(" ").toLowerCase();
    const body = article.body.join(" ").toLowerCase();
    const categoryTitle = (category?.title ?? "").toLowerCase();
    const haystack = `${title} ${excerpt} ${keywords} ${body} ${categoryTitle}`;

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 10;
      if (keywords.includes(term)) score += 6;
      if (excerpt.includes(term)) score += 4;
      if (categoryTitle.includes(term)) score += 3;
      if (body.includes(term)) score += 1;
    }

    return { article, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);

  return scored;
}

export function getSearchSuggestions(query: string, limit = 6): HelpArticle[] {
  return searchArticles(query, limit);
}
