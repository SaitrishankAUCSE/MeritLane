import fs from 'node:fs';
import path from 'node:path';

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<strong class="example">/gi, '\n\n**Example: ')
    .replace(/<\/strong>/gi, '**\n')
    .replace(/<pre>/gi, '\n```\n')
    .replace(/<\/pre>/gi, '\n```\n')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<li>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<ul>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<p>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&le;/g, '<=')
    .replace(/&ge;/g, '>=')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const COMMON_SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python 3', monacoLang: 'python' },
  { id: 'javascript', name: 'JavaScript (ES6)', monacoLang: 'javascript' },
  { id: 'typescript', name: 'TypeScript', monacoLang: 'typescript' },
  { id: 'java', name: 'Java 21', monacoLang: 'java' },
  { id: 'cpp', name: 'C++ (GCC 14)', monacoLang: 'cpp' },
  { id: 'csharp', name: 'C# (.NET 8)', monacoLang: 'csharp' },
  { id: 'c', name: 'C (C17)', monacoLang: 'c' },
  { id: 'golang', name: 'Go (Golang)', monacoLang: 'go' },
  { id: 'rust', name: 'Rust', monacoLang: 'rust' }
];

async function fetchQuestionDetail(slug, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: JSON.stringify({
          query: `query getQuestion($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionId
              title
              titleSlug
              difficulty
              content
              topicTags {
                name
              }
              codeSnippets {
                langSlug
                code
              }
            }
          }`,
          variables: { titleSlug: slug }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data?.question;
    } catch (err) {
      if (attempt === retries) {
        console.warn(`Failed to fetch ${slug} after ${retries} attempts:`, err.message);
        return null;
      }
      await new Promise(r => setTimeout(r, 800 * attempt));
    }
  }
  return null;
}

async function run() {
  console.log('1. Fetching problem catalog from LeetCode...');
  const catalogRes = await fetch('https://leetcode.com/api/problems/all/');
  if (!catalogRes.ok) throw new Error('Failed to fetch LeetCode catalog');
  const catalog = await catalogRes.json();

  const free = catalog.stat_status_pairs.filter(p => !p.paid_only);
  free.sort((a, b) => b.stat.total_acs - a.stat.total_acs);

  const easyList = free.filter(p => p.difficulty.level === 1).slice(0, 175);
  const mediumList = free.filter(p => p.difficulty.level === 2).slice(0, 225);
  const hardList = free.filter(p => p.difficulty.level === 3).slice(0, 100);

  const selectedTargets = [
    ...easyList.map(p => ({ slug: p.stat.question__title_slug, diff: 'easy', acs: p.stat.total_acs })),
    ...mediumList.map(p => ({ slug: p.stat.question__title_slug, diff: 'medium', acs: p.stat.total_acs })),
    ...hardList.map(p => ({ slug: p.stat.question__title_slug, diff: 'hard', acs: p.stat.total_acs }))
  ];

  console.log(`Selected ${selectedTargets.length} targets:`);
  console.log(`- Easy: ${easyList.length}`);
  console.log(`- Medium: ${mediumList.length}`);
  console.log(`- Hard: ${hardList.length}`);

  const questions = [];
  const CONCURRENCY = 15;
  const startTime = Date.now();

  for (let i = 0; i < selectedTargets.length; i += CONCURRENCY) {
    const chunk = selectedTargets.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map(async target => {
        const detail = await fetchQuestionDetail(target.slug);
        if (!detail) return null;

        const snippets = detail.codeSnippets || [];
        const findSnippet = (slugs) => {
          const s = snippets.find(sn => slugs.includes(sn.langSlug));
          return s ? s.code : '';
        };

        const starterCode = {
          python: findSnippet(['python3', 'python']),
          javascript: findSnippet(['javascript']),
          typescript: findSnippet(['typescript']),
          java: findSnippet(['java']),
          cpp: findSnippet(['cpp']),
          csharp: findSnippet(['csharp']),
          c: findSnippet(['c']),
          golang: findSnippet(['golang']),
          rust: findSnippet(['rust'])
        };

        const defaultInitialCode = starterCode.javascript || starterCode.python || starterCode.typescript || '';

        return {
          id: `leetcode_${detail.questionId}`,
          externalId: detail.questionId,
          slug: detail.titleSlug,
          title: detail.title,
          difficulty: target.diff,
          category: detail.topicTags?.map(t => t.name).join(', ') || 'Algorithms',
          instructions: cleanHtml(detail.content),
          initialCode: defaultInitialCode,
          starterCode,
          supportedLanguages: COMMON_SUPPORTED_LANGUAGES.map(l => ({
            ...l,
            template: starterCode[l.id] || starterCode.javascript || starterCode.python || ''
          })),
          totalSubmissions: target.acs,
          publicTests: [],
          hiddenTests: []
        };
      })
    );

    for (const q of chunkResults) {
      if (q) questions.push(q);
    }

    const elapsedSecs = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\rFetched: ${questions.length}/${selectedTargets.length} (${elapsedSecs}s)`);
  }

  console.log(`\n\nFetched total ${questions.length} questions successfully!`);

  // Save to lib/assessments/bank/top-interview-500.json
  const outDir = path.join(process.cwd(), 'lib', 'assessments', 'bank');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'top-interview-500.json');
  fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`Saved dataset to ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);

  const summary = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length
  };
  console.log('Final Summary:', summary);
}

run().catch(err => {
  console.error('\nFatal error in fetch script:', err);
  process.exit(1);
});
