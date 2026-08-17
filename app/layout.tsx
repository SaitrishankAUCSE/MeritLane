import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${merriweather.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#FBF8F1] font-sans text-[#0A192F]">
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
          <footer className="border-t border-zinc-200 bg-white py-8">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row sm:px-6">
              <p>&copy; 2026 Meritlane. Proof of skill over college pedigree.</p>
              <div className="flex gap-6">
                <span className="text-zinc-400">Verified Hiring</span>
                <span className="text-zinc-400">Data-Driven Outcomes</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
