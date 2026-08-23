
const fs = require("fs");
let content = fs.readFileSync("components/ui/footer-section.tsx", "utf8");
content = content.replace(/Ac \{new Date\(\)\.getFullYear\(\)\}/, "© {new Date().getFullYear()}");
fs.writeFileSync("components/ui/footer-section.tsx", content, "utf8");

