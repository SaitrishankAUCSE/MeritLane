
const fs = require("fs");
let content = fs.readFileSync("components/ui/footer-section.tsx", "utf8");

// Add next/link import
content = content.replace(
  /import { Button } from "@\/components\/ui\/Button"/,
  "import Link from \"next/link\"\nimport { Button } from \"@/components/ui/Button\""
);

// Subscribe button fix
content = content.replace(
  /<form className="relative">/,
  `<form className="relative" onSubmit={(e) => { e.preventDefault(); alert("Subscribed successfully!"); }}>`
);

// Platform Links
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*For Engineers\s*<\/a>/,
  `<Link href="/signup" className="block transition-colors hover:text-foreground text-muted-foreground">For Engineers</Link>`
);
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*For Employers\s*<\/a>/,
  `<Link href="/login" className="block transition-colors hover:text-foreground text-muted-foreground">For Employers</Link>`
);
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*Verification Standard\s*<\/a>/,
  `<Link href="/" className="block transition-colors hover:text-foreground text-muted-foreground">Verification Standard</Link>`
);
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*Methodology\s*<\/a>/,
  `<Link href="/" className="block transition-colors hover:text-foreground text-muted-foreground">Methodology</Link>`
);

// Institution Links
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*About Us\s*<\/a>/,
  `<Link href="/" className="block transition-colors hover:text-foreground text-muted-foreground">About Us</Link>`
);
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*Careers\s*<\/a>/,
  `<Link href="/" className="block transition-colors hover:text-foreground text-muted-foreground">Careers</Link>`
);
content = content.replace(
  /<a href="#" className="block transition-colors hover:text-foreground text-muted-foreground">\s*Contact Support\s*<\/a>/,
  `<a href="mailto:hello@meritlane.app" className="block transition-colors hover:text-foreground text-muted-foreground">Contact Support</a>`
);

// Social Buttons
content = content.replace(
  /<Button variant="outline" size="icon" className="rounded-full">/g,
  `<Button variant="outline" size="icon" className="rounded-full" asChild>`
);
// Wait, my custom Button doesn`t necessarily support `asChild`. Let`s just add `href`.
content = content.replace(
  /<Button variant="outline" size="icon" className="rounded-full" asChild>/g,
  `<Button variant="outline" size="icon" className="rounded-full">`
);

content = content.replace(
  /<Button variant="outline" size="icon" className="rounded-full">([\s\S]*?)<MessageCircle/,
  `<Button href="https://twitter.com/meritlane" variant="outline" size="icon" className="rounded-full" target="_blank" rel="noopener noreferrer">$1<MessageCircle`
);
content = content.replace(
  /<Button variant="outline" size="icon" className="rounded-full">([\s\S]*?)<Share2/,
  `<Button href="https://linkedin.com/company/meritlane" variant="outline" size="icon" className="rounded-full" target="_blank" rel="noopener noreferrer">$1<Share2`
);

// Bottom Links
content = content.replace(
  /<a href="#" className="transition-colors hover:text-foreground">\s*Privacy Policy\s*<\/a>/,
  `<Link href="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>`
);
content = content.replace(
  /<a href="#" className="transition-colors hover:text-foreground">\s*Terms of Service\s*<\/a>/,
  `<Link href="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>`
);

fs.writeFileSync("components/ui/footer-section.tsx", content, "utf8");
console.log("Done patching footer links");

