const fs = require('fs');
const opentype = require('opentype.js');

const buffer = fs.readFileSync('public/fonts/IndieFlower-Regular.ttf');
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const p = font.getPath('MeritLane', 0, 72, 72);
const d = p.toPathData(2);

const segments = d.split(/(?=[M])/g).filter(s => s.trim().length > 0);
console.log(`Split into ${segments.length} segments`);
console.log("Lengths of first few segments:", segments.slice(0, 5).map(s => s.length));
