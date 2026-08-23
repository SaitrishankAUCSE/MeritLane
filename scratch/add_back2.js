
const fs = require("fs");
let content = fs.readFileSync("app/layout.tsx", "utf8");

content = content.replace(
  /<Analytics \/>\s*<\/body>/,
  "<Analytics />\n        <GlobalBackButton />\n      </body>"
);

fs.writeFileSync("app/layout.tsx", content, "utf8");

