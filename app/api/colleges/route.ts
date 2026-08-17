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
  const filtered = colleges
    .filter(item => 
      item.college?.toLowerCase().includes(lowerQuery) || 
      item.university?.toLowerCase().includes(lowerQuery)
    )
    // Extract just the clean college name (remove the Id: C-1234 part)
    .map(item => {
      const name = item.college || "";
      return name.replace(/\s*\(Id:\s*C-\d+\)\s*/i, "");
    });
    
  // Remove duplicates and return top 50 results
  const uniqueResults = Array.from(new Set(filtered)).slice(0, 50);

  return NextResponse.json({ results: uniqueResults });
}
