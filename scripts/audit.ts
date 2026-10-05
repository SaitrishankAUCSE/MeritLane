import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import { adminDb } from '../lib/firebase/admin';

async function main() {
  if (!adminDb) {
    console.error('No adminDb');
    return;
  }

  // 1. Get unique skills from Firestore
  const questionsSnapshot = await adminDb.collection('questions').get();
  const skills = new Set<string>();
  let questionCount = 0;
  
  questionsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.skill) {
      skills.add(data.skill.toLowerCase());
      questionCount++;
    }
  });

  console.log(`Found ${questionCount} total questions across ${skills.size} unique skills.`);
  console.log('Skills from DB:', Array.from(skills).sort());

  // 2. Fetch Godbolt supported languages
  const godboltRes = await fetch('https://godbolt.org/api/languages');
  const godboltLangs = await godboltRes.json();
  
  console.log('\n--- Godbolt Supported Languages ---');
  // Just collect the names and ids
  const godboltIds = new Set(godboltLangs.map((l: any) => l.id.toLowerCase()));
  const godboltNames = new Set(godboltLangs.map((l: any) => l.name.toLowerCase()));
  
  console.log(`Godbolt has ${godboltLangs.length} languages.`);

  console.log('\n--- Intersection Analysis ---');
  for (const skill of Array.from(skills).sort()) {
    let supported = godboltIds.has(skill) || godboltNames.has(skill);
    // Add common aliases
    if (!supported) {
       if (skill === 'c++') supported = godboltIds.has('c++') || godboltIds.has('cpp');
       if (skill === 'c#') supported = godboltIds.has('csharp') || godboltIds.has('c#');
       if (skill === 'node.js') supported = godboltIds.has('javascript') || godboltIds.has('typescript');
       if (skill === 'javascript') supported = godboltIds.has('javascript');
       if (skill === 'react') supported = godboltIds.has('javascript') || godboltIds.has('typescript');
       if (skill === 'html/css') supported = false; // godbolt does compile some things but not HTML/CSS in the same way
    }
    console.log(`- ${skill}: ${supported ? 'SUPPORTED' : 'UNSUPPORTED'}`);
  }
}

main().catch(console.error);
