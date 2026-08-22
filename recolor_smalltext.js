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
      let newContent = content;
      
      // Replace text-[#737373] with text-[#666666] if it is near text-xs, text-[10px], text-[11px], text-[12px]
      const smallTextRegex = /(text-xs|text-\\[10px\\]|text-\\[11px\\]|text-\\[12px\\])/g;
      
      // We will do a line-by-line check. If line has small text class and text-[#737373], we swap the color.
      let lines = newContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(smallTextRegex) && lines[i].includes('text-[#737373]')) {
          lines[i] = lines[i].replace(/text-\\[#737373\\]/g, 'text-[#666666]');
        }
      }
      newContent = lines.join('\n');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated small text in', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
