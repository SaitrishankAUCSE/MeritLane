/**
 * Meritlane Admin Custom Claim Provisioning Script
 * 
 * PURPOSE:
 * Secure, offline administrative script to set the custom claim `{ admin: true }`
 * on the designated administrator Firebase Authentication account.
 * 
 * USAGE:
 * FIREBASE_SERVICE_ACCOUNT_KEY='{...}' node scripts/set-admin-claim.mjs
 * OR
 * node scripts/set-admin-claim.mjs [path-to-service-account.json]
 * 
 * SECURITY:
 * - This script is intended to be executed manually and locally by the project administrator only.
 * - It must never be exposed via Next.js API routes or bundled into the client application.
 * - Does not store or require any passwords.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAIL = 'saitrishankb9@gmail.com';

async function provisionAdminClaim() {
  console.log(`[Meritlane Admin Provisioning] Starting admin claim setup for: ${ADMIN_EMAIL}`);

  let serviceAccount = null;

  // 1. Check environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      console.log('[Auth] Loaded service account from FIREBASE_SERVICE_ACCOUNT_KEY env var.');
    } catch (e) {
      console.error('[Error] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', e.message);
    }
  }

  // 2. Check CLI argument or local file
  if (!serviceAccount && process.argv[2]) {
    const filePath = path.resolve(process.argv[2]);
    if (fs.existsSync(filePath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`[Auth] Loaded service account from file: ${filePath}`);
      } catch (e) {
        console.error(`[Error] Failed to read service account file at ${filePath}:`, e.message);
      }
    }
  }

  if (!serviceAccount) {
    console.error('\n[Error] Missing Firebase Admin credentials.');
    console.error('Please provide FIREBASE_SERVICE_ACCOUNT_KEY environment variable or pass the service account JSON file path:');
    console.error('  node scripts/set-admin-claim.mjs ./service-account.json\n');
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  const auth = getAuth();

  try {
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`[Auth] Found Firebase user: UID=${user.uid}, Email=${user.email}`);

    // Set custom claims
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`[Success] Successfully assigned custom claim { admin: true } to user: ${ADMIN_EMAIL} (UID: ${user.uid})`);

    // Verify claims
    const updatedUser = await auth.getUser(user.uid);
    console.log('[Verification] Updated custom claims:', updatedUser.customClaims);
    console.log('\n[Notice] The administrator must sign out and sign back in (or refresh their ID token) to receive the updated token claims.\n');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n[Error] No Firebase Authentication user found with email: ${ADMIN_EMAIL}`);
      console.error('Please ensure the administrator account has signed up or been created in Firebase Auth before running this script.\n');
    } else {
      console.error('\n[Error] Failed to set custom claims:', error);
    }
    process.exit(1);
  }
}

provisionAdminClaim();
