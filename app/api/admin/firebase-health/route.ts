export const runtime = "nodejs";

export async function GET() {
  try {
    const vars = {
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    };

    let credSource = "none";
    if (vars.hasServiceAccount) credSource = "service-account-json";
    else if (vars.hasProjectId && vars.hasClientEmail && vars.hasPrivateKey) credSource = "individual-env-vars";

    // Lazy load firebase-admin to catch import errors
    let adminAppMod;
    try {
      adminAppMod = await import('firebase-admin/app');
    } catch (e: any) {
      return Response.json({ ok: false, stage: "IMPORT_ADMIN_APP", message: e.message }, { status: 500 });
    }

    const { initializeApp, getApps, cert } = adminAppMod;
    let app;

    try {
      if (getApps().length) {
        app = getApps()[0];
      } else {
        let serviceAccount: any;
        const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (rawKey) {
          try {
            serviceAccount = JSON.parse(rawKey);
          } catch {
            const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decoded);
          }
        } else if (credSource === "individual-env-vars") {
          serviceAccount = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY,
          };
        } else {
          throw new Error("Missing credentials");
        }

        let privateKeyNormalization = "skipped";
        if (serviceAccount.private_key) {
          try {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            privateKeyNormalization = "success";
          } catch (e) {
            privateKeyNormalization = "failed";
          }
        }

        app = initializeApp({
          credential: cert(serviceAccount),
        });

        return Response.json({
          ok: true,
          stage: "ADMIN_INIT_SUCCESS",
          env: vars,
          credSource,
          privateKeyNormalization,
          clientProjectIdMatches: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === serviceAccount.project_id
        });
      }
    } catch (e: any) {
      return Response.json({
        ok: false,
        stage: "ADMIN_INIT_FAILED",
        env: vars,
        credSource,
        message: e.message,
        stack: e.stack
      }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json({
      ok: false,
      stage: "UNKNOWN",
      message: error.message
    }, { status: 500 });
  }
}
