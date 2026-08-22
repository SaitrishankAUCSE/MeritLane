const fs = require('fs');
const path = require('path');

function replaceShadows(content) {
  let newContent = content;
  // Replace heavy shadows with subtle or none
  newContent = newContent.replace(/shadow-2xl/g, 'shadow-sm');
  newContent = newContent.replace(/shadow-xl/g, 'shadow-sm');
  newContent = newContent.replace(/shadow-lg/g, 'shadow-sm');
  newContent = newContent.replace(/hover:shadow-md/g, '');
  
  // Also replace those missed dark theme colors
  newContent = newContent.replace(/bg-\\[#181a1f\\]/g, 'bg-[#FFFFFF]');
  newContent = newContent.replace(/bg-\\[#0A0A0A\\]/g, 'bg-[#FFFFFF]');
  
  return newContent;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = replaceShadows(content);
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated shadows/colors in', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
