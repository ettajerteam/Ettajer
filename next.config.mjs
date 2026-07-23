/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three", "react-globe.gl"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "ufs.sh" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
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
