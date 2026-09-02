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
    let employerName = "Verified Employer";
    try {
      const employerProfile = await adminDb.collection("employers").doc(senderUid).get();
      if (employerProfile.exists && employerProfile.data()?.companyName) {
        employerName = employerProfile.data()?.companyName;
      } else if (userDoc.data()?.name) {
        employerName = userDoc.data()?.name;
      }
    } catch {
      if (userDoc.data()?.name) employerName = userDoc.data()?.name;
    }

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

    const docRef = await adminDb.collection("messages").add(newMessage);

    return NextResponse.json({ success: true, messageId: docRef.id }, { status: 200 });
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
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const candidateUid = decodedToken.uid;

    // Fetch messages without requiring a composite index
    const messagesSnapshot = await adminDb.collection("messages")
      .where("recipientUid", "==", candidateUid)
      .get();

    const messages = messagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        senderUid: data.senderUid || "",
        senderName: data.senderName || "Verified Employer",
        recipientUid: data.recipientUid || candidateUid,
        content: data.content || "",
        timestamp: data.timestamp || Date.now(),
        read: data.read || false,
      };
    });

    // In-memory sort by timestamp descending
    messages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (e: any) {
    console.error("Messages GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
