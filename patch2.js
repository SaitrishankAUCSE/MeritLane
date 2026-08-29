const fs = require('fs');
let content = fs.readFileSync('components/ui/ContextGuide.tsx', 'utf8');
content = content.replace("if (status === 'offer' || status === 'interviewing') {\n        return { title: 'Pipeline Active', description: 'Candidate marked as hired.' };\n      }", "if (status === 'offer' || status === 'interviewing') {\n        return { title: 'Pipeline Active', description: 'Track the candidate\\'s hiring progress.' };\n      }");
fs.writeFileSync('components/ui/ContextGuide.tsx', content);
