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

    const { githubToken } = await req.json();
    if (!githubToken) {
      return NextResponse.json({ error: "GitHub token missing" }, { status: 400 });
    }

    // 1. Fetch GitHub User Profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub profile" }, { status: 400 });
    }

    const userData = await userRes.json();
    const githubUsername = userData.login;

    // 2. Fetch User's Repositories
    const reposRes = await fetch("https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let repos = [];
    if (reposRes.ok) {
      repos = await reposRes.json();
    }

    // Aggregate metrics
    let repoCount = repos.length;
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
      .map(entry => entry[0]);

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
