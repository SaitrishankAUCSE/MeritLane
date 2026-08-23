
const fs = require("fs");
let content = fs.readFileSync("app/page.tsx", "utf8");

content = content.replace(/text-outline/g, "text-muted-foreground");
content = content.replace(/placeholder:text-outline/g, "placeholder:text-muted-foreground");

fs.writeFileSync("app/page.tsx", content, "utf8");
console.log("Done");

