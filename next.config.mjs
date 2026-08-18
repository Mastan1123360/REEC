/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: { mdxRs: false },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  }
};
export default nextConfig;
