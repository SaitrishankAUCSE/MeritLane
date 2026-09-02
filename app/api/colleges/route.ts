import { NextResponse } from 'next/server';
import collegesData from '@/lib/data/colleges.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [] });
    }

    const cachedColleges = collegesData as any[];

    const tokens = q.trim().split(/\s+/).filter(Boolean);

    // Scoring algorithm prioritizing exact phrase match, prefix match, and token-level coverage
    const scored: Array<{ name: string; score: number }> = [];

    for (let i = 0; i < cachedColleges.length; i++) {
      const item = cachedColleges[i];
      const name = item.name || item.college_name || item;
      const nameStr = typeof name === 'string' ? name : String(name);
      const searchHaystack = (item.searchStr || nameStr).toLowerCase();

      let score = 0;
      if (searchHaystack === q) {
        score = 200;
      } else if (searchHaystack.startsWith(q)) {
        score = 150;
      } else if (searchHaystack.includes(q)) {
        score = 100;
      } else if (tokens.length > 1 && tokens.every(token => searchHaystack.includes(token))) {
        // Boost if matches word boundaries
        const startsWithFirst = searchHaystack.startsWith(tokens[0]);
        score = startsWithFirst ? 80 : 50;
      }

      if (score > 0) {
        scored.push({ name: nameStr, score });
      }
    }

    scored.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });

    const results = scored.slice(0, 50).map(s => s.name);

    return NextResponse.json({ results, colleges: results });

  } catch (error: any) {
    console.error("Colleges API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges", details: error.message },
      { status: 500 }
    );
  }
}
