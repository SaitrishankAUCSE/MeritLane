import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { GlobalAuthModal } from "@/components/ui/AuthModal";
import { PostHogProvider } from "@/providers/PostHogProvider";
import NextTopLoader from "nextjs-toploader";

// Primary UI font — DM Sans: humanist, warm, reads naturally at every weight
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Serif font for authoritative headings
const loraSerif = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

// Code & technical data — assessment editor, hashes, timestamps
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
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
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${jetbrainsMono.variable} ${loraSerif.variable} h-full antialiased`}>
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
        <PostHogProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Navbar />
              <NextTopLoader color="#1C1917" height={3} showSpinner={false} />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <SiteFooter />
              <GlobalAuthModal />
            </ThemeProvider>
          </AuthProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
