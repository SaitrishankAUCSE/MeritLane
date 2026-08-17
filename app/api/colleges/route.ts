import { NextResponse } from 'next/server';
import colleges from '@/lib/data/colleges.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const lowerQuery = query.toLowerCase();
  
  // Filter colleges matching the query and calculate relevance score
  const filteredAndScored = colleges
    .filter((item: any) => item.searchStr.includes(lowerQuery))
    .map((item: any) => {
      let score = 0;
      const cName = item.searchStr;
      
      if (cName === lowerQuery) score = 100;
      else if (cName.startsWith(lowerQuery)) score = 80;
      else if (cName.includes(lowerQuery)) score = 50;
      
      return { name: item.name, score };
    })
    .sort((a: any, b: any) => b.score - a.score);
    
  // Remove duplicates and return top 50 results
  const uniqueNames = Array.from(new Set(filteredAndScored.map((item: any) => item.name)));
  const uniqueResults = uniqueNames.slice(0, 50);

  return NextResponse.json({ results: uniqueResults });
}
