import React from "react";
import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  let candidateDoc;
  let userDoc;

  try {
    candidateDoc = await adminDb!.collection("candidates").doc(id).get();
    userDoc = await adminDb!.collection("users").doc(id).get();
  } catch (err) {
    console.error("Error fetching public profile:", err);
    notFound();
  }

  if (!candidateDoc.exists) {
    notFound();
  }

  const candidate = candidateDoc.data()!;

  // Must be fully verified to be public
  if (candidate.verificationStatus !== "verified") {
    notFound();
  }

  const user = userDoc.exists ? userDoc.data()! : {};

  return <PublicProofRecord id={id} candidate={candidate} user={user} />;
}
