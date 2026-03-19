import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Longchill — Bar & Restaurant",
  description:
    "Longchill (ลองชิลล์) — Where great food meets good vibes. Craft cocktails, delicious bites, and the perfect chill atmosphere.",
  keywords: ["longchill", "bar", "restaurant", "cocktails", "food", "chill"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
