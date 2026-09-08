import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const body = await req.json();
    const { role } = body;

    if (!role || (role !== "candidate" && role !== "employer")) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    await userRef.set({
      email: decodedToken.email || "",
      displayName: decodedToken.name || "",
      role: role,
      authProvider: "google",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }, { merge: true });

    if (role === "candidate") {
      const candidateRef = adminDb.collection("candidates").doc(uid);
      const candDoc = await candidateRef.get();
      if (!candDoc.exists) {
        await candidateRef.set({
          name: decodedToken.name || "",
          email: decodedToken.email || "",
          verificationStatus: "draft",
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    }

    return NextResponse.json({ success: true, role }, { status: 200 });
  } catch (error: any) {
    console.error("Error setting role:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
