/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },
  async redirects() {
    return [
      { source: "/user", destination: "/rooms", permanent: false },
      { source: "/room", destination: "/rooms", permanent: false },
      { source: "/room/:roomId", destination: "/rooms/:roomId", permanent: false },
    ];
  },
};

export default nextConfig;
