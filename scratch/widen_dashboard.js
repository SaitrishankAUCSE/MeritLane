
const fs = require("fs");
const files = [
  "app/candidate/profile/page.tsx",
  "app/candidate/dashboard/page.tsx",
  "app/candidate/verification/page.tsx",
  "app/candidate/provenance/page.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace narrow wrappers with full-page wrappers
  content = content.replace(
    /className="mx-auto max-w-4xl px-6 py-12/g,
    `className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px]`
  );
  content = content.replace(
    /className="mx-auto max-w-5xl px-6 py-12/g,
    `className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px]`
  );
  content = content.replace(
    /className="mx-auto max-w-3xl px-6 py-12/g,
    `className="w-full px-8 md:px-16 lg:px-24 py-12 mx-auto max-w-[1600px]`
  );

  fs.writeFileSync(file, content, "utf8");
}
console.log("Done");

