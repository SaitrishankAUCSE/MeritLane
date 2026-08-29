import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  skills: string[];
  experienceLevel: string;
  status: "active" | "draft";
}

export interface EmployerProfile {
  roles: JobPosting[];
  shortlistedCandidates?: string[];
  pipeline?: Record<string, "shortlisted" | "interviewing" | "offer" | "hired" | "rejected">;
  updatedAt: number;
}

export const fetchEmployerProfile = async (uid: string): Promise<EmployerProfile | null> => {
  const docRef = doc(db, "employers", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as EmployerProfile;
  }
  return null;
};

export const saveEmployerProfile = async (uid: string, profile: Partial<EmployerProfile>) => {
  const docRef = doc(db, "employers", uid);
  await setDoc(docRef, { ...profile, updatedAt: Date.now() }, { merge: true });
};

export const toggleShortlist = async (uid: string, candidateUid: string, currentShortlist: string[] = []) => {
  const isShortlisted = currentShortlist.includes(candidateUid);
  let newShortlist = [...currentShortlist];
  
  if (isShortlisted) {
    newShortlist = newShortlist.filter(id => id !== candidateUid);
  } else {
    newShortlist.push(candidateUid);
  }

  await saveEmployerProfile(uid, { shortlistedCandidates: newShortlist });
  return newShortlist;
};
