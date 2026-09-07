// lib/firebase/home.ts
// Stats and public candidate data are fetched via server API routes to avoid
// client-side Firestore permission errors on unauthenticated reads.

export interface PlatformStats {
  registeredCandidates: number;
  activeEmployers: number;
  verifiedProfiles: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) throw new Error("Stats API unavailable");
    return await res.json();
  } catch {
    return { registeredCandidates: 0, activeEmployers: 0, verifiedProfiles: 0 };
  }
}

export async function getVerifiedCandidates(): Promise<any[]> {
  try {
    const res = await fetch("/api/public/candidates", { cache: "no-store" });
    if (!res.ok) throw new Error("Public candidates API unavailable");
    const data = await res.json();
    return data.candidates || [];
  } catch {
    return [];
  }
}
