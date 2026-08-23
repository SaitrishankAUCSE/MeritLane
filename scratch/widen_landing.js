
const fs = require("fs");

// 1. Widen Navbar
let navbar = fs.readFileSync("components/Navbar.tsx", "utf8");
navbar = navbar.replace(
  /mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6 lg:px-10/,
  `mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-8 md:px-16 lg:px-24`
);
fs.writeFileSync("components/Navbar.tsx", navbar, "utf8");

// 2. Widen Landing Page (app/page.tsx)
let page = fs.readFileSync("app/page.tsx", "utf8");
// Replace all instances of max-w-7xl px-6 lg:px-10
page = page.replace(
  /w-full max-w-7xl mx-auto/g,
  `w-full max-w-[1600px] mx-auto`
);
page = page.replace(
  /px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:px-10/g,
  `px-8 md:px-16 lg:px-24 pt-32 pb-24 sm:pt-40 sm:pb-32`
);
page = page.replace(
  /px-6 lg:px-10/g,
  `px-8 md:px-16 lg:px-24`
);

// Scale up the buttons and fonts slightly to match the wide layout (text-[14px] -> text-[16px], h-11 -> h-12)
page = page.replace(/text-\[14px\] font-medium font-sans/g, "text-[16px] font-medium font-sans");
page = page.replace(/h-11 px-6/g, "h-12 px-8");
page = page.replace(/text-\[17px\] lg:text-\[18px\]/g, "text-[18px] lg:text-[20px]");

fs.writeFileSync("app/page.tsx", page, "utf8");

console.log("Done");

