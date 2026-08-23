
const fs = require("fs");
let content = fs.readFileSync("app/candidate/provenance/page.tsx", "utf8");

content = content.replace(
  /<div className="flex h-full w-full flex-col bg-\[#FAFAFA\] overflow-hidden">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}/m,
  `<div className="mx-auto max-w-5xl px-6 py-12 h-full overflow-y-auto scrollbar-hide relative">
      <div className="mb-12">
        <div className="text-[14px] font-sans font-medium text-[#737373] mb-3">
          Output Layer
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-6">
          <div>
            <h1 className="font-serif text-[32px] sm:text-[40px] text-[#0D0D0D] leading-tight mb-2">Provenance Record</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + \`/p/\${user!.uid}\`);
                alert("Public link copied to clipboard!");
              }}
              className="px-5 py-2 border border-[#D2D2D2] text-[#737373] hover:text-[#0D0D0D] hover:border-[#0D0D0D] rounded-md text-[14px] font-sans font-medium transition-all"
            >
              Copy link
            </button>
            <a href={\`/p/\${user!.uid}\`} target="_blank" rel="noreferrer" className="px-5 py-2 border border-[#0D0D0D] bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#222222] hover:text-[#FFFFFF] rounded-md text-[14px] font-sans font-medium transition-all">
              View public record
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none opacity-90 border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm bg-[#FFFFFF]">
        <PublicProofRecord id={user!.uid} candidate={candidate} user={userDoc || {}} hideHeader={true} />
      </div>
    </div>
  );
}`
);

fs.writeFileSync("app/candidate/provenance/page.tsx", content, "utf8");

