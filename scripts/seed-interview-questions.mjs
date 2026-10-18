import fs from 'node:fs';
import path from 'node:path';
import { adminDb } from '../lib/firebase/admin.js';

async function seedToFirestore() {
  const jsonPath = path.join(process.cwd(), 'lib', 'assessments', 'bank', 'top-interview-500.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('top-interview-500.json not found!');
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const questions = JSON.parse(raw);
  console.log(`Loaded ${questions.length} questions from JSON.`);

  if (!adminDb) {
    console.warn('[Notice] Firestore adminDb is not initialized (missing service account credentials). The local JSON bank will be used as the primary database source.');
    return;
  }

  console.log('Seeding questions into Firestore "interviewQuestionBank" collection in batches...');
  const BATCH_SIZE = 400;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const chunk = questions.slice(i, i + BATCH_SIZE);
    const batch = adminDb.batch();
    for (const q of chunk) {
      const docRef = adminDb.collection('interviewQuestionBank').doc(q.id);
      batch.set(docRef, {
        id: q.id,
        externalId: q.externalId,
        slug: q.slug,
        title: q.title,
        difficulty: q.difficulty,
        category: q.category,
        instructions: q.instructions,
        initialCode: q.initialCode,
        starterCode: q.starterCode,
        supportedLanguages: q.supportedLanguages,
        totalSubmissions: q.totalSubmissions,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    await batch.commit();
    console.log(`Committed batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} questions)`);
  }
  console.log('Successfully seeded all questions into Firestore collection "interviewQuestionBank"!');
}

seedToFirestore().catch(err => {
  console.error('Seeding error:', err);
});
