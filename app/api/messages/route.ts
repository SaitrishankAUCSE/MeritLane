import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const senderUid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(senderUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }
    
    // Get employer profile for name
    const employerProfile = await adminDb.collection("employers").doc(senderUid).get();
    const employerName = employerProfile.data()?.companyName || "An Employer";

    const { recipientId, content } = await req.json();
    if (!recipientId || !content) {
      return NextResponse.json({ error: "Missing recipient or content" }, { status: 400 });
    }

    const newMessage = {
      senderUid,
      senderName: employerName,
      recipientUid: recipientId,
      content,
      timestamp: Date.now(),
      read: false
    };

    await adminDb.collection("messages").add(newMessage);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("Messages POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const candidateUid = decodedToken.uid;

    const messagesSnapshot = await adminDb!.collection("messages")
      .where("recipientUid", "==", candidateUid)
      .orderBy("timestamp", "desc")
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ messages }, { status: 200 });
  } catch (e: any) {
    console.error("Messages GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
