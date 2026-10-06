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

    const { recipientId, content, parentMessageId, attachments } = await req.json();
    const hasContent = typeof content === "string" && content.trim().length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    if (!recipientId || (!hasContent && !hasAttachments)) {
      return NextResponse.json({ error: "Missing recipient, message content, or attachments" }, { status: 400 });
    }

    // Sanitize attachments (max 5 attachments per message)
    const sanitizedAttachments = hasAttachments
      ? attachments.slice(0, 5).map((att: any) => ({
          id: String(att.id || Math.random().toString(36).substring(2, 9)),
          name: String(att.name || "Attachment").slice(0, 200),
          size: Number(att.size || 0),
          type: String(att.type || "application/octet-stream").slice(0, 100),
          url: String(att.url || ""),
        }))
      : [];

    const newMessage = {
      senderUid,
      senderName,
      senderRole: userRole,
      recipientUid: recipientId,
      content: (content || "").trim(),
      attachments: sanitizedAttachments,
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
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
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
          attachments: Array.isArray(data.attachments) ? data.attachments : [],
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

export async function PATCH(req: NextRequest) {
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

    const { messageId, read } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }

    const msgRef = adminDb.collection("messages").doc(messageId);
    const msgDoc = await msgRef.get();

    if (!msgDoc.exists) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const msgData = msgDoc.data();
    if (msgData?.recipientUid !== userUid && msgData?.senderUid !== userUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await msgRef.update({ read: Boolean(read) });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("Messages PATCH error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
