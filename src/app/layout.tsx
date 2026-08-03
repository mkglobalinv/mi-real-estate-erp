import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileStickyActions from "@/components/layout/MobileStickyActions";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";


export const metadata: Metadata = {
  title: "M.I. Real Estate & General Enterprises Ltd",
  description: "Premium corporate and residential real estate in Nigeria. Future-ready CRM & Property Management Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`font-sans antialiased bg-gray-50 text-gray-900 pb-16 md:pb-0`}>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
