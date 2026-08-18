import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(request: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ 
      success: false, 
      error: "Firebase Admin not initialized. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in Vercel environment variables." 
    }, { status: 200 });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing authorization header" }, { status: 200 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (tokenErr: any) {
      return NextResponse.json({ success: false, error: `Invalid authentication token: ${tokenErr.message}` }, { status: 200 });
    }
    
    // Strict admin check
    const callerEmail = decodedToken.email?.toLowerCase() || "";
    if (decodedToken.admin !== true) {
      return NextResponse.json({ success: false, error: `Forbidden: Administrative privilege required.` }, { status: 200 });
    }

    let deletedAuthCount = 0;
    let deletedFirestoreUsers = 0;
    let deletedCandidates = 0;
    let deletedEmployers = 0;
    let authError: string | null = null;
    let firestoreError: string | null = null;

    // 1. Delete all non-admin users from Firebase Auth
    try {
      let pageToken: string | undefined = undefined;
      do {
        const listUsersResult = await adminAuth.listUsers(1000, pageToken);
        pageToken = listUsersResult.pageToken;
        
        const nonAdminUsers = listUsersResult.users.filter(
          (u) => u.email?.toLowerCase() !== ADMIN_EMAIL && u.uid !== decodedToken.uid
        );

        for (const targetUser of nonAdminUsers) {
          try {
            await adminAuth.deleteUser(targetUser.uid);
            deletedAuthCount++;
          } catch (delErr: any) {
            console.error(`Failed to delete user ${targetUser.email} (${targetUser.uid}):`, delErr);
            if (!authError) {
              authError = `Failed to delete ${targetUser.email}: ${delErr.message}`;
            }
          }
        }
      } while (pageToken);
    } catch (err: any) {
      console.error("Auth listing/deletion error:", err);
      authError = err.message || "Failed to wipe Auth accounts";
    }

    // 2. Delete Firestore collections in safe batches
    try {
      const deleteCollection = async (collectionName: string, filterByEmail: boolean = false) => {
        if (!adminDb) return 0;
        const snapshot = await adminDb.collection(collectionName).get();
        let count = 0;
        const chunks: Promise<any>[] = [];
        let currentChunk = adminDb.batch();
        let currentChunkSize = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!filterByEmail || data.email?.toLowerCase() !== ADMIN_EMAIL) {
            currentChunk.delete(doc.ref);
            currentChunkSize++;
            count++;

            if (currentChunkSize === 400) {
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
    } catch (err: any) {
      console.error("Firestore deletion error:", err);
      firestoreError = err.message || "Failed to wipe Firestore records";
    }

    const hasErrors = !!authError || !!firestoreError;

    return NextResponse.json({
      success: !hasErrors || (deletedAuthCount > 0 || deletedFirestoreUsers > 0 || deletedCandidates > 0),
      message: hasErrors 
        ? `Partial wipe completed with warnings.`
        : `Database wiped successfully. Zero test users remaining.`,
      stats: {
        deletedAuthCount,
        deletedFirestoreUsers,
        deletedCandidates,
        deletedEmployers
      },
      warnings: hasErrors ? { authError, firestoreError } : null
    }, { status: 200 });

  } catch (error: any) {
    console.error("Unexpected error in wipe-database:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unexpected server error during database wipe" 
    }, { status: 200 });
  }
}
