import { NextRequest, NextResponse } from "next/server";

// GET /api/public/candidates
// Candidate privacy protection: full candidate profiles are restricted to authenticated employers.
export async function GET(_req: NextRequest) {
  return NextResponse.json({ 
    candidates: [],
    message: "Public candidate directory is secured. Authorized employers can access the full talent pool inside the Employer Portal." 
  }, { status: 200 });
}

