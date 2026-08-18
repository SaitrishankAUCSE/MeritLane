import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(request: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Firebase Admin not initialized." }, { status: 400 });
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
      
      const uidsToDelete = listUsersResult.users
        .filter(u => u.email?.toLowerCase() !== ADMIN_EMAIL)
        .map(u => u.uid);

      if (uidsToDelete.length > 0) {
        const deleteResult = await adminAuth.deleteUsers(uidsToDelete);
        deletedAuthCount += deleteResult.successCount;
      }
    } while (pageToken);

    // Helper to delete collection in chunks of 500
    const deleteCollection = async (collectionName: string, filterByEmail: boolean = false) => {
      if (!adminDb) return 0;
      const snapshot = await adminDb.collection(collectionName).get();
      let count = 0;
      const chunks = [];
      let currentChunk = adminDb.batch();
      let currentChunkSize = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!filterByEmail || data.email?.toLowerCase() !== ADMIN_EMAIL) {
          currentChunk.delete(doc.ref);
          currentChunkSize++;
          count++;

          if (currentChunkSize === 500) {
            chunks.push(currentChunk.commit());
            currentChunk = adminDb!.batch();
            currentChunkSize = 0;
          }
        }
      });

      if (currentChunkSize > 0) {
        chunks.push(currentChunk.commit());
      }
      
      await Promise.all(chunks);
      return count;
    };

    deletedFirestoreUsers = await deleteCollection("users", true);
    deletedCandidates = await deleteCollection("candidates", false);
    deletedEmployers = await deleteCollection("employers", false);

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
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 400 });
  }
}
