import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

async function verifyAdmin(req: NextRequest) {
  if (!adminAuth) {
    throw new Error("Firebase Admin Auth not initialized");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  const decoded = await adminAuth.verifyIdToken(token);

  if (decoded.admin !== true && decoded.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Forbidden: Administrative privilege required");
  }

  return decoded;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin Database not initialized" }, { status: 500 });
    }

    const snapshot = await adminDb.collection("inquiries").orderBy("createdAt", "desc").get();
    const inquiries = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Anonymous",
        email: data.email || "",
        message: data.message || "",
        createdAt: data.createdAt || Date.now(),
        read: Boolean(data.read),
        status: data.status || (data.read ? "read" : "new"),
        userAgent: data.userAgent,
        ip: data.ip,
      };
    });

    return NextResponse.json({ inquiries });
  } catch (err: any) {
    console.error("[Admin Inquiries GET Error]:", err);
    const status = err.message.includes("Forbidden") ? 403 : err.message.includes("authorization") ? 401 : 500;
    return NextResponse.json({ error: err.message || "Failed to fetch inquiries" }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdmin(req);

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin Database not initialized" }, { status: 500 });
    }

    const body = await req.json();
    const { id, read, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing inquiry id" }, { status: 400 });
    }

    const docRef = adminDb.collection("inquiries").doc(id);
    const updatePayload: Record<string, any> = {};

    if (typeof read === "boolean") {
      updatePayload.read = read;
      updatePayload.status = read ? "read" : "new";
    }

    if (typeof status === "string") {
      updatePayload.status = status;
    }

    updatePayload.updatedAt = Date.now();

    await docRef.update(updatePayload);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Admin Inquiries PATCH Error]:", err);
    const status = err.message.includes("Forbidden") ? 403 : err.message.includes("authorization") ? 401 : 500;
    return NextResponse.json({ error: err.message || "Failed to update inquiry" }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifyAdmin(req);

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing inquiry id query parameter" }, { status: 400 });
    }

    await adminDb.collection("inquiries").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Admin Inquiries DELETE Error]:", err);
    const status = err.message.includes("Forbidden") ? 403 : err.message.includes("authorization") ? 401 : 500;
    return NextResponse.json({ error: err.message || "Failed to delete inquiry" }, { status });
  }
}
