import 'dotenv/config';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// Set your admin email (MUST match ADMIN_EMAIL in your route)
const ADMIN_EMAIL = "saitrishankb9@gmail.com";

// List of skills to generate question banks for
const SKILLS_TO_SEED = [
  "C", 
  "Java", 
  "Python", 
  "JavaScript", 
  "TypeScript", 
  "Go", 
  "C++"
];

// Target numbers for EACH skill
const TARGET_MCQS = 200;
const TARGET_CODING = 100;

// The generation endpoint (adjust localhost port if needed)
const API_URL = "http://localhost:3000/api/admin/generate-drafts";
// ------------------------------------------------------------------

/**
 * The API generates roughly 15 MCQs and 2 Coding questions per call.
 * This script calculates how many batches are needed and runs them sequentially.
 */
async function seedSkill(skill) {
  console.log(`\n🚀 Starting Generation for: ${skill}`);
  
  // Calculate required batches
  const mcqBatches = Math.ceil(TARGET_MCQS / 15);
  const codingBatches = Math.ceil(TARGET_CODING / 2);
  const totalBatches = Math.max(mcqBatches, codingBatches);
  
  console.log(`Requires approx ${totalBatches} batches to hit target numbers...`);

  for (let i = 1; i <= totalBatches; i++) {
    console.log(`[${skill}] Processing Batch ${i}/${totalBatches}...`);
    
    try {
      // NOTE: For a local dev script, you should disable auth checks temporarily in your route 
      // or pass a valid Firebase Admin ID token here. 
      // Assuming you temporarily disabled auth in `/api/admin/generate-drafts` for local seeding:
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-seed-key": "meritlane-secret-seeder-key"
        },
        body: JSON.stringify({
          skill: skill,
          count: 15 // The AI prompt currently hardcodes 15 MCQs and 2 Coding tasks
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`❌ Batch ${i} failed: ${response.status} - ${err}`);
        // Wait a minute before retrying to avoid AI API rate limits
        await new Promise(res => setTimeout(res, 60000));
        continue;
      }

      const data = await response.json();
      console.log(`✅ Batch ${i} Success! Added to Firestore drafts.`);
      
      // Delay 10 seconds between batches to respect AI provider rate limits
      await new Promise(res => setTimeout(res, 10000));
      
    } catch (error) {
      console.error(`❌ Network/Execution Error on Batch ${i}:`, error.message);
      await new Promise(res => setTimeout(res, 10000));
    }
  }
  
  console.log(`✨ Finished seeding ${skill}!`);
}

async function runSeeder() {
  console.log("=========================================");
  console.log("   MERITLANE AUTOMATED SEEDER SCRIPT     ");
  console.log("=========================================");
  
  for (const skill of SKILLS_TO_SEED) {
    await seedSkill(skill);
    // Extra delay between completely different skills
    await new Promise(res => setTimeout(res, 15000));
  }
  
  console.log("\n🎉 ALL SKILLS SEEDED SUCCESSFULLY!");
  console.log("Make sure to visit the Admin Dashboard to promote these drafts to 'live'!");
}

runSeeder().catch(console.error);
