const https = require('https');
const fs = require('fs');
const path = require('path');

https.get('https://raw.githubusercontent.com/VarthanV/Indian-Colleges-List/master/colleges.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const raw = JSON.parse(data);
    const unique = new Map();
    
    raw.forEach(item => {
      // Add the college
      if (item.college) {
        const cleanName = item.college.replace(/\s*\(Id:\s*C-\d+\)\s*/i, '').trim();
        let formatted = cleanName;
        if (item.district && item.state) formatted += `, ${item.district}, ${item.state}`;
        else if (item.state) formatted += `, ${item.state}`;
        
        unique.set(formatted, { name: formatted, searchStr: formatted.toLowerCase() });
      }
      
      // Add the university itself as an option!
      if (item.university) {
        const cleanUni = item.university.replace(/\s*\(Id:\s*U-\w+\)\s*/i, '').trim();
        if (cleanUni && !unique.has(cleanUni)) {
            unique.set(cleanUni, { name: cleanUni, searchStr: cleanUni.toLowerCase() });
        }
      }
    });

    const optimized = Array.from(unique.values());
    const dir = path.join(__dirname, '../lib/data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(path.join(dir, 'colleges.json'), JSON.stringify(optimized));
    console.log('Optimized colleges generated. Count:', optimized.length);
  });
}).on('error', (e) => {
  console.error(e);
});
