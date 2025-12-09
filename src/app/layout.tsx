import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";

import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "Web3 기반 NFT 거래 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
