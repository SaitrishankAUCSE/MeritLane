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

    if (!candidateDoc?.exists && !userDoc?.exists) {
      return {
        title: "Record Not Found | Meritlane",
        description: "This published technical proof could not be found or is no longer public.",
      };
    }

    const candidate = candidateDoc?.exists ? candidateDoc.data()! : {};
    const user = userDoc?.exists ? userDoc.data()! : {};
    const name = candidate.name || user.displayName || "Engineering Candidate";
    const isVerified =
      candidate.verificationStatus === "verified" ||
      Object.values(candidate.verifiedSkills || {}).some(
        (s: any) => (s as any)?.status === "verified"
      );

    const assessmentKeys = user.assessmentScores ? Object.keys(user.assessmentScores) : [];
    const publicationTitle = isVerified
      ? derivePublicationTitle({ assessmentKeys })
      : `${name} — Engineering Profile`;
    const title = `${publicationTitle} | Meritlane`;
    const description = isVerified
      ? `Published technical proof for ${name} on Meritlane.`
      : `Engineering portfolio and skills profile for ${name} on Meritlane.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        siteName: "Meritlane",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: "Candidate Profile | Meritlane",
      description: "Technical profile and proof record on Meritlane.",
    };
  }
}

export default function PublicProofLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${sourceSerif.variable} min-h-screen bg-[#F8F6F3] text-[#1C1917]`}>
      {children}
    </div>
  );
}
