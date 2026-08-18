import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
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
          <footer className="border-t border-slate-200 bg-slate-50 pt-12 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                <div className="col-span-2 lg:col-span-2">
                  <h3 className="text-lg font-bold text-[#1a56db] tracking-tight">Meritlane</h3>
                  <p className="mt-4 text-sm text-slate-500 max-w-xs leading-relaxed">
                    Connecting verified engineering talent with top companies through project-based assessments and proof of skill.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">For Candidates</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li><a href="#" className="hover:text-[#1a56db]">Create Profile</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Browse Jobs</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">How Verification Works</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Career Advice</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Success Stories</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">For Employers</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li><a href="#" className="hover:text-[#1a56db]">Post a Job</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Search Candidates</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Verification API</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Pricing</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Hiring Resources</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Company</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li><a href="#" className="hover:text-[#1a56db]">About Us</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Contact</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-[#1a56db]">Trust & Safety</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Meritlane Inc. All rights reserved.</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <a href="#" className="hover:text-slate-900">Twitter</a>
                  <a href="#" className="hover:text-slate-900">LinkedIn</a>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
