
const fs = require("fs");
let content = fs.readFileSync("app/candidate/assessment/page.tsx", "utf8");

content = content.replace(
  /<MeritlaneLoader level="page" text="Initializing" \/>/g,
  `<div className="flex h-full w-full items-center justify-center"><MeritlaneLoader level="section" text="Initializing" /></div>`
);

content = content.replace(
  /<MeritlaneLoader level="page" text="Loading" \/>/g,
  `<div className="flex h-full w-full items-center justify-center"><MeritlaneLoader level="section" text="Loading" /></div>`
);

fs.writeFileSync("app/candidate/assessment/page.tsx", content, "utf8");

