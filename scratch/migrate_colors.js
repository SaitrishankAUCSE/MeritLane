const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('app'), ...walk('components')];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/slate-/g, 'zinc-')
    .replace(/text-\[\#1a56db\]/g, 'text-zinc-900')
    .replace(/bg-\[\#1a56db\]/g, 'bg-zinc-900')
    .replace(/border-\[\#1a56db\]/g, 'border-zinc-900')
    .replace(/ring-\[\#1a56db\]/g, 'ring-zinc-900')
    .replace(/fill-\[\#1a56db\]/g, 'fill-zinc-900')
    .replace(/text-\[\#0a2f7e\]/g, 'text-zinc-900')
    .replace(/bg-\[\#0d3b9e\]/g, 'bg-zinc-950')
    .replace(/hover:bg-\[\#0a2f7e\]/g, 'hover:bg-zinc-800')
    .replace(/indigo-/g, 'zinc-');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
}
