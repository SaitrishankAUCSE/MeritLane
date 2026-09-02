// Verification script to check live deployment status and endpoint responses
const BASE_URL = "https://merit-lane.vercel.app";

async function testEndpoint(name, path, method = "GET", headers = {}, body = null) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : null
    });
    console.log(`[${res.status}] ${name} (${method} ${path})`);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      console.log(`       Response:`, JSON.stringify(data).substring(0, 120));
      return { status: res.status, data };
    } else {
      console.log(`       Non-JSON response`);
      return { status: res.status };
    }
  } catch (err) {
    console.error(`[ERROR] ${name}:`, err.message);
    return { error: err.message };
  }
}

async function run() {
  console.log("=== VERIFYING LIVE MERITLANE PRODUCTION ENDPOINTS ===");
  
  // 1. Unauthenticated checks (Should reject with 401 Unauthorized, not 404 or 500)
  await testEndpoint("Discover API (Unauthenticated)", "/api/employer/discover", "POST", {}, {});
  await testEndpoint("Shortlist List API (Unauthenticated)", "/api/employer/shortlist/list", "GET");
  await testEndpoint("Shortlist Post API (Unauthenticated)", "/api/employer/shortlist", "POST", {}, { candidateId: "test" });
  await testEndpoint("Pipeline API (Unauthenticated)", "/api/employer/pipeline", "POST", {}, { candidateId: "test", stage: "interviewing" });
  await testEndpoint("AI Summary API (Unauthenticated)", "/api/employer/ai-summary", "POST", {}, { candidateId: "test" });
  await testEndpoint("Messages API (Unauthenticated)", "/api/messages", "POST", {}, { recipientId: "test", content: "hello" });
  await testEndpoint("Colleges Autocomplete API", "/api/colleges?q=Indian%20Institute", "GET");
  
  console.log("=== COMPLETED ===");
}

run();
