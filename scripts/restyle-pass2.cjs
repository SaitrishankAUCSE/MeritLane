const fs = require('fs');
const files = [
  'app/candidate/dashboard/page.tsx',
  'app/candidate/profile/page.tsx',
  'app/employer/dashboard/page.tsx',
  'components/public-record/PublicProofRecord.tsx',
  'components/Navbar.tsx',
  'app/page.tsx',
  'components/ui/Button.tsx',
  'components/ui/Input.tsx',
  'components/ui/Card.tsx',
  'components/ui/Badge.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const oldContent = content;
    content = content.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-none');
    content = content.replace(/\brounded\b(?!\-)/g, 'rounded-none');
    if (content !== oldContent) {
      fs.writeFileSync(file, content);
      console.log('Updated ' + file);
    }
  }
}
