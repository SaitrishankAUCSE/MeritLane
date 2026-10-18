import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Missing authorization token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    
    if (!adminAuth || !adminDb) {
      // If admin SDK is not configured in this environment, client-side fallback will run
      return NextResponse.json({ 
        success: true, 
        message: "Admin SDK not present, proceeding with client-side deletion fallback." 
      });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: "Invalid session token: " + err.message }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // 1. Delete Candidate profile document if exists
    try {
      await adminDb.collection("candidates").doc(uid).delete();
    } catch (err) {
      console.warn("Failed to delete candidate document:", err);
    }

    // 2. Delete User profile document if exists
    try {
      await adminDb.collection("users").doc(uid).delete();
    } catch (err) {
      console.warn("Failed to delete user document:", err);
    }

    // 3. Delete from Firebase Authentication
    try {
      await adminAuth.deleteUser(uid);
    } catch (err) {
      console.warn("Failed to delete user from Firebase Auth:", err);
    }

    return NextResponse.json({ success: true, message: "Account and profile deleted successfully." });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete account" }, { status: 500 });
  }
}
