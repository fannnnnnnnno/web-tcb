import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: {
    template: "%s | TCB Bojonegoro",
    default: "TCB – Fighting Game Community Bojonegoro",
  },
  description:
    "Fighting Game Community Bojonegoro (TCB) – komunitas game fighting berbasis di Bojonegoro. Tekken 8, Street Fighter 6, gathering mingguan, dan tournament lokal.",
  keywords: [
    "fighting game community bojonegoro",
    "TCB Bojonegoro",
    "FGC BJN",
    "tekken 8 bojonegoro",
    "street fighter 6 bojonegoro",
    "komunitas game bojonegoro",
    "tournament fighting game bojonegoro",
  ],
  authors: [{ name: "TCB Bojonegoro" }],
  creator: "TCB Bojonegoro",
  metadataBase: new URL("https://web-tcb.vercel.app"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://web-tcb.vercel.app",
    siteName: "TCB Bojonegoro",
    title: "TCB – Fighting Game Community Bojonegoro",
    description:
      "Komunitas game fighting terbesar di Bojonegoro. Tekken 8, SF6, gathering mingguan & tournament.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TCB Fighting Game Community Bojonegoro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TCB – Fighting Game Community Bojonegoro",
    description:
      "Komunitas game fighting terbesar di Bojonegoro. Tekken 8, SF6, gathering mingguan & tournament.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <JsonLd />
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
