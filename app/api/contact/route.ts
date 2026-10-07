import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Please provide a message." }, { status: 400 });
    }

    const trimmedName = name.trim().slice(0, 100);
    const trimmedEmail = email.trim().toLowerCase().slice(0, 120);
    const trimmedMessage = message.trim().slice(0, 3000);
    const now = Date.now();

    const inquiryData = {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      createdAt: now,
      status: "new",
      read: false,
      userAgent: req.headers.get("user-agent")?.slice(0, 200) || "unknown",
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    };

    let docId = "";

    // 1. Try adminDb (Server SDK - bypasses rules)
    if (adminDb) {
      try {
        const docRef = await adminDb.collection("inquiries").add({
          ...inquiryData,
          serverTimestamp: new Date(),
        });
        docId = docRef.id;
      } catch (adminErr) {
        console.warn("[Contact API] adminDb write failed, trying client db fallback:", adminErr);
      }
    }

    // 2. Client SDK fallback if adminDb unavailable
    if (!docId && db) {
      try {
        const docRef = await addDoc(collection(db, "inquiries"), inquiryData);
        docId = docRef.id;
      } catch (clientErr) {
        console.error("[Contact API] client db write also failed:", clientErr);
      }
    }

    if (!docId) {
      return NextResponse.json(
        { error: "Could not save message due to database connectivity issue. Please try again or email us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: docId,
      message: "Your message has been received! We will get back to you within 24 hours.",
    });
  } catch (error: any) {
    console.error("[Contact API] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit inquiry. Please try again later." },
      { status: 500 }
    );
  }
}
