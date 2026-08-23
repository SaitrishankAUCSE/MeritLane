
const fs = require("fs");
let content = fs.readFileSync("app/layout.tsx", "utf8");

if (!content.includes("GlobalBackButton")) {
  content = content.replace(
    "import { Analytics } from \"@vercel/analytics/react\";",
    "import { Analytics } from \"@vercel/analytics/react\";\nimport { GlobalBackButton } from \"@/components/ui/GlobalBackButton\";"
  );
  
  content = content.replace(
    "<Analytics />\n      </body>",
    "<Analytics />\n        <GlobalBackButton />\n      </body>"
  );
  
  fs.writeFileSync("app/layout.tsx", content, "utf8");
}

