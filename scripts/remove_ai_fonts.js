const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // Replace instances of "font-mono uppercase tracking-wider" in classes with "font-sans font-semibold tracking-wide"
      // Sometimes it has "font-mono font-semibold uppercase tracking-wider"
      
      content = content.replace(/font-mono(\s+font-semibold)?\s+uppercase\s+tracking-wider/g, 'font-sans font-semibold uppercase tracking-wide');
      content = content.replace(/font-mono(\s+font-medium)?\s+uppercase\s+tracking-wider/g, 'font-sans font-medium uppercase tracking-wide');
      content = content.replace(/font-mono\s+uppercase\s+tracking-wider/g, 'font-sans font-semibold uppercase tracking-wide');
      
      // Also catch random "font-mono" on buttons if we want, but sticking to the specific AI combo is safer.
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
console.log("Done");
