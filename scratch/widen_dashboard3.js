
const fs = require("fs");
const files = [
  "app/candidate/profile/page.tsx",
  "app/candidate/dashboard/page.tsx",
  "app/candidate/verification/page.tsx",
  "app/candidate/provenance/page.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  
  content = content.replace(
    /mx-auto max-w-7xl/g,
    `mx-auto max-w-[1600px]`
  );
  
  // also increase font size of H1s to make them more proportional to the larger screen
  content = content.replace(/text-\[32px\] sm:text-\[40px\]/g, "text-[40px] sm:text-[48px]");
  
  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");

