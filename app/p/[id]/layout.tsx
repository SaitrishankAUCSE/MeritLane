import { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";

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
        title: "Profile Not Found | Meritlane",
        description: "This verified engineering profile could not be found or is no longer public.",
      };
    }

    const candidate = candidateDoc.data()!;
    const user = userDoc.data() || {};
    
    const name = candidate.name || user.displayName || "Verified Engineer";
    const title = `${name} | Verified Software Engineer | Meritlane`;
    const description = `View ${name}'s verified engineering track record, project portfolio, and technical assessment scores on Meritlane.`;

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
            url: "/images/verification-preview.jpg", // Replace with dynamic OG image if available later
            width: 1200,
            height: 630,
            alt: `${name} - Verified Engineer on Meritlane`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (err) {
    return {
      title: "Verified Engineer | Meritlane",
      description: "View this verified engineering track record on Meritlane.",
    };
  }
}

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
