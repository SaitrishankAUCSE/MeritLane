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

replaceInFile('app/icon.tsx', [
    ['#0A192F', '#0D0D0D'],
    ['#D4AF37', '#FFFFFF']
]);

replaceInFile('app/apple-icon.tsx', [
    ['#0A192F', '#0D0D0D'],
    ['#D4AF37', '#FFFFFF']
]);

