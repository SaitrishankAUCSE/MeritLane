const fs = require('fs');
const path = require('path');

const colorMap = {
  '#0b0c0e': '#FAFAFA',
  '#111316': '#FFFFFF',
  '#1a1c20': '#F3F3F1',
  '#272a2f': '#E5E5E5',
  '#444846': '#D2D2D2',
  '#8e928f': '#737373',
  '#c4c7c5': '#737373',
  '#e3e2e5': '#0D0D0D',
  '#ffb4ab': '#B42318',
  '#a8a2ff': '#15803D'
};

const regex = new RegExp(Object.keys(colorMap).join('|'), 'gi');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Also, we need to swap 'text-white' to 'text-[#0D0D0D]' or 'text-black' to 'text-white' etc.
      // But only in standard contexts? The color map for hex codes is safest first.
      
      let newContent = content.replace(regex, matched => colorMap[matched.toLowerCase()]);
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
