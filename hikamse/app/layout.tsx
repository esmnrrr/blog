import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hikamse", // Hazır buraya girmişken sitenin sekme başlığını da düzeltmiş olalım :)
  description: "Dünyanın dizisi, Hikamse'de!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div style={{ position: 'relative', zIndex: 9999 }}>
          <Navbar />
        </div>
        
        {/* Sayfaların asıl içeriği burada yükleniyor */}
        {children}
        
        {/* Sayfanın neresinde olursan ol köşeden çıkacak olan bülten popup'ı */}
        <Newsletter />
        
        <Footer />
      </body>
    </html>
  );
}