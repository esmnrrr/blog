import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Resim İzinleri (Eski ayarın)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 2. YENİ EKLEDİĞİMİZ KISIM: Google Login Hatasını Çözer
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;