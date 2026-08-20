/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three", "react-globe.gl"],
  images: {
    // Remote merchant images (Vercel Blob) must not go through `/_next/image` on
    // Vercel: quota exhaustion returns HTTP 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
    // and the storefront shows broken icons with alt text still visible.
    // Local placeholders still use the optimizer unless VERCEL=1 at build time.
    unoptimized: process.env.VERCEL === "1",
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "ufs.sh" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com", pathname: "/**" },
      // AliExpress / Taobao CDN (dropshipping imports)
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "ae01.alicdn.com" },
      { protocol: "https", hostname: "ae02.alicdn.com" },
      { protocol: "https", hostname: "ae03.alicdn.com" },
      { protocol: "https", hostname: "ae04.alicdn.com" },
      { protocol: "https", hostname: "ae05.alicdn.com" },
      { protocol: "https", hostname: "img.alicdn.com" },
      { protocol: "https", hostname: "**.aliexpress-media.com" },
      { protocol: "https", hostname: "**.aliexpress.com" },
      // Other dropship suppliers
      { protocol: "https", hostname: "**.cjdropshipping.com" },
      { protocol: "https", hostname: "**.bigbuy.eu" },
    ],
  },
  // Keep founder-card fonts + native resvg binary out of the webpack graph
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js"],
    outputFileTracingIncludes: {
      "/*": ["./assets/fonts/**/*"],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("@resvg/resvg-js");
      }
    }
    return config;
  },
};

export default nextConfig;
