import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export interface ProjectEntry {
  id: string;
  title: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
  supportsClaim?: string;
  skillsUsed?: string[];
}

export type VerificationStatus = "draft" | "pending" | "verified" | "changes_required" | "rejected";

export interface SkillVerification {
  status: "verified" | "failed";
  verifiedAt?: number;
}

export interface CandidateProfile {
  name: string;
  email?: string;
  college: string;
  branch: string;
  gradYear: string;
  githubUrl: string;
  resumeUrl: string;
  skills: string[];
  verifiedSkills?: Record<string, SkillVerification>;
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

  // Fallback for legacy profiles saved in the users collection
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    // If it has profile fields like college or branch, treat it as a profile
    if (userData.college || userData.skills) {
      return userData as CandidateProfile;
    }
  }

  return null;
};

export const saveCandidateProfile = async (uid: string, profile: Partial<CandidateProfile>) => {
  const docRef = doc(db, "candidates", uid);
  await setDoc(docRef, { ...profile, updatedAt: Date.now() }, { merge: true });
};
