/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Required for Capacitor static export
    unoptimized: process.env.CAPACITOR_BUILD === "true",
  },
  // Static export for Capacitor native builds
  ...(process.env.CAPACITOR_BUILD === "true" && {
    output: "export",
    trailingSlash: true,
  }),
};

export default nextConfig;
