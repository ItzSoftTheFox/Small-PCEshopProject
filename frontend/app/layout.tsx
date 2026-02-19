import type { Metadata } from "next";
import { Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // <--- 1. Importujeme Navbar

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PC E-shop | ARC Raiders",
  description: "High-end hardware terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${rajdhani.variable} ${shareTechMono.variable} font-sans antialiased bg-background text-primary`}>
        
        {/* 2. TADY vložíme Navbar, aby byl na každé stránce nahoře */}
        <Navbar />
        
        {children}
      </body>
    </html>
  );
}