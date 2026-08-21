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

  const rawCandidate = candidateDoc.data()!;

  // Must be fully verified to be public
  if (rawCandidate.verificationStatus !== "verified") {
    notFound();
  }

  const rawUser = userDoc.exists ? userDoc.data()! : {};

  // Deep clone to strip Firestore Timestamps and classes before passing to client component
  const candidate = JSON.parse(JSON.stringify(rawCandidate, (key, value) => 
    value && typeof value === 'object' && value.toDate ? value.toDate().toISOString() : value
  ));
  
  const user = JSON.parse(JSON.stringify(rawUser, (key, value) => 
    value && typeof value === 'object' && value.toDate ? value.toDate().toISOString() : value
  ));

  return <PublicProofRecord id={id} candidate={candidate} user={user} />;
}
