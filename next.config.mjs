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
    ],
  },
};

export default nextConfig;
