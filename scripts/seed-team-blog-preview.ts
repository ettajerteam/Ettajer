import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STORE_ID = "cmr7tblwb0004v2d8gvxp6pte";

const POSTS = [
  {
    title: "COD shipping tips for Casablanca & Rabat",
    slug: "cod-shipping-tips-casablanca-rabat",
    excerpt:
      "Confirm addresses, set clear delivery windows, and cut failed attempts on cash-on-delivery orders.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    content: `
<p>Cash on delivery still converts well in Morocco — but only when delivery feels predictable. Here’s a simple playbook we use with merchants on Ettajer.</p>
<h2>1. Confirm before you ship</h2>
<p>Call or WhatsApp within a few hours of the order. Confirm the city, neighborhood, and a preferred time window. A 30-second confirmation saves a full failed trip.</p>
<h2>2. Write addresses buyers understand</h2>
<p>Ask for a landmark (“near Café X”, “behind the pharmacy”) in the checkout note. Couriers move faster when the pin isn’t the only clue.</p>
<blockquote><p>Tip: Keep your order ticket printer ready so the packer sees phone + city at a glance.</p></blockquote>
<h2>3. Set expectations in the thank-you page</h2>
<p>Tell shoppers when you’ll call, typical delivery days for Casablanca vs Rabat, and what to prepare for COD payment.</p>
<h3>What “good” looks like</h3>
<ul>
<li>Confirmation rate above 80%</li>
<li>Failed delivery under 15%</li>
<li>Clear WhatsApp template for “out for delivery”</li>
</ul>
<p>Publish this guide on your blog, then share the link in Instagram Stories so buyers know what to expect before they order.</p>
`.trim(),
  },
  {
    title: "How we style a lookbook for Instagram → store",
    slug: "instagram-lookbook-to-store",
    excerpt:
      "Turn one shoot into a blog post, product tags, and a WhatsApp share that actually sells.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    content: `
<p>A lookbook doesn’t need a magazine budget. It needs <strong>one clear story</strong> and links shoppers can tap.</p>
<h2>Shoot with the product page in mind</h2>
<p>Capture a hero wide shot for the blog cover, then 3–4 detail frames you can reuse on the product gallery.</p>
<ol>
<li>Natural light, plain background</li>
<li>One hero outfit or SKU per post</li>
<li>Save vertical crops for Reels / Stories</li>
</ol>
<h2>Publish the journal post</h2>
<p>Use the cover image, a short excerpt, and body copy that names the pieces. Link each product with an inline link so readers can buy without hunting.</p>
<h3>Share formula</h3>
<p>Story → swipe-up / link sticker to <code>/blog/instagram-lookbook-to-store</code> → CTA “Shop the look · COD available”.</p>
<hr>
<p>When the post is live, pin it in Highlights as “Lookbook” so new followers find it later.</p>
`.trim(),
  },
  {
    title: "Sizing guide: find your fit before you COD",
    slug: "sizing-guide-find-your-fit",
    excerpt:
      "Fewer returns start with honest measurements. Copy this template into your own journal.",
    image:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=1200&q=80",
    content: `
<p>Returns hurt more on COD. A clear sizing guide builds trust before payment happens at the door.</p>
<h2>Measure once, buy once</h2>
<p>Ask shoppers to measure chest, waist, and hips with a soft tape. Compare to your chart — don’t rely on “S/M/L feels like Zara.”</p>
<table></table>
<ul>
<li><strong>Chest</strong> — fullest part, tape parallel to the floor</li>
<li><strong>Waist</strong> — natural waist, not where jeans sit</li>
<li><strong>Length</strong> — shoulder to hem for dresses / djellabas</li>
</ul>
<h2>When in doubt</h2>
<p>Offer a WhatsApp size check: photo + height. Put that CTA in your blog and product pages.</p>
<blockquote><p>Pro move: end the post with “Still unsure? Message us — we’ll confirm before we ship.”</p></blockquote>
<p>This is a sample Ettajer team post so you can preview how journal layouts render on the storefront.</p>
`.trim(),
  },
];

async function main() {
  const store = await prisma.store.findUnique({
    where: { id: STORE_ID },
    select: { id: true, slug: true, name: true },
  });
  if (!store) throw new Error("Store not found");

  console.log(`Seeding blog posts for ${store.name} (${store.slug})…`);

  for (const post of POSTS) {
    const existing = await prisma.blogPost.findFirst({
      where: { storeId: store.id, slug: post.slug },
    });

    if (existing) {
      await prisma.blogPost.update({
        where: { id: existing.id },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          status: "published",
          publishedAt: existing.publishedAt ?? new Date(),
        },
      });
      console.log(`  updated: ${post.slug}`);
    } else {
      await prisma.blogPost.create({
        data: {
          storeId: store.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          status: "published",
          publishedAt: new Date(),
        },
      });
      console.log(`  created: ${post.slug}`);
    }
  }

  const count = await prisma.blogPost.count({
    where: { storeId: store.id, status: "published" },
  });
  console.log(`Done. ${count} published post(s).`);
  console.log(`Blog index: /store/${store.slug}/blog`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
