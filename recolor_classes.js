const fs = require('fs');
const path = require('path');

const classMap = {
  // Primary buttons
  'bg-white text-black': 'bg-[#0D0D0D] text-[#FFFFFF]',
  'text-black bg-white': 'text-[#FFFFFF] bg-[#0D0D0D]',
  'border-white bg-white': 'border-[#0D0D0D] bg-[#0D0D0D]',
  'bg-white': 'bg-[#0D0D0D]',
  'hover:bg-black': 'hover:bg-[#222222]',
  'hover:text-white': 'hover:text-[#FFFFFF]',
  'text-black': 'text-[#FFFFFF]',
  'border-white': 'border-[#0D0D0D]',
  
  // Secondary button hover states
  'hover:bg-white': 'hover:bg-[#F3F3F1]',
  'hover:text-black': 'hover:text-[#0D0D0D]',
  'hover:border-white': 'hover:border-[#E5E5E5]',
  
  // Text color mapping
  'text-white': 'text-[#0D0D0D]',
  
  // Selection
  'selection:bg-white': 'selection:bg-[#0D0D0D]',
  'selection:text-black': 'selection:text-[#FFFFFF]',
};

// Wait, simple string replacement of these classes might overlap or cause issues.
// E.g. 'bg-white' replaced by 'bg-[#0D0D0D]', but what if a user explicitly wanted a white background (like a surface)?
// As the prompt says: "Do not create new cards just to use this color. Only recolor existing surfaces. Existing surfaces: #FFFFFF"
// Wait, currently surfaces are 'bg-[#111316]', which we ALREADY replaced with '#FFFFFF' (bg-[#FFFFFF]).
// So any existing 'bg-white' was mostly primary buttons!

// Let's do regex with word boundaries to replace these tailwind classes safely.
function replaceClasses(content) {
  let newContent = content;
  
  // Sequence 1: Replace multi-word common strings first to avoid partial replacements
  newContent = newContent.replace(/bg-white text-black/g, 'bg-[#0D0D0D] text-[#FFFFFF]');
  newContent = newContent.replace(/text-black bg-white/g, 'text-[#FFFFFF] bg-[#0D0D0D]');
  newContent = newContent.replace(/border-white bg-white/g, 'border-[#0D0D0D] bg-[#0D0D0D]');
  
  newContent = newContent.replace(/hover:bg-white hover:text-black hover:border-white/g, 'hover:bg-[#F3F3F1] hover:text-[#0D0D0D] hover:border-[#E5E5E5]');
  newContent = newContent.replace(/hover:bg-white hover:text-black/g, 'hover:bg-[#F3F3F1] hover:text-[#0D0D0D]');
  newContent = newContent.replace(/hover:text-black hover:bg-white/g, 'hover:text-[#0D0D0D] hover:bg-[#F3F3F1]');
  
  newContent = newContent.replace(/hover:bg-black hover:text-white/g, 'hover:bg-[#222222] hover:text-[#FFFFFF]');
  newContent = newContent.replace(/hover:text-white hover:border-white/g, 'hover:text-[#0D0D0D] hover:border-[#0D0D0D]');

  newContent = newContent.replace(/selection:bg-white selection:text-black/g, 'selection:bg-[#0D0D0D] selection:text-[#FFFFFF]');
  
  // Now single classes with word boundaries to avoid partial match (like 'text-white/50')
  const singles = {
    'bg-white': 'bg-[#0D0D0D]',
    'text-white': 'text-[#0D0D0D]',
    'border-white': 'border-[#0D0D0D]',
    'border-t-white': 'border-t-[#0D0D0D]',
    'text-black': 'text-[#FFFFFF]',
    'bg-black': 'bg-[#FFFFFF]',
    'hover:bg-white': 'hover:bg-[#F3F3F1]',
    'hover:bg-black': 'hover:bg-[#222222]',
    'hover:text-white': 'hover:text-[#0D0D0D]',
    'hover:border-white': 'hover:border-[#0D0D0D]'
  };
  
  for (const [key, value] of Object.entries(singles)) {
    // regex to match exact class name not followed by / or - (to avoid matching text-white/50 or bg-white-100)
    const r = new RegExp('(?<![\\\\w-])' + key.replace(/:/g, '\\\\:') + '(?![\\\\w/-])', 'g');
    newContent = newContent.replace(r, value);
  }
  
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
      
      let newContent = replaceClasses(content);
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated classes in', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
