// Canonical Skill Vocabulary
export const SKILL_VOCABULARY = [
  "Python",
  "React",
  "React Native",
  "Firebase",
  "Next.js",
  "Node.js",
  "JavaScript",
  "TypeScript",
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "SQL",
  "HTML",
  "CSS",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "AWS",
  "Docker",
  "Kubernetes"
];

const VOCAB_LOWERCASE = SKILL_VOCABULARY.map(s => s.toLowerCase());

export const skillAliases: Record<string, string> = {
  "nodejs": "node.js",
  "node": "node.js",
  "reactjs": "react",
  "vuejs": "vue",
  "postgres": "postgresql",
  "nextjs": "next.js",
  "react-native": "react native",
};

/**
 * Normalizes a skill string for precise backend matching.
 * Trims, lowercases, and collapses whitespace.
 * Applies aliases if known.
 */
export function canonicalizeSkill(val: string): string {
  const norm = val.trim().toLowerCase().replace(/\s+/g, ' ');
  return skillAliases[norm] || norm;
}

/**
 * Parses raw employer input (e.g. from TagInput) and returns an array of canonical-friendly display strings.
 * Handles commas, newlines, and intelligent vocabulary-based space splitting.
 */
export function parseSkillInput(input: string): string[] {
  let text = input.trim();
  if (!text) return [];

  if (text.includes(',') || text.includes('\n')) {
    const parts = text.split(/[\n,]+/);
    const parsed: string[] = [];
    for (const p of parts) {
      if (p.trim()) parsed.push(p.trim().replace(/\s+/g, ' '));
    }
    return parsed;
  }

  const normText = text.toLowerCase().replace(/\s+/g, ' ');
  if (VOCAB_LOWERCASE.includes(normText) || skillAliases[normText]) {
    return [text.replace(/\s+/g, ' ')];
  }

  let remaining = normText;
  const foundSkills: string[] = [];
  
  const sortedVocab = [...SKILL_VOCABULARY].sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    let matched = false;
    for (const vocabItem of sortedVocab) {
      const vLow = vocabItem.toLowerCase();
      const regex = new RegExp(`(^|\\s)${vLow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`);
      if (regex.test(remaining)) {
        foundSkills.push(vocabItem);
        remaining = remaining.replace(regex, ' ').replace(/\s+/g, ' ').trim();
        matched = true;
        break; 
      }
    }
    if (!matched) {
      const leftovers = remaining.split(/\s+/).filter(Boolean);
      foundSkills.push(...leftovers);
      break;
    }
  }

  return foundSkills;
}
