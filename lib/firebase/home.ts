import { collection, getDocs, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "./config";
import { CandidateProfile } from "./candidate";

export async function getPlatformStats() {
  const usersRef = collection(db, "users");
  const candidatesRef = collection(db, "candidates");
  
  try {
    const [candidateCount, employerCount, verifiedCount] = await Promise.all([
      getCountFromServer(query(usersRef, where("role", "==", "candidate"))),
      getCountFromServer(query(usersRef, where("role", "==", "employer"))),
      getCountFromServer(query(candidatesRef, where("verificationStatus", "==", "verified")))
    ]);

    return {
      registeredCandidates: candidateCount.data().count,
      activeEmployers: employerCount.data().count,
      verifiedProfiles: verifiedCount.data().count,
    };
  } catch (err) {
    console.error("Error fetching stats:", err);
    return {
      registeredCandidates: 0,
      activeEmployers: 0,
      verifiedProfiles: 0,
    };
  }
}

export async function getVerifiedCandidates(): Promise<(CandidateProfile & { id: string })[]> {
  try {
    const candidatesRef = collection(db, "candidates");
    const q = query(candidatesRef, where("verificationStatus", "==", "verified"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CandidateProfile & { id: string }));
  } catch (err) {
    console.error("Error fetching verified candidates:", err);
    return [];
  }
}
