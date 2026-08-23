import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono, Playfair_Display, Bodoni_Moda, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://merit-lane.vercel.app"),
  title: "Meritlane | Verified, Project-Based Engineering Hiring",
  description:
    "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India. Proof of skill over college pedigree.",
  openGraph: {
    title: "Meritlane | Verified, Project-Based Engineering Hiring",
    description: "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India. Proof of skill over college pedigree.",
    url: "https://merit-lane.vercel.app",
    siteName: "Meritlane",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meritlane | Verified, Project-Based Engineering Hiring",
    description: "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India. Proof of skill over college pedigree.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${bodoniModa.variable} ${cormorantGaramond.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Meritlane",
              "url": "https://meritlane.app",
              "description": "A verified, project-based hiring platform for engineering talent.",
              "logo": "https://meritlane.app/icon.png"
            })
          }}
        />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
