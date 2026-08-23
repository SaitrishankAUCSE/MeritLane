
const fs = require("fs");
let content = fs.readFileSync("components/ui/footer-section.tsx", "utf8");

content = content.replace(
  /Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter/g,
  "Globe, Share2, MessageCircle, Moon, Send, Sun, Mail"
);

content = content.replace(/<Facebook /g, "<Globe ");
content = content.replace(/<Twitter /g, "<MessageCircle ");
content = content.replace(/<Linkedin /g, "<Share2 ");
content = content.replace(/<Instagram /g, "<Mail "); // wait, Instagram wasn`t used in the component? Oh it was.

fs.writeFileSync("components/ui/footer-section.tsx", content, "utf8");
console.log("Done");

