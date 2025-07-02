/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: [
      "uploadthing.com",
      "utfs.io", 
      "img.clerk.com",
      "files.stripe.com",
      "oaidalleapiprodscus.blob.core.windows.net",
      "pprcanvas.s3.amazonaws.com",
      "emotemaker.ai",
    ],
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  webpack: (config, { isServer, dev }) => {
    // Canvas externals for server-side
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
        "canvas-prebuilt": "commonjs canvas-prebuilt",
        // Add browser-only libraries to prevent server-side bundling
        "jspdf": "jspdf",
        "gif.js": "gif.js",
        "konva": "konva",
      });
    }

    // Temporarily disable splitChunks to isolate the issue
    // if (!dev) {
    //   config.optimization.splitChunks = {
    //     chunks: 'all',
    //     cacheGroups: {
    //       vendor: {
    //         test: /[\\/]node_modules[\\/]/,
    //         name: 'vendors',
    //         chunks: 'all',
    //       },
    //     },
    //   };
    // }

    // Node loader for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    return config;
  },
  
  experimental: {
    serverComponentsExternalPackages: ["canvas", "jspdf", "gif.js", "konva"],
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns'
    ]
  },
  
  // Bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    }
  })
};

module.exports = nextConfig;
