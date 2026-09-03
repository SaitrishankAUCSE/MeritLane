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
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Forbidden: User record not found" }, { status: 403 });
    }
    
    const userRole = userDoc.data()?.role || "candidate";
    let senderName = userDoc.data()?.displayName || userDoc.data()?.name || (userRole === "employer" ? "Verified Employer" : "Candidate");

    if (userRole === "employer") {
      try {
        const employerProfile = await adminDb.collection("employers").doc(senderUid).get();
        if (employerProfile.exists && employerProfile.data()?.companyName) {
          senderName = employerProfile.data()?.companyName;
        }
      } catch {
        // Fallback to name
      }
    }

    const { recipientId, content, parentMessageId } = await req.json();
    if (!recipientId || !content || !content.trim()) {
      return NextResponse.json({ error: "Missing recipient or content" }, { status: 400 });
    }

    const newMessage = {
      senderUid,
      senderName,
      senderRole: userRole,
      recipientUid: recipientId,
      content: content.trim(),
      parentMessageId: parentMessageId || null,
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
    const userUid = decodedToken.uid;

    // Fetch messages where user is either recipient or sender
    const [receivedSnap, sentSnap] = await Promise.all([
      adminDb.collection("messages").where("recipientUid", "==", userUid).get(),
      adminDb.collection("messages").where("senderUid", "==", userUid).get(),
    ]);

    const messageMap = new Map<string, any>();

    receivedSnap.docs.forEach((doc) => {
      const data = doc.data();
      messageMap.set(doc.id, {
        id: doc.id,
        senderUid: data.senderUid || "",
        senderName: data.senderName || "Verified Recruiter",
        senderRole: data.senderRole || "employer",
        recipientUid: data.recipientUid || userUid,
        content: data.content || "",
        parentMessageId: data.parentMessageId || null,
        timestamp: data.timestamp || Date.now(),
        read: data.read || false,
      });
    });

    sentSnap.docs.forEach((doc) => {
      if (!messageMap.has(doc.id)) {
        const data = doc.data();
        messageMap.set(doc.id, {
          id: doc.id,
          senderUid: data.senderUid || "",
          senderName: data.senderName || "Me",
          senderRole: data.senderRole || "candidate",
          recipientUid: data.recipientUid || "",
          content: data.content || "",
          parentMessageId: data.parentMessageId || null,
          timestamp: data.timestamp || Date.now(),
          read: data.read || false,
        });
      }
    });

    const messages = Array.from(messageMap.values());
    messages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (e: any) {
    console.error("Messages GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
