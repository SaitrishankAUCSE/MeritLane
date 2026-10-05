import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { executeDynamicPython } from "@/lib/compiler";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!adminAuth) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
  }
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

  const { code, functionName, testCases } = await req.json();

  if (!code || !functionName || !testCases || !Array.isArray(testCases)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await executeDynamicPython(code, functionName, testCases);
    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
