
const fs = require("fs");

function patchLayout(file, childContainerTag) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("PageTransition")) {
    // Add import after "use client" or other imports
    content = content.replace(/(import .* from .*;\n)+/, (match) => {
      return match + `import { PageTransition } from "@/components/ui/PageTransition";\n`;
    });
    
    // Wrap children
    content = content.replace(/{children}/g, "<PageTransition>{children}</PageTransition>");
    
    fs.writeFileSync(file, content, "utf8");
    console.log("Patched", file);
  }
}

patchLayout("app/employer/layout.tsx");
patchLayout("app/admin/layout.tsx");

