
const fs = require("fs");
let content = fs.readFileSync("components/ui/Button.tsx", "utf8");

content = content.replace(
  /rounded-sm/g,
  "rounded-full"
);

const oldVariantStyles = `  const variantStyles = {
    primary:
      "bg-[#0D0D0D] text-[#FFFFFF] border border-[#0D0D0D] hover:bg-[#222222] hover:border-[#222222]",
    secondary:
      "bg-[#FFFFFF] text-[#0D0D0D] border border-[#E5E5E5] hover:bg-[#F3F3F1]",
    outline:
      "bg-[#FFFFFF] text-[#0D0D0D] border border-[#E5E5E5] hover:bg-[#F3F3F1]",
    ghost:
      "bg-transparent text-[#525252] border border-transparent hover:text-[#0D0D0D] hover:bg-[#F3F3F1]",
    tertiary:
      "bg-transparent text-[#737373] border border-transparent underline-offset-4 hover:underline hover:text-[#525252] p-0 h-auto",
    danger:
      "bg-[#B42318]/5 text-[#B42318] border border-[#B42318]/20 hover:bg-[#B42318] hover:text-[#FFFFFF] hover:border-[#B42318]",
    success:
      "bg-[#15803D]/5 text-[#15803D] border border-[#15803D]/20 hover:bg-[#15803D] hover:text-[#FFFFFF] hover:border-[#15803D]",
  };`;

const newVariantStyles = `  const variantStyles = {
    primary:
      "bg-[#0D0D0D]/70 backdrop-blur-md border border-white/20 shadow-[0_4px_14px_0_rgba(0,0,0,0.25),inset_0_-2px_6px_0_rgba(0,0,0,0.3),inset_0_2px_4px_0_rgba(255,255,255,0.15)] text-[#FFFFFF] hover:bg-[#0D0D0D]/80 active:scale-95",
    secondary:
      "bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_14px_0_rgba(0,0,0,0.08),inset_0_-2px_6px_0_rgba(0,0,0,0.05),inset_0_2px_4px_0_rgba(255,255,255,1)] text-[#0D0D0D] hover:bg-white/80 active:scale-95",
    outline:
      "bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_4px_14px_0_rgba(0,0,0,0.08),inset_0_-2px_6px_0_rgba(0,0,0,0.05),inset_0_2px_4px_0_rgba(255,255,255,1)] text-[#0D0D0D] hover:bg-white/80 active:scale-95",
    ghost:
      "bg-transparent hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/40 text-[#525252] hover:text-[#0D0D0D] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.05)] active:scale-95",
    tertiary:
      "bg-transparent text-[#737373] border border-transparent underline-offset-4 hover:underline hover:text-[#525252] p-0 h-auto",
    danger:
      "bg-[#B42318]/70 backdrop-blur-md border border-[#B42318]/50 shadow-[0_4px_14px_0_rgba(180,35,24,0.25),inset_0_-2px_6px_0_rgba(0,0,0,0.2),inset_0_2px_4px_0_rgba(255,255,255,0.2)] text-white hover:bg-[#B42318]/80 active:scale-95",
    success:
      "bg-[#15803D]/70 backdrop-blur-md border border-[#15803D]/50 shadow-[0_4px_14px_0_rgba(21,128,61,0.25),inset_0_-2px_6px_0_rgba(0,0,0,0.2),inset_0_2px_4px_0_rgba(255,255,255,0.2)] text-white hover:bg-[#15803D]/80 active:scale-95",
  };`;

content = content.replace(oldVariantStyles, newVariantStyles);
fs.writeFileSync("components/ui/Button.tsx", content, "utf8");
console.log("Done");

