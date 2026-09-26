import type { Metadata } from "next";

const title = "Become an Agent — Yarimawa Hills Estate, Kano | M.I. Real Estate";
const description =
  "Join M.I. Real Estate as an agent and earn commission selling plots at Yarimawa Hills Estate Private Layout, opposite Janguza Langel, Kano. 50x50 plots ₦4,000,000 and 25x50 plots ₦2,000,000 with 18-month Easy-Buy instalments. Letter of Grant issued by Kano State Ministry of Land. Free registration.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: "/images/yarimawa-hills-flyer.jpg", width: 720, height: 1080, alt: "Yarimawa Hills Estate Private Layout flyer" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/yarimawa-hills-flyer.jpg"],
  },
};

export default function BecomeAnAgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
