import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!rawKey) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env.local");
  process.exit(1);
}

let sa;
try {
  sa = JSON.parse(rawKey);
} catch {
  sa = JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'));
}

const app = initializeApp({
  credential: cert(sa)
});

const auth = getAuth(app);
const db = getFirestore(app, 'default');

async function removeAllUsers() {
  console.log("=== REMOVING ALL USERS FROM MERITLANE ===");

  // 1. Delete all Firebase Auth users
  console.log("1. Deleting all users from Firebase Auth...");
  let deletedAuthCount = 0;
  let pageToken;
  do {
    const listRes = await auth.listUsers(1000, pageToken);
    pageToken = listRes.pageToken;
    for (const user of listRes.users) {
      try {
        await auth.deleteUser(user.uid);
        console.log(`  ✓ Deleted Auth user: ${user.uid} (${user.email || 'no email'})`);
        deletedAuthCount++;
      } catch (err) {
        console.error(`  ✗ Failed to delete Auth user ${user.uid}:`, err.message);
      }
    }
  } while (pageToken);

  console.log(`Total Firebase Auth users deleted: ${deletedAuthCount}`);

  // 2. Helper to delete collection documents in batches
  async function deleteCollection(name) {
    console.log(`2. Deleting all documents in collection: '${name}'...`);
    const snap = await db.collection(name).get();
    if (snap.empty) {
      console.log(`  Collection '${name}' is already empty.`);
      return 0;
    }

    let deletedCount = 0;
    const batchSize = 400;
    let batch = db.batch();
    let currentBatchSize = 0;

    for (const doc of snap.docs) {
      batch.delete(doc.ref);
      currentBatchSize++;
      deletedCount++;

      if (currentBatchSize >= batchSize) {
        await batch.commit();
        batch = db.batch();
        currentBatchSize = 0;
      }
    }

    if (currentBatchSize > 0) {
      await batch.commit();
    }

    console.log(`  ✓ Deleted ${deletedCount} documents from '${name}'.`);
    return deletedCount;
  }

  const deletedUsers = await deleteCollection('users');
  const deletedCandidates = await deleteCollection('candidates');
  const deletedEmployers = await deleteCollection('employers');
  const deletedApplications = await deleteCollection('jobApplications');
  const deletedMessages = await deleteCollection('messages');

  // 3. Verification check
  console.log("\n=== VERIFYING ZERO USERS REMAINING ===");
  const authVerify = await auth.listUsers(10);
  const usersVerify = await db.collection('users').get();
  const candidatesVerify = await db.collection('candidates').get();
  const employersVerify = await db.collection('employers').get();

  console.log(`Remaining Firebase Auth users: ${authVerify.users.length}`);
  console.log(`Remaining Firestore /users: ${usersVerify.size}`);
  console.log(`Remaining Firestore /candidates: ${candidatesVerify.size}`);
  console.log(`Remaining Firestore /employers: ${employersVerify.size}`);

  if (
    authVerify.users.length === 0 &&
    usersVerify.size === 0 &&
    candidatesVerify.size === 0 &&
    employersVerify.size === 0
  ) {
    console.log("\n✅ ALL USERS REMOVED SUCCESSFULLY. WEBSITE HAS EXACTLY ZERO USERS.");
  } else {
    console.warn("\n⚠️ Some user records still remain. Please check logs.");
  }
}

removeAllUsers().catch((err) => {
  console.error("Error executing user wipe:", err);
  process.exit(1);
});
