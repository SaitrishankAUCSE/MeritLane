import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { githubToken, githubUsername: reqUsername, githubUrl } = body;

    let githubUsername = reqUsername;
    if (!githubUsername && githubUrl) {
      try {
        const clean = githubUrl.trim().replace(/\/+$/, "");
        const parts = clean.split("/");
        githubUsername = parts[parts.length - 1];
      } catch {
        /* ignore */
      }
    }

    if (!githubToken && !githubUsername) {
      return NextResponse.json({ error: "Please provide a GitHub username or connect your GitHub profile." }, { status: 400 });
    }

    let userData: any = null;
    let repos: any[] = [];

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MeritLane-Engineering-Verification"
    };
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    if (githubToken) {
      // 1. Fetch Authenticated GitHub User Profile
      const userRes = await fetch("https://api.github.com/user", { headers });
      if (!userRes.ok) {
        return NextResponse.json({ error: "Failed to fetch GitHub profile with the provided token." }, { status: 400 });
      }
      userData = await userRes.json();
      githubUsername = userData.login;

      // 2. Fetch User's Repositories
      const reposRes = await fetch("https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator&sort=updated", { headers });
      if (reposRes.ok) {
        repos = await reposRes.json();
      }
    } else {
      // Direct Public GitHub API Fetch (No OAuth login required)
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(githubUsername)}`, { headers });
      if (!userRes.ok) {
        if (userRes.status === 404) {
          return NextResponse.json({ error: `GitHub user "${githubUsername}" not found. Please verify your GitHub URL.` }, { status: 404 });
        }
        return NextResponse.json({ error: "GitHub rate limit exceeded or profile unreachable. Please try again shortly." }, { status: 400 });
      }
      userData = await userRes.json();
      githubUsername = userData.login;

      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100&sort=updated`, { headers });
      if (reposRes.ok) {
        repos = await reposRes.json();
      }
    }

    // Aggregate metrics
    const repoCount = userData?.public_repos ?? repos.length;
    let totalCommits = 0; 
    const languageMap: Record<string, number> = {};

    for (const repo of repos) {
      totalCommits += repo.size || 0;

      if (repo.language) {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Update Firestore
    const candidateRef = adminDb.collection("candidates").doc(decodedToken.uid);
    
    const githubEvidence = {
      githubUsername,
      repoCount,
      totalCommits: Math.floor(totalCommits / 100) + repos.length * 5, 
      topLanguages,
      lastSynced: Date.now()
    };

    await candidateRef.set({
      githubEvidence,
      updatedAt: Date.now()
    }, { merge: true });

    return NextResponse.json({ success: true, githubEvidence });

  } catch (error: any) {
    console.error("Error in github-sync:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
