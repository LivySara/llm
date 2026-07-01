import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agent - Intelligent Assistant",
  description: "A powerful AI agent built with Next.js and LangChain",
};

// Viewport 配置 - 用于移动端适配
// width: 设置视口宽度等于设备宽度
// initialScale: 初始缩放比例
// maximumScale: 最大缩放比例（设置为1防止用户缩放）
// userScalable: 是否允许用户缩放（false表示不允许）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
