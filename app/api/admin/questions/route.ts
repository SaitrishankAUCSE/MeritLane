import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    if (!adminAuth) throw new Error("Firebase admin not initialized");
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userRecord = await adminAuth.getUser(decodedToken.uid);
  const isAdmin = userRecord.email?.toLowerCase() === ADMIN_EMAIL || decodedToken.admin === true;
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await req.json();
  const { type, skill, data } = payload; // type: "mcq" | "coding"

  if (!type || !skill || !data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }
  const bankRef = adminDb.collection("questionBank").doc(slug);
  const subcollection = type === "mcq" ? "mcqs" : "coding";
  
  const newDocRef = bankRef.collection(subcollection).doc();
  const id = newDocRef.id;

  const docData = {
    ...data,
    id,
    skill: slug,
    status: "live",
    addedBy: decodedToken.email,
    addedAt: FieldValue.serverTimestamp()
  };

  const batch = adminDb.batch();
  batch.set(newDocRef, docData);
  
  // Ensure the parent bank document exists and tracks updates
  batch.set(bankRef, {
    skill: slug,
    displayName: skill,
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });

  await batch.commit();

  return NextResponse.json({ success: true, id });
}
