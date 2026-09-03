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
  score?: number;
}

export interface GithubEvidence {
  totalCommits: number;
  repoCount: number;
  topLanguages: string[];
  lastSynced: number;
  githubUsername: string;
}

export interface CandidateProfile {
  name: string;
  email?: string;
  college: string;
  degree?: string;
  branch: string;
  gradYear: string;
  githubUrl: string;
  resumeUrl: string;
  resumeText?: string;
  atsScore?: number;
  atsRating?: "Needs Work" | "Good" | "Strong" | "Excellent";
  atsSummary?: string;
  atsAnalyzedAt?: number;
  skills: string[];
  candidateKey?: string;          // Unique registry key e.g. ML-3F8A2C1D
  verifiedSkills?: Record<string, SkillVerification>;
  projects: ProjectEntry[];
  githubEvidence?: GithubEvidence;
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

const generateCandidateKey = (): string => {
  const hex = () => Math.floor(Math.random() * 16).toString(16).toUpperCase();
  return `ML-${Array.from({ length: 8 }, hex).join("")}`;
};

export const saveCandidateProfile = async (uid: string, profile: Partial<CandidateProfile>) => {
  const docRef = doc(db, "candidates", uid);

  // Auto-generate a unique candidate key for brand-new profiles
  let candidateKey = profile.candidateKey;
  if (!candidateKey) {
    const existing = await getDoc(docRef);
    if (!existing.exists() || !existing.data()?.candidateKey) {
      candidateKey = generateCandidateKey();
    } else {
      candidateKey = existing.data()!.candidateKey;
    }
  }

  await setDoc(docRef, { ...profile, candidateKey, updatedAt: Date.now() }, { merge: true });
};
