/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }
    return config;
  },
  images: {
    unoptimized: true,
    domains: [
      "replicate.com",
      "replicate.delivery",
      "pbxt.replicate.delivery",
      "oaidalleapiprodscus.blob.core.windows.net",
      "utfs.io",
      "pprcanvas.s3.amazonaws.com",
      "img.clerk.com",
      "storage.googleapis.com",
      "images.unsplash.com",
      "fal.media",
      "v2.fal.media",
      "emotemaker.ai",
      "your-image-hosting-domain.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "pprcanvas.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fal.media",
      },
      {
        protocol: "https",
        hostname: "v2.fal.media",
      },
    ],
  },
  transpilePackages: ["convex-helpers"],

  // Add the new headers configuration
  async headers() {
    return [
      {
        source: "/images/:all*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
