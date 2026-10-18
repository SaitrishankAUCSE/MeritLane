import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function deployRules() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env.local');
  }

  let sa;
  try {
    sa = JSON.parse(rawKey);
  } catch {
    const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
    sa = JSON.parse(decoded);
  }

  const projectId = sa.project_id || 'meritlane';
  console.log(`Authenticating as ${sa.client_email} for project ${projectId}...`);

  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [
      'https://www.googleapis.com/auth/firebase',
      'https://www.googleapis.com/auth/cloud-platform'
    ]
  });

  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error('Failed to retrieve access token');
  }

  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  console.log(`Creating ruleset from ${rulesPath}...`);
  const createRulesetRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: rulesContent
            }
          ]
        }
      })
    }
  );

  const rulesetData = await createRulesetRes.json();
  if (!createRulesetRes.ok) {
    console.error('Failed to create ruleset:', rulesetData);
    process.exit(1);
  }

  console.log(`Created ruleset: ${rulesetData.name}`);

  const releaseName = `projects/${projectId}/releases/cloud.firestore/default`;
  console.log(`Releasing ruleset to ${releaseName}...`);

  const patchReleaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/${releaseName}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        release: {
          name: releaseName,
          rulesetName: rulesetData.name
        }
      })
    }
  );

  const releaseData = await patchReleaseRes.json();
  if (!patchReleaseRes.ok) {
    console.error('Failed to update release:', releaseData);
    process.exit(1);
  }

  console.log('✅ Successfully deployed Firestore security rules!');
  console.log(`Release: ${releaseData.name}`);
  console.log(`Active Ruleset: ${releaseData.rulesetName}`);
  console.log(`Updated at: ${releaseData.updateTime}`);
}

deployRules().catch(err => {
  console.error('Deployment error:', err);
  process.exit(1);
});
