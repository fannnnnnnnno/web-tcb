import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { template: "%s | TCB", default: "Web TCB" },
  description: "Combo, Respect, Repeat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
