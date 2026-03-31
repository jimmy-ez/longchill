import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Longchill — Mala & Bar",
  description:
    "Longchill Mala & Bar (ลองชิลล์) — บาร์ติวานนท์ นนทบุรี ที่ชิลล์ที่สุด พบกับหม่าล่ารสเด็ด เครื่องดื่มหลากหลาย และดนตรีสดในบรรยากาศสุดชิลล์",
  keywords: [
    "longchill",
    "บาร์นนทบุรี",
    "หม่าล่านนทบุรี",
    "บาร์ติวานนท์",
    "หม่าล่าติวานนท์",
    "ร้านเหล้านนทบุรี",
    "เบียร์นนทบุรี",
    "เบียร์",
    "mala",
    "หม่าล่า",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
