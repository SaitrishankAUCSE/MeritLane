
const fs = require("fs");
let content = fs.readFileSync("app/layout.tsx", "utf8");

content = content.replace(
  /import \{ GlobalBackButton \} from "@\/components\/ui\/GlobalBackButton";/,
  `import { GlobalBackButton } from "@/components/ui/GlobalBackButton";\nimport { RootPageTransition } from "@/components/ui/RootPageTransition";`
);

content = content.replace(
  /<main className="flex-1">{children}<\/main>/,
  `<main className="flex-1 flex flex-col">\n              <RootPageTransition>{children}</RootPageTransition>\n            </main>`
);

fs.writeFileSync("app/layout.tsx", content, "utf8");
console.log("Done");

