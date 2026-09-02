import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

// Common domain typos and corrections
const COMMON_DOMAIN_CORRECTIONS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.co.in": "yahoo.co.in",
  "iclud.com": "icloud.com",
  "iclou.com": "icloud.com"
};

// Strict RFC 5322 compliant regex for email structure
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ valid: false, error: "Email is required." }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();

    // 1. Format check
    if (!EMAIL_REGEX.test(trimmed)) {
      return NextResponse.json({
        valid: false,
        error: "Invalid email format. Please check the structure (e.g., name@domain.com)."
      }, { status: 200 });
    }

    const [localPart, domain] = trimmed.split("@");

    if (!domain || !domain.includes(".")) {
      return NextResponse.json({
        valid: false,
        error: "Invalid email domain. Please include a valid domain extension like .com or .org."
      }, { status: 200 });
    }

    // 2. Spelling / Typo suggestions
    let suggestion: string | null = null;
    if (COMMON_DOMAIN_CORRECTIONS[domain]) {
      const suggestedDomain = COMMON_DOMAIN_CORRECTIONS[domain];
      suggestion = `${localPart}@${suggestedDomain}`;
      return NextResponse.json({
        valid: false,
        suggestion,
        error: `Did you mean ${suggestion}? Please check domain spelling.`
      }, { status: 200 });
    }

    // 3. Check account existence via Firebase Admin
    let exists = false;
    if (adminAuth) {
      try {
        const userRecord = await adminAuth.getUserByEmail(trimmed);
        if (userRecord) {
          exists = true;
        }
      } catch (err: any) {
        // 'auth/user-not-found' means email does not exist
        if (err.code !== "auth/user-not-found") {
          console.warn("Firebase getUser error:", err);
        }
      }
    }

    return NextResponse.json({
      valid: true,
      exists,
      domain,
      formattedEmail: trimmed
    }, { status: 200 });
  } catch (err: any) {
    console.error("Email verification API error:", err);
    return NextResponse.json({ valid: true, exists: false }, { status: 200 });
  }
}
