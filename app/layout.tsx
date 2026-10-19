import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { GlobalAuthModal } from "@/components/ui/AuthModal";
import { PostHogProvider } from "@/providers/PostHogProvider";
import NextTopLoader from "nextjs-toploader";

// Primary professional font — Inter: clean, modern, and high-readability across all devices
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Fallback / legacy serif (retained so user can undo anytime in 1 line)
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
  title: "MeritLane | Skill-Verified Technical Hiring for Freshers & Early Talent",
  description:
    "MeritLane levels the playing field for fresh graduates and early-career software developers struggling with entry-level experience requirements. Verified coding benchmarks that land direct interviews.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "MeritLane | Skill-Verified Technical Hiring for Freshers & Early Talent",
    description: "MeritLane levels the playing field for fresh graduates and early-career software developers struggling with entry-level experience requirements. Verified coding benchmarks that land direct interviews.",
    url: "https://merit-lane.vercel.app",
    siteName: "Meritlane",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeritLane | Skill-Verified Technical Hiring for Freshers & Early Talent",
    description: "MeritLane levels the playing field for fresh graduates and early-career software developers struggling with entry-level experience requirements. Verified coding benchmarks that land direct interviews.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://merit-lane.vercel.app";

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${loraSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Meritlane",
              "url": siteUrl,
              "description": "A verified, project-based hiring platform for engineering talent.",
              "logo": `${siteUrl}/icon.png`
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
