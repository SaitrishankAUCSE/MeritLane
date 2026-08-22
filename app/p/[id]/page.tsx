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

  // Deep clone to strip Firestore Timestamps and extract ONLY safe public fields
  // CRITICAL SECURITY FIX: Do not pass the entire document to a Client Component
  // or it will serialize private emails and failed assessment attempts to the browser.
  const parseTimestamp = (val: any) => val && typeof val === "object" && val.toDate ? val.toDate().toISOString() : val;
  
  const candidate = {
    name: rawCandidate.name || "",
    skills: rawCandidate.skills || [],
    projects: rawCandidate.projects || [],
    college: rawCandidate.college || "",
    branch: rawCandidate.branch || "",
    gradYear: rawCandidate.gradYear || "",
    verifiedAt: parseTimestamp(rawCandidate.verifiedAt) || null,
    updatedAt: parseTimestamp(rawCandidate.updatedAt) || null,
  };
  
  const user = {
    photoURL: rawUser.photoURL || "",
  };

  return <PublicProofRecord id={id} candidate={candidate} user={user} />;
}

