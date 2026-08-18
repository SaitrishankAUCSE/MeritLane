import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(request: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase Admin not initialized." }, { status: 500 });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Strict admin check
    const user = await adminAuth.getUser(decodedToken.uid);
    if (user.email?.toLowerCase() !== ADMIN_EMAIL && !decodedToken.admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    let deletedAuthCount = 0;
    let deletedFirestoreUsers = 0;
    let deletedCandidates = 0;
    let deletedEmployers = 0;

    // 1. Delete all non-admin users from Firebase Auth
    let pageToken: string | undefined = undefined;
    do {
      const listUsersResult = await adminAuth.listUsers(1000, pageToken);
      pageToken = listUsersResult.pageToken;
      
      for (const authUser of listUsersResult.users) {
        if (authUser.email?.toLowerCase() !== ADMIN_EMAIL) {
          await adminAuth.deleteUser(authUser.uid);
          deletedAuthCount++;
        }
      }
    } while (pageToken);

    // 2. Delete from Firestore 'users' collection
    const usersSnapshot = await adminDb.collection("users").get();
    const batch1 = adminDb.batch();
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email?.toLowerCase() !== ADMIN_EMAIL) {
        batch1.delete(doc.ref);
        deletedFirestoreUsers++;
      }
    });
    if (deletedFirestoreUsers > 0) await batch1.commit();

    // 3. Delete from Firestore 'candidates' collection
    const candidatesSnapshot = await adminDb.collection("candidates").get();
    const batch2 = adminDb.batch();
    candidatesSnapshot.forEach((doc) => {
      batch2.delete(doc.ref);
      deletedCandidates++;
    });
    if (deletedCandidates > 0) await batch2.commit();

    // 4. Delete from Firestore 'employers' collection
    const employersSnapshot = await adminDb.collection("employers").get();
    const batch3 = adminDb.batch();
    employersSnapshot.forEach((doc) => {
      batch3.delete(doc.ref);
      deletedEmployers++;
    });
    if (deletedEmployers > 0) await batch3.commit();

    return NextResponse.json({
      success: true,
      message: "Database wiped successfully.",
      stats: {
        deletedAuthCount,
        deletedFirestoreUsers,
        deletedCandidates,
        deletedEmployers
      }
    });

  } catch (error: any) {
    console.error("Error wiping database:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
