const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FAKE_DATA_PATTERNS = [
  'Aarav Sharma',
  'Alex Vance',
  'Example Corp',
  'Test Company',
  'Lorem ipsum',
  // Heuristic for hardcoded stat-like numbers near specific words
  // e.g. "Over 5000 verified candidates", "12,000+ registered"
  '(?:\\d+[kK\\+]?|\\d{1,3}(?:,\\d{3})+)\\+?\\s+(?:verified|registered|candidates|companies)',
  '(?:verified|registered|candidates|companies)\\s+(?:\\d+[kK\\+]?|\\d{1,3}(?:,\\d{3})+)\\+?'
];

const IGNORED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'out',
  'build',
  'scripts' // ignore this script itself
];

function checkFakeData(dir) {
  let hasErrors = false;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        if (checkFakeData(fullPath)) {
          hasErrors = true;
        }
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      for (const pattern of FAKE_DATA_PATTERNS) {
        const regex = new RegExp(pattern, 'i');
        const match = content.match(regex);
        if (match) {
          console.error(`❌ FAKE DATA DETECTED in ${fullPath}`);
          console.error(`   Pattern: "${pattern}" matched "${match[0]}"`);
          hasErrors = true;
        }
      }
    }
  }
  
  return hasErrors;
}

console.log("Checking codebase for fake data patterns...");
const hasErrors = checkFakeData(path.resolve(__dirname, '..'));

if (hasErrors) {
  console.error("\n❌ FAKE DATA CHECK FAILED! Please remove placeholder data before committing/building.");
  process.exit(1);
} else {
  console.log("✅ No fake data patterns found. You are good to go!");
  process.exit(0);
}
