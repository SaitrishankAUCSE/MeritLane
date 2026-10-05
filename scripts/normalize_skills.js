const dotenv = require('dotenv');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

let serviceAccount;
const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!rawKey) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env.local");
  process.exit(1);
}

try {
  serviceAccount = JSON.parse(rawKey);
} catch (e) {
  try {
    const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err);
    process.exit(1);
  }
}

const app = getApps().length ? getApps()[0] : initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app, 'default');

async function main() {
  const snapshot = await db.collection('candidates').get();
  console.log(`Found ${snapshot.size} candidates.`);

  const batch = db.batch();
  let updateCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    let hasChanges = false;
    
    // Normalize skills array
    let newSkills = data.skills || [];
    let updatedSkills = newSkills.map(s => typeof s === 'string' ? s.toLowerCase() : s);
    // Remove duplicates
    updatedSkills = [...new Set(updatedSkills)];

    if (JSON.stringify(newSkills) !== JSON.stringify(updatedSkills)) {
      hasChanges = true;
    }

    // Normalize verifiedSkills map
    let newVerifiedSkills = {};
    let verifiedSkillsChanged = false;
    if (data.verifiedSkills) {
      for (const [key, value] of Object.entries(data.verifiedSkills)) {
        const lowerKey = key.toLowerCase();
        if (key !== lowerKey) {
          verifiedSkillsChanged = true;
        }
        newVerifiedSkills[lowerKey] = value;
      }
    }

    if (verifiedSkillsChanged) {
      hasChanges = true;
    }

    if (hasChanges) {
      batch.update(doc.ref, {
        skills: updatedSkills,
        ...(verifiedSkillsChanged ? { verifiedSkills: newVerifiedSkills } : {})
      });
      updateCount++;
    }
  });

  if (updateCount > 0) {
    await batch.commit();
    console.log(`Successfully normalized skills for ${updateCount} candidates.`);
  } else {
    console.log('No skills needed normalization.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
