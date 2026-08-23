
const fs = require("fs");

function addImport(file) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("import { PageTransition }")) {
    content = content.replace(
      "import { MobileNav } from \"@/components/ui/MobileNav\";",
      "import { MobileNav } from \"@/components/ui/MobileNav\";\nimport { PageTransition } from \"@/components/ui/PageTransition\";"
    );
    fs.writeFileSync(file, content, "utf8");
  }
}

addImport("app/employer/layout.tsx");
addImport("app/admin/layout.tsx");

