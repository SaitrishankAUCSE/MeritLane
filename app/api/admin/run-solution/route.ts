import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { executeCode } from "@/lib/compiler";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(req: NextRequest) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userRecord = await adminAuth.getUser(decodedToken.uid);
  const isAdmin = userRecord.email?.toLowerCase() === ADMIN_EMAIL || decodedToken.admin === true;
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code, language, solutionType, skill } = await req.json();
  if (!code || !language) {
    return NextResponse.json({ error: "code and language are required" }, { status: 400 });
  }

  try {
    const result = await executeCode({ code, language, skill: skill || "javascript", isPublicTest: true });
    return NextResponse.json({
      success: result?.success ?? false,
      compileSuccess: result?.compileSuccess ?? false,
      passedTests: result?.passedTests ?? 0,
      totalTests: result?.totalTests ?? 5,
      cases: (result?.cases ?? []).slice(0, 5),
      stderr: result?.stderr ?? "",
      stdout: result?.stdout ?? "",
      solutionType,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      compileSuccess: false,
      passedTests: 0,
      totalTests: 5,
      cases: [],
      stderr: err?.message || "Compiler error",
      stdout: "",
      solutionType,
    });
  }
}
