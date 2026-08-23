
const fs = require("fs");
let content = fs.readFileSync("components/candidate/CandidateSidebar.tsx", "utf8");

const oldUserRow = `        {/* User Context Menu Container */}
        <div ref={menuRef} className="relative flex items-center pt-6 border-t border-[#E5E5E5] mb-4 h-14">
          
          <AnimatePresence>`;

const newUserRow = `        {/* User Context Menu Container */}
        <div ref={menuRef} className={\`relative flex items-center pt-6 border-t border-[#E5E5E5] mb-4 transition-all duration-300 \${isCollapsed ? "flex-col gap-4 h-24" : "justify-between h-14"}\`}>
          
          <AnimatePresence>`;

content = content.replace(oldUserRow, newUserRow);

const oldAvatarAndToggle = `            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-[13px] text-[#0D0D0D] font-medium truncate whitespace-nowrap ml-1"
                >
                  {name}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
        </div>
        
        {/* Toggle Button Container - Below the avatar */}
        <div className="flex justify-center mt-2 h-10 items-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF] rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
        </div>`;

const newAvatarAndToggle = `            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-[13px] text-[#0D0D0D] font-medium truncate whitespace-nowrap ml-1 pr-2"
                >
                  {name}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-[#737373] hover:text-[#0D0D0D] hover:bg-[#FFFFFF] rounded-md transition-colors shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
          
        </div>`;

content = content.replace(oldAvatarAndToggle, newAvatarAndToggle);

// Ensure the avatar button is flexible but not 100% width when next to toggle
content = content.replace(
  `className={\`flex items-center cursor-pointer group p-1 rounded-lg transition-colors text-left overflow-hidden w-full \${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}\`}`,
  `className={\`flex items-center cursor-pointer group p-1 rounded-lg transition-colors text-left overflow-hidden \${isCollapsed ? "w-full" : "flex-1"} \${isUserMenuOpen ? "bg-[#F3F3F1]" : "hover:bg-[#F3F3F1]"}\`}`
);

fs.writeFileSync("components/candidate/CandidateSidebar.tsx", content, "utf8");

