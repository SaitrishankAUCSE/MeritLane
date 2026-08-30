import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// In-memory cache to prevent re-reading file on every request
let cachedColleges: any[] | null = null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    if (!cachedColleges) {
      const dataPath = path.join(process.cwd(), 'lib', 'data', 'colleges.json');
      try {
        const fileContents = await fs.readFile(dataPath, 'utf8');
        cachedColleges = JSON.parse(fileContents);
      } catch (err) {
        // Fallback to indian_colleges.json if the big one is missing
        const fallbackPath = path.join(process.cwd(), 'lib', 'indian_colleges.json');
        const fileContents = await fs.readFile(fallbackPath, 'utf8');
        cachedColleges = JSON.parse(fileContents);
      }
    }

    // Custom scoring algorithm to prioritize:
    // 1. Exact acronyms (e.g. "IIT", "NIT")
    // 2. Starts with query
    // 3. Contains query
    const results = cachedColleges!
      .map(college => {
        // Handle different JSON structures (name vs college_name)
        const name = college.name || college.college_name || college;
        const nameStr = typeof name === 'string' ? name : String(name);
        const nameLower = nameStr.toLowerCase();
        
        let score = 0;
        
        if (nameLower === q) score = 100;
        else if (nameLower.startsWith(q)) score = 50;
        else if (nameLower.includes(q)) score = 10;
        
        return {
          ... (typeof college === 'object' ? college : { name: college }),
          name: nameStr,
          score
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 50)
      .map(item => {
        // Format for Autocomplete display
        const city = item.city || item.district;
        const state = item.state;
        const location = [city, state].filter(Boolean).join(', ');
        return `${item.name}${location ? ` (${location})` : ''}`;
      });

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error("Colleges API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges", details: error.message },
      { status: 500 }
    );
  }
}
