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
  avatarUrl?: string;
  avatarBadge?: "auto" | "job_ready" | "in_verification" | "none";
  resumeUrl: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: number;
  resumeText?: string;
  resumePdfDataUrl?: string;
  atsScore?: number;
  atsRating?: "Needs Work" | "Good" | "Strong" | "Excellent";
  atsSummary?: string;
  atsAnalyzedAt?: number;
  skills: string[];
  candidateKey?: string;          // Unique registry key e.g. ML-3F8A2C1D
  targetRoles?: string[];         // e.g. ["Full-Stack Engineer", "Backend Developer"]
  preferredLocations?: string[];  // e.g. ["Remote", "Bangalore", "Hyderabad"]
  workPreference?: "Remote" | "Hybrid" | "On-site" | "Flexible";
  availability?: string;          // e.g. "Immediate", "15 Days", "1 Month"
  expectedSalary?: string;        // e.g. "₹8-12 LPA", "$90,000/yr"
  bio?: string;                   // Brief professional summary
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

// Module-level in-memory cache to avoid redundant Firestore reads within the same session.
// TTL: 60 seconds — short enough to reflect profile edits, long enough to prevent spam reads.
const profileCache = new Map<string, { data: CandidateProfile; ts: number }>();
const PROFILE_CACHE_TTL_MS = 60_000;

export const invalidateCandidateProfileCache = (uid: string) => {
  profileCache.delete(uid);
};

export const fetchCandidateProfile = async (uid: string): Promise<CandidateProfile | null> => {
  // Return cached value if still fresh
  const cached = profileCache.get(uid);
  if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL_MS) {
    return cached.data;
  }

  const docRef = doc(db, "candidates", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as CandidateProfile;
    profileCache.set(uid, { data, ts: Date.now() });
    return data;
  }

  // Fallback for legacy profiles saved in the users collection
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    // If it has profile fields like college or branch, treat it as a profile
    if (userData.college || userData.skills) {
      const data = userData as CandidateProfile;
      profileCache.set(uid, { data, ts: Date.now() });
      return data;
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
  // Invalidate cache so the next read fetches fresh data
  invalidateCandidateProfileCache(uid);
};
