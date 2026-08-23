
const fs = require("fs");
let content = fs.readFileSync("components/candidate/CandidateSidebar.tsx", "utf8");

// Fix brand container padding
content = content.replace(
  `      <div className="flex h-20 items-center shrink-0 relative overflow-hidden px-8">`,
  `      <div className="flex h-20 items-center shrink-0 relative overflow-hidden w-full">`
);

// Fix nav icons wrapper width from w-20 to w-12 (48px)
content = content.replace(
  `              <div className="w-20 flex justify-center shrink-0">`,
  `              <div className="w-12 flex justify-center shrink-0">`
);
content = content.replace(
  `                  <motion.span \n                    initial={{ opacity: 0, width: 0 }}\n                    animate={{ opacity: 1, width: "auto" }}\n                    exit={{ opacity: 0, width: 0 }}\n                    transition={{ duration: 0.3, ease: "easeInOut" }}\n                    className="whitespace-nowrap -ml-6"\n                  >`,
  `                  <motion.span \n                    initial={{ opacity: 0, width: 0 }}\n                    animate={{ opacity: 1, width: "auto" }}\n                    exit={{ opacity: 0, width: 0 }}\n                    transition={{ duration: 0.3, ease: "easeInOut" }}\n                    className="whitespace-nowrap"\n                  >`
);

// Fix add evidence button text margin
content = content.replace(
  `                className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap -ml-2"`,
  `                className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap ml-1"`
);

// Fix user menu container to align avatar correctly
content = content.replace(
  `          <button \n            type="button"\n            className={\`flex items-center cursor-pointer group p-1.5 rounded-lg transition-colors text-left overflow-hidden \${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}\`}\n            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}\n          >\n            <div className="h-8 w-8 rounded-full bg-[#E5E5E5] border border-[#D2D2D2] group-hover:border-[#737373] flex items-center justify-center overflow-hidden text-xs transition-colors shrink-0">\n              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}\n            </div>`,
  `          <button \n            type="button"\n            className={\`flex items-center cursor-pointer group p-1 rounded-lg transition-colors text-left overflow-hidden w-full \${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}\`}\n            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}\n          >\n            <div className="w-10 flex justify-center shrink-0">\n              <div className="h-8 w-8 rounded-full bg-[#E5E5E5] border border-[#D2D2D2] group-hover:border-[#737373] flex items-center justify-center overflow-hidden text-xs transition-colors shrink-0">\n                {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}\n              </div>\n            </div>`
);

// Remove the ml-3 from the user name to balance it with the new w-10 avatar wrapper
content = content.replace(
  `                  className="text-[13px] text-[#0D0D0D] font-medium truncate whitespace-nowrap ml-3"`,
  `                  className="text-[13px] text-[#0D0D0D] font-medium truncate whitespace-nowrap ml-1"`
);

fs.writeFileSync("components/candidate/CandidateSidebar.tsx", content, "utf8");

