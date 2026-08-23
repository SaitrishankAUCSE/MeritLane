
const fs = require("fs");
const files = [
  "app/candidate/profile/page.tsx",
  "app/candidate/dashboard/page.tsx",
  "app/candidate/verification/page.tsx",
  "app/candidate/provenance/page.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace max-w-[1600px] with max-w-7xl
  content = content.replace(
    /mx-auto max-w-\[1600px\]/g,
    `mx-auto max-w-7xl`
  );

  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");

