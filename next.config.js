/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "uploadthing.com",
      "utfs.io",
      "img.clerk.com",
      "subdomain",
      "files.stripe.com",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
        "canvas-prebuilt": "commonjs canvas-prebuilt",
      });
    }

    // Add node-loader for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // Add canvas loader
    config.module.rules.push({
      test: /\.(node|canvas)$/,
      use: {
        loader: "node-loader",
        options: {
          name: "[name].[ext]",
        },
      },
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["canvas"],
  },
};

module.exports = nextConfig;
