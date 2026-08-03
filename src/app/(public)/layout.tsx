import Navbar from "@/components/layout/Navbar";
import NewsMarquee from "@/components/layout/NewsMarquee";
import Footer from "@/components/layout/Footer";
import MobileStickyActions from "@/components/layout/MobileStickyActions";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <NewsMarquee />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <MobileStickyActions />
    </>
  );
}
