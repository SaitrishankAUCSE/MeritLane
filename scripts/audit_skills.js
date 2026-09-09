const dotenv = require('dotenv');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
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

// Fix: The Firestore database in this GCP project is named "default", not "(default)"
const db = getFirestore(app, 'default');

async function main() {
  const snapshot = await db.collection('candidates').get();
  console.log(`\n======================================================`);
  console.log(`FIRESTORE SKILL FREQUENCY AUDIT (REAL DATA)`);
  console.log(`Total Candidate Profiles Analyzed: ${snapshot.size}`);
  console.log(`======================================================\n`);

  const skillProfileCounts = {};
  const rawSkillCounts = {};
  const verifiedSkillCounts = {};
  const candidateList = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const candidateSkills = data.skills || [];
    const verified = data.verifiedSkills || {};

    candidateList.push({
      id: doc.id,
      name: data.name || 'Unnamed',
      skills: candidateSkills,
      verifiedSkills: Object.keys(verified)
    });

    // Track verified skills
    for (const vSkill of Object.keys(verified)) {
      const normalized = vSkill.toLowerCase().trim();
      verifiedSkillCounts[normalized] = (verifiedSkillCounts[normalized] || 0) + 1;
    }

    // Track unique declared skills per candidate profile
    const seenForThisCandidate = new Set();
    for (const skill of candidateSkills) {
      if (!skill || typeof skill !== 'string') continue;
      const raw = skill.trim();
      const normalized = raw.toLowerCase();

      rawSkillCounts[raw] = (rawSkillCounts[raw] || 0) + 1;

      if (!seenForThisCandidate.has(normalized)) {
        seenForThisCandidate.add(normalized);
        skillProfileCounts[normalized] = (skillProfileCounts[normalized] || 0) + 1;
      }
    }
  });

  // Sort by profile frequency descending
  const sortedSkills = Object.entries(skillProfileCounts).sort((a, b) => b[1] - a[1]);

  console.log(`DISTINCT SKILLS FREQUENCY TABLE (Ranked by Candidate Demand):`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`| Rank | Skill / Technology      | Profiles Count | Verified Count |`);
  console.log(`----------------------------------------------------------------------`);

  sortedSkills.forEach(([skill, count], index) => {
    const verified = verifiedSkillCounts[skill] || 0;
    const rank = String(index + 1).padEnd(4);
    const name = skill.padEnd(23);
    const countStr = String(count).padEnd(14);
    const verifiedStr = String(verified).padEnd(14);
    console.log(`| ${rank} | ${name} | ${countStr} | ${verifiedStr} |`);
  });
  console.log(`----------------------------------------------------------------------`);

  console.log(`\nDetailed breakdown per candidate:`);
  candidateList.forEach((c, idx) => {
    console.log(`[${idx + 1}] ${c.id.slice(0, 10)}... (${c.name}): [${c.skills.join(', ')}] | Verified: [${c.verifiedSkills.join(', ')}]`);
  });
}

main().catch(err => {
  console.error("Audit failed:", err);
  process.exit(1);
});
