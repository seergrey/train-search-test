import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // A stray lockfile in $HOME otherwise makes Turbopack infer the wrong root.
  turbopack: { root: import.meta.dirname },
  images: {
    // Train payloads carry picsum.photos URLs in `image`.
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
};

export default nextConfig;
