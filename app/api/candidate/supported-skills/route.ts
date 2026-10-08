import { NextResponse } from "next/server";
import { QUESTION_BANKS, SKILL_ALIASES } from "@/lib/assessments/content";

export async function GET() {
  try {
    return NextResponse.json({
      keys: Object.keys(QUESTION_BANKS),
      aliases: Object.keys(SKILL_ALIASES)
    });
  } catch (error) {
    console.error("Failed to get supported skills:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
