
const https = require("https");

async function checkUrl(path, method = "GET") {
  const url = "https://merit-lane-m5s14g5dw-saitrishankb9-4328s-projects.vercel.app" + path;
  return new Promise((resolve) => {
    const req = https.request(url, { method }, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on("error", (e) => resolve({ error: e.message }));
    req.end();
  });
}

async function runTests() {
  console.log("Starting smoke tests...");
  const home = await checkUrl("/");
  console.log("Home:", home.status);
  
  const login = await checkUrl("/login");
  console.log("Login:", login.status);
  
  const apiAssessment = await checkUrl("/api/start-assessment", "POST");
  console.log("Start Assessment (unauth):", apiAssessment.status);

  const apiDiscover = await checkUrl("/api/employer/discover", "POST");
  console.log("Employer Discover (unauth):", apiDiscover.status);
}
runTests();

