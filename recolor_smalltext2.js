const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let lines = content.split('\n');
      let changed = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/(text-xs|text-\\[10px\\]|text-\\[11px\\]|text-\\[12px\\])/) && lines[i].includes('text-[#737373]')) {
          lines[i] = lines[i].replace(/text-\\[#737373\\]/g, 'text-[#666666]');
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
        console.log('Updated small text in', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
