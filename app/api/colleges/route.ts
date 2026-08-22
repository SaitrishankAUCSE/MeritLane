import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ colleges: [] });
  }

  try {
    const res = await fetch(`http://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(query)}`);
    if (!res.ok) {
      return NextResponse.json({ colleges: [] });
    }
    const data = await res.json();
    const names = Array.from(new Set(data.map((item: any) => item.name))) as string[];
    
    return NextResponse.json({ colleges: names.slice(0, 50) });
  } catch (error) {
    console.error("Failed to fetch colleges via proxy", error);
    return NextResponse.json({ colleges: [] });
  }
}
