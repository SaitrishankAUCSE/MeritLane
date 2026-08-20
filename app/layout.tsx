import type { Metadata } from "next";
import { Hanken_Grotesk, Source_Serif_4, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://meritlane.app"),
  title: "Meritlane | Verified, Project-Based Engineering Hiring",
  description:
    "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India. Proof of skill over college pedigree.",
  openGraph: {
    title: "Meritlane | Verified, Project-Based Engineering Hiring",
    description: "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India. Proof of skill over college pedigree.",
    url: "https://meritlane.app",
    siteName: "Meritlane",
    images: [
      {
        url: "/images/verification-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Meritlane Verified Engineering Hiring",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meritlane | Verified, Project-Based Engineering Hiring",
    description: "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India. Proof of skill over college pedigree.",
    images: ["/images/verification-preview.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${hanken.variable} ${sourceSerif.variable} ${jetbrains.variable} h-full antialiased`}>
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
          <Navbar />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
