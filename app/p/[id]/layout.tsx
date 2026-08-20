import type { ReactNode } from "react";
import { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import { adminDb } from "@/lib/firebase/admin";
import { derivePublicationTitle } from "@/components/public-record/publication";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-proof-serif",
  display: "swap",
});

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const candidateDoc = await adminDb!.collection("candidates").doc(id).get();
    const userDoc = await adminDb!.collection("users").doc(id).get();

    if (!candidateDoc.exists || candidateDoc.data()?.verificationStatus !== "verified") {
      return {
        title: "Record Not Found | Meritlane",
        description: "This published technical proof could not be found or is no longer public.",
      };
    }

    const candidate = candidateDoc.data()!;
    const user = userDoc.data() || {};
    const name = candidate.name || user.displayName || "Verified Engineer";
    const assessmentKeys = user.assessmentScores ? Object.keys(user.assessmentScores) : [];
    const publicationTitle = derivePublicationTitle({
      assessmentKeys,
    });
    const title = `${publicationTitle} | Meritlane`;
    const description = `Published technical proof for ${name} on Meritlane.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        siteName: "Meritlane",
        images: [
          {
            url: "/images/verification-preview.jpg",
            width: 1200,
            height: 630,
            alt: `${name} — published technical proof on Meritlane`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Published Technical Proof | Meritlane",
      description: "View this published technical proof on Meritlane.",
    };
  }
}

export default function PublicProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={`${sourceSerif.variable} font-[family-name:var(--font-sans)]`}>{children}</div>;
}
