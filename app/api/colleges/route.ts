import { NextResponse } from 'next/server';

let cachedColleges: any[] | null = null;
let isFetching = false;

async function fetchColleges() {
  if (cachedColleges) return cachedColleges;
  if (isFetching) {
    // Wait for the fetch to complete if another request started it
    while (isFetching) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cachedColleges || [];
  }

  isFetching = true;
  try {
    const res = await fetch('https://raw.githubusercontent.com/VarthanV/Indian-Colleges-List/master/colleges.json');
    if (!res.ok) throw new Error('Failed to fetch colleges dataset');
    const data = await res.json();
    cachedColleges = data;
    isFetching = false;
    return cachedColleges || [];
  } catch (error) {
    console.error('Error fetching colleges dataset:', error);
    isFetching = false;
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const colleges = await fetchColleges();
  
  const lowerQuery = query.toLowerCase();
  
  // Filter colleges matching the query (either by college name or university name)
  const filteredAndScored = colleges
    .filter(item => {
      const cName = item.college?.toLowerCase() || "";
      const uName = item.university?.toLowerCase() || "";
      return cName.includes(lowerQuery) || uName.includes(lowerQuery);
    })
    .map(item => {
      const cName = item.college?.toLowerCase() || "";
      const uName = item.university?.toLowerCase() || "";
      let score = 0;
      
      // Clean up names
      const cleanName = item.college?.replace(/\s*\(Id:\s*C-\d+\)\s*/i, "") || "";
      
      if (cName === lowerQuery) score = 100;
      else if (cName.startsWith(lowerQuery)) score = 80;
      else if (cName.includes(lowerQuery)) score = 50;
      else if (uName.includes(lowerQuery)) score = 10;
      
      let formattedName = cleanName;
      if (item.district && item.state) {
        formattedName += `, ${item.district}, ${item.state}`;
      } else if (item.state) {
        formattedName += `, ${item.state}`;
      }

      return { name: formattedName, score };
    })
    .sort((a, b) => b.score - a.score);
    
  // Remove duplicates and return top 50 results
  const uniqueNames = Array.from(new Set(filteredAndScored.map(item => item.name)));
  const uniqueResults = uniqueNames.slice(0, 50);

  return NextResponse.json({ results: uniqueResults });
}
