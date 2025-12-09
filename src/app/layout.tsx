import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Providers 컴포넌트 (지갑 연결 상태 등을 제공)는 여전히 필요합니다.
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/Header"; // Header 컴포넌트를 임포트합니다.

// --- 폰트 정의 ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// *주의: Metadata는 'use client'가 있는 파일에서 export 할 수 없습니다. 
// 따라서 Metadata 객체는 선언만 해두거나, 별도의 서버 컴포넌트 파일로 분리해야 합니다.
// 여기서는 구조를 보여드리기 위해 주석 처리하고 넘어갑니다.*
// export const metadata: Metadata = { ... }; 


// --- RootLayout 컴포넌트 (Header 로직 포함) ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header /> {/* Header 컴포넌트를 렌더링합니다. */}
          {children}
        </Providers>
      </body>
    </html>
  );
}