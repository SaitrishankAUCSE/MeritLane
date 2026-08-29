const fs = require('fs');

let page = fs.readFileSync('app/employer/shortlist/page.tsx', 'utf8');
page = page.replace(
  /export type PipelineStage = 'shortlisted' \| 'interviewing' \| 'offer' \| 'rejected';/,
  "export type PipelineStage = 'shortlisted' | 'interviewing' | 'offer' | 'hired' | 'rejected';"
);
page = page.replace(
  /const PIPELINE_STAGES: PipelineStage\[\] = \['shortlisted', 'interviewing', 'offer', 'rejected'\];/,
  "const PIPELINE_STAGES: PipelineStage[] = ['shortlisted', 'interviewing', 'offer', 'hired', 'rejected'];"
);
page = page.replace(
  /offer: 'Offer Extended',/,
  "offer: 'Offer Extended',\n  hired: 'Hired',"
);
page = page.replace(
  /if \(stage === 'offer'\) return 'bg-purple-100 text-purple-800';/,
  "if (stage === 'offer') return 'bg-purple-100 text-purple-800';\n    if (stage === 'hired') return 'bg-green-100 text-green-800';"
);
fs.writeFileSync('app/employer/shortlist/page.tsx', page, 'utf8');

let guide = fs.readFileSync('components/ui/ContextGuide.tsx', 'utf8');
guide = guide.replace(
  /if \(status === 'offer' \|\| status === 'interviewing'\) \{/,
  "if (status === 'offer' || status === 'interviewing') {\n        return { title: 'Pipeline Active', description: 'Track the candidate\\'s hiring progress.' };\n      }\n      if (status === 'hired') {"
);
guide = guide.replace(
  /Track the candidate's hiring progress./,
  "Candidate marked as hired."
);
fs.writeFileSync('components/ui/ContextGuide.tsx', guide, 'utf8');

let employer = fs.readFileSync('lib/firebase/employer.ts', 'utf8');
employer = employer.replace(
  /pipeline\?: Record<string, "shortlisted" \| "interviewing" \| "offer" \| "rejected">;/,
  "pipeline?: Record<string, \"shortlisted\" | \"interviewing\" | \"offer\" | \"hired\" | \"rejected\">;"
);
fs.writeFileSync('lib/firebase/employer.ts', employer, 'utf8');
console.log('Done!');
