
const fs = require("fs");
const path = require("path");

const dirs = ["app", "components", "lib"];

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith(".tsx")) filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = [];
for (const d of dirs) {
    if (fs.existsSync(d)) files.push(...walkSync(d));
}

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("text-outline")) {
    content = content.replace(/text-outline/g, "text-muted-foreground");
    fs.writeFileSync(file, content, "utf8");
  }
}
console.log("Done");

