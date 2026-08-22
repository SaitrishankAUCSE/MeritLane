const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    for (const [search, replace] of replacements) {
        newContent = newContent.split(search).join(replace);
    }
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated ' + filePath);
    }
}

// 1. Settings page toggles
replaceInFile('app/candidate/settings/page.tsx', [
    ['bg-[#c0c1ff]', 'bg-[#15803D]']
]);

// 2. Support page icons
replaceInFile('app/candidate/support/page.tsx', [
    ['text-[#9b8afb]', 'text-[#0D0D0D]'],
    ['text-[#4ade80]', 'text-[#15803D]']
]);

// 3. Public record loading
replaceInFile('app/p/[id]/loading.tsx', [
    ['bg-[#F6F4FB]', 'bg-[#FAFAFA]']
]);

// 4. Proof page
replaceInFile('app/proof/page.tsx', [
    ['#9b8afb', '#0D0D0D'],
    ['#4ade80', '#15803D'],
    ['#f59e0b', '#A16207']
]);

// 5. Not found page
replaceInFile('app/not-found.tsx', [
    ['bg-[#F0EAD6]', 'bg-surface-low'],
    ['text-[#0A192F]/80', 'text-muted-foreground'],
    ['text-[#0A192F]', 'text-foreground'],
    ['text-[#D4AF37]', 'text-foreground'],
    ['border-[#D4AF37]/50', 'border-border']
]);

// 6. ProofTrace modal
replaceInFile('components/ui/ProofTrace.tsx', [
    ['bg-[#0A0A0A]', 'bg-surface'],
    ['bg-[#1A1A1A]', 'bg-surface-low']
]);

