
const fs = require("fs");
const path = require("path");

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === "ENOTDIR" || err.code === "EBUSY") filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(".").filter(f => f.endsWith(".tsx"));

for (const file of files) {
  if (file.includes("node_modules") || file.includes(".next")) continue;
  
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("text-outline")) {
    content = content.replace(/text-outline/g, "text-muted-foreground");
    fs.writeFileSync(file, content, "utf8");
  }
}
console.log("Done replacing text-outline with text-muted-foreground");

