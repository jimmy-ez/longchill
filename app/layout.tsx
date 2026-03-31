import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Longchill — Mala & Bar",
  description:
    "Longchill Mala & Bar (ลองชิลล์) — บาร์ ถนนติวานนท์ ปทุมธานี ที่ชิลล์ที่สุด พบกับหม่าล่ารสเด็ด เครื่องดื่มหลากหลาย และดนตรีสดในบรรยากาศสุดชิลล์",
  keywords: [
    "longchill",
    "บาร์ปทุมธานี",
    "หม่าล่าปทุมธานี",
    "บาร์ติวานนท์",
    "หม่าล่าติวานนท์",
    "หม่าล่าบ้านใหม่",
    "บาร์บ้านใหม่",
    "ร้านเหล้าปทุมธานี",
    "เบียร์ปทุมธานี",
    "เบียร์",
    "mala",
    "หม่าล่า",
    "ร้านนั่งชิลล์ ปทุมธานี",
    "ร้านนั่งชิลล์ ติวานนท์",
    "ร้านนั่งชิลล์ บ้านใหม่",
  ],
  openGraph: {
    title: "Longchill — Mala & Bar",
    description: "บาร์ที่ชิลล์ที่สุดในปทุมธานี พบกับหม่าล่ารสเด็ด เครื่องดื่มหลากหลาย และดนตรีสด",
    images: ["https://jwvzskjzgeqnkbndawso.supabase.co/storage/v1/object/public/etc/hero-bg-1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Longchill — Mala & Bar",
    description: "บาร์ที่ชิลล์ที่สุดในปทุมธานี พบกับหม่าล่ารสเด็ด เครื่องดื่มหลากหลาย และดนตรีสด",
    images: ["https://jwvzskjzgeqnkbndawso.supabase.co/storage/v1/object/public/etc/hero-bg-1.png"],
  },
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
