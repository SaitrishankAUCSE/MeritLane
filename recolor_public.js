const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('components/public-record/PublicProofRecord.tsx', 'utf8');

content = content.replace(/bg-\\[#1b1c1e\\]/g, 'bg-[#F3F3F1]');
content = content.replace(/border-\\[#1b1c1e\\]/g, 'border-[#E5E5E5]');

fs.writeFileSync('components/public-record/PublicProofRecord.tsx', content, 'utf8');
console.log('Updated PublicProofRecord');
