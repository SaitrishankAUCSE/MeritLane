
const fs = require("fs");
let content = fs.readFileSync("app/candidate/assessment/page.tsx", "utf8");

const findStr = `  if (initializing || loading || !content) {
    return <MeritlaneLoader level="page" text="Initializing" />;
  }

  if (errorMsg) {`;

const replaceStr = `  if (errorMsg) {`;

content = content.replace(findStr, replaceStr);

const findStr2 = `    );
  }

  if (!hasStarted) {`;

const replaceStr2 = `    );
  }

  if (initializing || loading || !content) {
    return <MeritlaneLoader level="page" text="Initializing" />;
  }

  if (!hasStarted) {`;

content = content.replace(findStr2, replaceStr2);

fs.writeFileSync("app/candidate/assessment/page.tsx", content, "utf8");

