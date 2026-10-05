const fs = require('fs');

async function main() {
  console.log("Fetching Godbolt languages...");
  const res = await fetch('https://godbolt.org/api/languages', {
    headers: { 'Accept': 'application/json' }
  });
  const langs = await res.json();
  const godboltIds = new Set(langs.map(l => l.id.toLowerCase()));
  const godboltNames = new Set(langs.map(l => l.name.toLowerCase()));

  // We read content.ts to find the keys of QUESTION_BANKS
  let skills = [];
  try {
    const content = fs.readFileSync('lib/assessments/content.ts', 'utf8');
    const lines = content.split('\n');
    let inDB = false;
    for(let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export const QUESTION_BANKS:')) {
        inDB = true;
        continue;
      }
      if (inDB && lines[i].match(/^};/)) {
        break;
      }
      if (inDB) {
        // match `"python": {` or `python: {`
        const match = lines[i].match(/^\s*\"?([a-zA-Z0-9.\-\/+# ]+)\"?:\s*\{/);
        if (match) {
          skills.push(match[1]);
        }
      }
    }
  } catch (e) {
    console.log("No content.ts found or readable");
  }

  // Deduplicate
  skills = [...new Set(skills)];

  console.log(`Found ${skills.length} skills in codebase.`);

  console.log("\n| Skill Name | Godbolt-Supported? | Priority (Mock) |");
  console.log("|------------|--------------------|-----------------|");
  for (const skill of Array.from(skills).sort()) {
    let lowerSkill = skill.toLowerCase();
    let supported = godboltIds.has(lowerSkill) || godboltNames.has(lowerSkill);
    let mapped = null;
    if (!supported) {
       if (lowerSkill === 'c++') supported = true;
       if (lowerSkill === 'c#') supported = true;
       if (lowerSkill === 'node.js') supported = true;
       if (lowerSkill === 'javascript') supported = true;
       if (lowerSkill === 'typescript') supported = true;
       if (lowerSkill === 'react') supported = true;
       if (lowerSkill === 'java') supported = true;
       if (lowerSkill === 'go') supported = true;
       if (lowerSkill === 'golang') supported = true;
       if (lowerSkill === 'html/css' || lowerSkill === 'sql') supported = false; 
    }
    console.log(`| ${skill.padEnd(10)} | ${supported ? '✅ Yes'.padEnd(18) : '❌ No'.padEnd(18)} | High            |`);
  }
}

main().catch(console.error);
