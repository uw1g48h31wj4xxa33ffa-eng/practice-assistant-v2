import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SettingsProvider } from "@/contexts/SettingsContext";

export const metadata: Metadata = {
  title: "Practice Assistant V2",
  description: "士業業務アシスタント - 規程設計・業務補助ツール",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Practice Assistant V2",
    description: "士業業務アシスタント - 規程設計・業務補助ツール（ポートフォリオ限定公開版）",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen bg-slate-50`}
      >
        <SettingsProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
