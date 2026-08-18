export const runtime = "nodejs";

export async function GET() {
  try {
    let stage = "START";

    // 1. Test module import
    stage = "LIB_ADMIN_IMPORT";
    let adminModule;
    try {
      adminModule = await import('@/lib/firebase/admin');
    } catch (e: any) {
      return Response.json({
        ok: false,
        stage: "LIB_ADMIN_IMPORT_FAILED",
        message: e.message,
        stack: e.stack
      }, { status: 500 });
    }

    const { adminDb, adminAuth } = adminModule;

    // 2. Test getAuth & getFirestore success
    if (!adminAuth || !adminDb) {
      return Response.json({
        ok: false,
        stage: "SERVICES_INIT_FAILED",
        hasAdminAuth: !!adminAuth,
        hasAdminDb: !!adminDb
      }, { status: 500 });
    }

    // 3. Test Firestore query
    stage = "FIRESTORE_QUERY";
    let count = 0;
    try {
      const snap = await adminDb.collection('candidates').get();
      count = snap.size;
    } catch (e: any) {
      return Response.json({
        ok: false,
        stage: "FIRESTORE_QUERY_FAILED",
        message: e.message,
        code: e.code
      }, { status: 500 });
    }

    return Response.json({
      ok: true,
      stage: "FIRESTORE_QUERY_SUCCESS",
      hasAdminAuth: true,
      hasAdminDb: true,
      count
    });

  } catch (error: any) {
    return Response.json({
      ok: false,
      stage: "UNKNOWN",
      message: error.message
    }, { status: 500 });
  }
}
