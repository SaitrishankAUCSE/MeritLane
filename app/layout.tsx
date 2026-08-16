import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meritlane | Verified, Project-Based Engineering Hiring",
  description:
    "A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent. Proof of skill over college pedigree.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row sm:px-6">
            <p>© {new Date().getFullYear()} Meritlane. Proof of skill over college pedigree.</p>
            <div className="flex gap-6">
              <span className="text-zinc-400">Strictly Verified Hiring</span>
              <span className="text-zinc-400">Data-Driven Outcomes</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
