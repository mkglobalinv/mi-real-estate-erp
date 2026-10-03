import type { Metadata } from "next";

const TITLE = "Own Your Land in Kano With Flexible Installment Plans | M.I. Real Estate";
const DESCRIPTION = "Secure your plot at Lambu Government Layout, Kano with an affordable initial deposit and convenient 24-month installments. Occupancy Permit issued by Kano State Ministry of Land and Physical Planning.";
const IMAGE_PATH = "/images/lambu-estate-aerial.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/lambu-estate",
    siteName: "M.I. Real Estate & General Enterprises Ltd",
    type: "website",
    images: [
      {
        url: IMAGE_PATH,
        width: 1503,
        height: 1047,
        alt: "Aerial view of Lambu Government Layout estate development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE_PATH],
  },
};

export default function LambuEstateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
