
const fs = require("fs");
let content = fs.readFileSync("app/candidate/assessment/page.tsx", "utf8");
content = content.replace(/\/candidate\/dashboard\?verified=true/g, "/candidate/verification");
content = content.replace(/\/candidate\/dashboard/g, "/candidate/verification");
content = content.replace(/>Return to workspace<\/button>/g, ">Return to Verification Center</button>");
fs.writeFileSync("app/candidate/assessment/page.tsx", content, "utf8");

