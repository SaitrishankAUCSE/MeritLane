/**
 * MeritLane Question Bank Seeder
 * ================================
 * Generates large, unique question pools for all 22 dashboard skills.
 *
 * Strategy:
 *   - Each batch call generates 25 MCQs + 2 coding tasks (for task-based skills)
 *     OR 30 MCQs (for knowledge-only skills).
 *   - We run BATCHES_PER_SKILL batches per skill to build a large pool.
 *   - Each batch uses a different batchIndex so the AI prompt explicitly varies.
 *   - Temperature is set to 0.7 on the API side to maximise diversity.
 *
 * Pool sizes achieved (per skill):
 *   - Programming / Query / Config / Debugging / Markup:
 *       MCQs:   25 × BATCHES_PER_SKILL  (e.g. 25×6 = 150)
 *       Tasks:   2 × BATCHES_PER_SKILL  (e.g.  2×6 =  12)
 *   - Knowledge:
 *       MCQs:   30 × BATCHES_PER_SKILL  (e.g. 30×6 = 180)
 *       Tasks:   0
 *
 * With 150+ MCQs and 12+ tasks per skill, a candidate can attempt each skill
 * ~10 times before exhausting the pool, with zero overlap between different users.
 *
 * Usage:
 *   node scripts/seed_questions.mjs
 *
 * Prerequisites:
 *   - npm run dev must be running on port 3000
 *   - AI_PROVIDER_API_KEY must be set in .env.local
 */

import 'dotenv/config';

// ─── Configuration ────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:3000/api/admin/generate-drafts';
const SEED_KEY = 'meritlane-secret-seeder-key';

/**
 * Number of generation batches per skill.
 * Each batch = 1 AI call → 25 MCQs + 2 tasks (or 30 MCQs for knowledge).
 * Increase for larger pools; 6 is a good starting point.
 */
const BATCHES_PER_SKILL = 6;

/** Delay between batches (ms) — respects Gemini 2.5 Pro rate limits */
const BATCH_DELAY_MS = 15_000;

/** Delay between skills (ms) */
const SKILL_DELAY_MS = 5_000;

/**
 * All 22 skills shown on the candidate dashboard.
 * The server-side classifier automatically picks the right assessment mode for each.
 */
const SKILLS_TO_SEED = [
  // Programming languages (mode: programming)
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'C',
  'Go',
  'R',

  // Web frameworks (mode: programming)
  'React',
  'React.js',
  'Next.js',

  // Markup / style (mode: markup)
  'HTML5',
  'CSS',

  // Database / query (mode: query)
  'SQL',

  // DevOps / config (mode: config)
  'Docker',

  // Cloud / knowledge (mode: knowledge)
  'AWS',
  'GCP',

  // Data science (mode: programming or knowledge, classified by AI)
  'NumPy',
  'Pandas',

  // Caching / messaging (mode: knowledge or query)
  'Redis',
  'Firebase',
];

// ─── Core Functions ───────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateBatch(skill, batchIndex, attempt = 1) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-seed-key': SEED_KEY,
      },
      body: JSON.stringify({ skill, batchIndex }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (attempt < 3) {
      console.warn(`  ⚠️  Batch ${batchIndex + 1} attempt ${attempt} failed: ${err.message}. Retrying in 30s…`);
      await sleep(30_000);
      return generateBatch(skill, batchIndex, attempt + 1);
    }
    throw err;
  }
}

async function seedSkill(skill) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  🚀  Seeding: ${skill}`);
  console.log(`${'─'.repeat(60)}`);

  let totalMcqs = 0;
  let totalTasks = 0;

  for (let i = 0; i < BATCHES_PER_SKILL; i++) {
    console.log(`  📦  Batch ${i + 1}/${BATCHES_PER_SKILL}…`);

    try {
      const result = await generateBatch(skill, i);
      totalMcqs += result.mcqCount || 0;
      totalTasks += result.codingCount || 0;
      console.log(`  ✅  Batch ${i + 1} done — ${result.mcqCount} MCQs, ${result.codingCount} tasks (mode: ${result.assessmentMode})`);
    } catch (err) {
      console.error(`  ❌  Batch ${i + 1} permanently failed: ${err.message}`);
    }

    if (i < BATCHES_PER_SKILL - 1) {
      console.log(`  ⏱️   Waiting ${BATCH_DELAY_MS / 1000}s before next batch…`);
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`  🏁  ${skill} complete — total: ${totalMcqs} MCQs, ${totalTasks} tasks`);
  return { totalMcqs, totalTasks };
}

async function runSeeder() {
  const startTime = Date.now();

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         MERITLANE AUTOMATED QUESTION BANK SEEDER        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nSkills: ${SKILLS_TO_SEED.length}`);
  console.log(`Batches per skill: ${BATCHES_PER_SKILL}`);
  console.log(`Estimated MCQs per skill: ${BATCHES_PER_SKILL * 25}–${BATCHES_PER_SKILL * 30}`);
  console.log(`Estimated tasks per skill: ${BATCHES_PER_SKILL * 2} (0 for knowledge skills)`);
  console.log(`Estimated runtime: ${Math.round((SKILLS_TO_SEED.length * BATCHES_PER_SKILL * (BATCH_DELAY_MS + 20_000)) / 60_000)} minutes\n`);

  const summary = [];

  for (let s = 0; s < SKILLS_TO_SEED.length; s++) {
    const skill = SKILLS_TO_SEED[s];
    try {
      const result = await seedSkill(skill);
      summary.push({ skill, ...result, status: '✅' });
    } catch (err) {
      console.error(`\n❌  Fatal error seeding ${skill}: ${err.message}`);
      summary.push({ skill, totalMcqs: 0, totalTasks: 0, status: '❌' });
    }

    if (s < SKILLS_TO_SEED.length - 1) {
      await sleep(SKILL_DELAY_MS);
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 60_000);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                   SEEDING COMPLETE                      ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Time elapsed: ${String(elapsed).padEnd(43)}║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  Skill                   MCQs    Tasks   Status         ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  for (const { skill, totalMcqs, totalTasks, status } of summary) {
    const s = skill.padEnd(22);
    const m = String(totalMcqs).padEnd(8);
    const t = String(totalTasks).padEnd(8);
    console.log(`║  ${s}  ${m}${t}${status}            ║`);
  }
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

runSeeder().catch(err => {
  console.error('\n💥 Seeder crashed:', err);
  process.exit(1);
});
