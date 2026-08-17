import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export interface ProjectEntry {
  id: string;
  title: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
}

export type VerificationStatus = "draft" | "pending" | "verified" | "changes_required" | "rejected";

export interface CandidateProfile {
  name: string;
  email?: string;
  college: string;
  branch: string;
  gradYear: string;
  githubUrl: string;
  resumeUrl: string;
  skills: string[];
  projects: ProjectEntry[];
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  verifiedByUid?: string;
  verifiedByEmail?: string;
  verifiedAt?: number;
  updatedAt: number;
}

export const fetchCandidateProfile = async (uid: string): Promise<CandidateProfile | null> => {
  const docRef = doc(db, "candidates", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as CandidateProfile;
  }
  return null;
};

export const saveCandidateProfile = async (uid: string, profile: Partial<CandidateProfile>) => {
  const docRef = doc(db, "candidates", uid);
  await setDoc(docRef, { ...profile, updatedAt: Date.now() }, { merge: true });
};
