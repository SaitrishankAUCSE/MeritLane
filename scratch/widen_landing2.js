
const fs = require("fs");

let page = fs.readFileSync("app/page.tsx", "utf8");
page = page.replace(
  /mx-auto w-full max-w-7xl px-8 md:px-16 lg:px-24/g,
  `mx-auto w-full max-w-[1600px] px-8 md:px-16 lg:px-24`
);

fs.writeFileSync("app/page.tsx", page, "utf8");

console.log("Done");

