import fs from "fs";
import path from "path";

async function checkSkills() {
  const content = await import("../lib/assessments/content.ts");
  const banks = content.QUESTION_BANKS;
  console.log("Total skills in QUESTION_BANKS:", Object.keys(banks).length);
  
  const codingSkills = [];
  const mcqOnlySkills = [];

  for (const [skill, bank] of Object.entries(banks)) {
    if (bank.codingPool && bank.codingPool.length > 0) {
      codingSkills.push({
        skill,
        challenges: bank.codingPool.map(c => ({
          title: c.title,
          lang: c.language,
          supportedLanguages: c.supportedLanguages?.map(l => l.id)
        }))
      });
    } else {
      mcqOnlySkills.push(skill);
    }
  }

  console.log("\nSkills with coding challenges (" + codingSkills.length + "):");
  for (const cs of codingSkills) {
    console.log(`- ${cs.skill}: ${cs.challenges.map(c => `${c.title} (${c.lang || 'default'})`).join(", ")}`);
  }

  console.log("\nMCQ only skills (" + mcqOnlySkills.length + "):");
  console.log(mcqOnlySkills.join(", "));
}

checkSkills().catch(console.error);
