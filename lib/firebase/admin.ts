import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

function getAdminApp(): App | null {
  if (getApps().length) {
    return getApps()[0];
  }

  try {
    let serviceAccount: any;
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (rawKey) {
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
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
      };
    } else {
      console.error("Missing Firebase Admin environment variables. Need either FIREBASE_SERVICE_ACCOUNT_KEY or (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
      return null;
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

export const adminDb: Firestore | null = app ? getFirestore(app, "default") : null;
export const adminAuth: Auth | null = app ? getAuth(app) : null;
