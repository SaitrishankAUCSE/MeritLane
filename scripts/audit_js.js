const dotenv = require('dotenv');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

let serviceAccount;
const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
try {
  serviceAccount = JSON.parse(rawKey);
} catch(e) {
  try {
    const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } catch(err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err);
    process.exit(1);
  }
}

if (!serviceAccount) {
  console.error("No service account found in .env.local");
  process.exit(1);
}

const app = getApps().length ? getApps()[0] : initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app, 'default');

async function main() {
  console.log("Fetching questions from DB (database 'default')...");
  const snapshot = await db.collection('questions').get();
  const skills = new Set();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.skill) {
      skills.add(data.skill.toLowerCase());
    }
  });

  console.log(`Found ${skills.size} unique skills in questions collection.`);
  console.log("Skills:", Array.from(skills));
}

main().catch(console.error);
