import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的サイトとして書き出し（out/）。Firebase Hosting（無料 Spark プラン）で配信する。
  output: "export",
};

export default nextConfig;
