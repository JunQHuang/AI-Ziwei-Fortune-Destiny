import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "紫微斗数 · AI算命",
  description: "输入生辰，紫微排盘，AI解读命理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
