import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SOURCE = "C:\\Users\\HP\\Desktop\\Assests Pictures for ettajer";
const OUT = path.join(process.cwd(), "public", "assets");

/** @type {{ src: string; out: string; w: number; h: number; quality?: number }[]} */
const JOBS = [
  // Theme picker cards
  { src: "Carpette Shop/can be a cover 2.webp", out: "themes/minimal-preview.webp", w: 800, h: 600 },
  { src: "Fashion Shop/can be cover.jpg", out: "themes/modern-preview.webp", w: 800, h: 600 },
  { src: "tech shop/can be cover.jpg", out: "themes/bold-preview.webp", w: 800, h: 600 },

  // Storefront hero banners
  { src: "Carpette Shop/carpets red in souk.webp", out: "themes/minimal-hero.webp", w: 1600, h: 900 },
  { src: "Fashion Shop/model wearing cuire jacker.webp", out: "themes/modern-hero.webp", w: 1600, h: 900 },
  { src: "tech shop/mackbook neon.png", out: "themes/bold-hero.webp", w: 1600, h: 900 },

  // Category / collection covers
  { src: "Carpette Shop/carpets souq.avif", out: "placeholders/categories/carpets.webp", w: 1200, h: 750 },
  { src: "Fashion Shop/can be blog.jpg", out: "placeholders/categories/fashion.webp", w: 1200, h: 750 },
  { src: "tech shop/ipads flying.jpg", out: "placeholders/categories/tech.webp", w: 1200, h: 750 },

  // Collection covers
  { src: "Carpette Shop/can be a cover].jpg", out: "placeholders/collections/minimal-cover.webp", w: 1200, h: 750 },
  { src: "Fashion Shop/can be blog 2.jpg", out: "placeholders/collections/modern-cover.webp", w: 1200, h: 750 },
  { src: "tech shop/can be blog apple.webp", out: "placeholders/collections/bold-cover.webp", w: 1200, h: 750 },

  // Minimal theme products (carpets)
  { src: "Carpette Shop/product one A.webp", out: "placeholders/products/minimal-1.webp", w: 800, h: 800 },
  { src: "Carpette Shop/Product Two A.jpg", out: "placeholders/products/minimal-2.webp", w: 800, h: 800 },
  { src: "Carpette Shop/Product tree A.jpg", out: "placeholders/products/minimal-3.webp", w: 800, h: 800 },

  // Modern theme products (fashion)
  { src: "Fashion Shop/bomber agneau souple product.avif", out: "placeholders/products/modern-1.webp", w: 800, h: 800 },
  { src: "Fashion Shop/veste agneau plongé Product.avif", out: "placeholders/products/modern-2.webp", w: 800, h: 800 },
  { src: "Fashion Shop/BOTTINE ZIPPÉE HECTOR EN CUIR DE VEAU.avif", out: "placeholders/products/modern-3.webp", w: 800, h: 800 },

  // Bold theme products (tech)
  { src: "tech shop/mackbook pro.png", out: "placeholders/products/bold-1.webp", w: 800, h: 800 },
  { src: "tech shop/ipad pro.png", out: "placeholders/products/bold-2.webp", w: 800, h: 800 },
  { src: "tech shop/airpods.png", out: "placeholders/products/bold-3.webp", w: 800, h: 800 },
];

async function findFile(relativePath) {
  const direct = path.join(SOURCE, relativePath);
  try {
    await fs.access(direct);
    return direct;
  } catch {
    const [folder, ...nameParts] = relativePath.split(/[/\\]/);
    const targetName = nameParts.join(path.sep).toLowerCase();
    const folderPath = path.join(SOURCE, folder);
    const files = await fs.readdir(folderPath);

    const exact = files.find((f) => f.toLowerCase() === targetName.toLowerCase());
    if (exact) return path.join(folderPath, exact);

    const base = path.basename(targetName, path.extname(targetName)).toLowerCase();
    const fuzzy = files.find((f) => f.toLowerCase().includes(base.slice(0, 12)));
    if (fuzzy) return path.join(folderPath, fuzzy);

    throw new Error(`Missing source file: ${relativePath}`);
  }
}

async function processImage(job) {
  const input = await findFile(job.src);
  const output = path.join(OUT, job.out);
  await fs.mkdir(path.dirname(output), { recursive: true });

  const before = (await fs.stat(input)).size;

  await sharp(input)
    .rotate()
    .resize(job.w, job.h, { fit: "cover", position: "centre" })
    .webp({ quality: job.quality ?? 82, effort: 4 })
    .toFile(output);

  const after = (await fs.stat(output)).size;
  console.log(
    `✓ ${job.out}  ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB  (${job.w}×${job.h})`
  );
}

async function main() {
  console.log("Processing Ettajer assets...\n");
  let ok = 0;
  let fail = 0;

  for (const job of JOBS) {
    try {
      await processImage(job);
      ok++;
    } catch (error) {
      fail++;
      console.error(`✗ ${job.out}: ${error.message}`);
    }
  }

  console.log(`\nDone: ${ok} succeeded, ${fail} failed.`);
  if (fail > 0) process.exitCode = 1;
}

main();
