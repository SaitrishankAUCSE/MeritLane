import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function getAdminApp(): App | null {
  if (getApps().length) {
    return getApps()[0];
  }

  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!rawKey) {
      console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable");
      return null;
    }

    let serviceAccount: any;
    try {
      serviceAccount = JSON.parse(rawKey);
    } catch {
      try {
        const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (b64Err) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON or Base64", b64Err);
        return null;
      }
    }

    if (serviceAccount && serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error", error);
    return null;
  }
}

const app = getAdminApp();

export const adminDb: Firestore | null = app ? getFirestore(app) : null;
export const adminAuth: Auth | null = app ? getAuth(app) : null;
