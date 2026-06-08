import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "旅のしおり",
  description: "旅行計画を立てて、しおりを作るアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppChrome>{children}</AppChrome>
        <footer className="mx-auto w-full max-w-3xl px-4 py-6 text-sm text-gray-600 print:hidden">
          旅行計画・しおり作成アプリ
        </footer>
      </body>
    </html>
  );
}
