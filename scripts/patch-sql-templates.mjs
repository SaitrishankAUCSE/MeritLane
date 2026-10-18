import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bankPath = path.resolve(__dirname, "../lib/assessments/bank/top-interview-500.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf-8"));

let patchedCount = 0;

for (const q of bank) {
  // If it's a Database question or has empty code templates
  if (q.category === "Database" || Object.values(q.starterCode || {}).every(c => !c || !c.trim())) {
    q.starterCode = q.starterCode || {};
    
    // Add SQL template
    q.starterCode.sql = `-- Write your MySQL query statement below\nSELECT \n`;
    
    // Add Python (Pandas) template
    q.starterCode.python = `import pandas as pd\n\ndef solve(df: pd.DataFrame) -> pd.DataFrame:\n    # Write your Pandas transformation below\n    pass\n`;
    
    // Add Javascript template
    q.starterCode.javascript = `/**\n * @param {Array<Object>} rows\n * @return {Array<Object>}\n */\nfunction solve(rows) {\n    // Write your solution here\n    return [];\n}\n`;

    q.initialCode = q.starterCode.sql;

    // Ensure SQL and Python are in supportedLanguages
    q.supportedLanguages = [
      {
        id: "sql",
        name: "SQL (MySQL / Postgres)",
        monacoLang: "sql",
        template: q.starterCode.sql
      },
      {
        id: "python",
        name: "Python 3 (Pandas)",
        monacoLang: "python",
        template: q.starterCode.python
      },
      {
        id: "javascript",
        name: "JavaScript",
        monacoLang: "javascript",
        template: q.starterCode.javascript
      }
    ];

    patchedCount++;
  }

  // Also ensure any missing individual languages get a fallback
  if (!q.starterCode.python || !q.starterCode.python.trim()) {
    q.starterCode.python = `# Solution for ${q.title}\ndef solution(*args, **kwargs):\n    pass\n`;
  }
  if (!q.starterCode.javascript || !q.starterCode.javascript.trim()) {
    q.starterCode.javascript = `// Solution for ${q.title}\nfunction solution(...args) {\n    \n}\n`;
  }
}

fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), "utf-8");
console.log(`Successfully patched ${patchedCount} database questions in top-interview-500.json`);
