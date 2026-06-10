import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "黑板猫校园外卖兼职招聘系统",
  description: "校园外卖配送兼职报名与后台筛选管理系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
