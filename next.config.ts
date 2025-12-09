import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 설정 (Next.js 16 기본)
  // 빈 설정으로 webpack 경고 방지
  turbopack: {},
};

export default nextConfig;
