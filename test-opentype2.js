const fs = require('fs');
const opentype = require('opentype.js');

const buffer = fs.readFileSync('public/fonts/IndieFlower-Regular.ttf');
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const p = font.getPath('MeritLane', 0, 72, 72);
const bbox = p.getBoundingBox();
console.log("BBox:", bbox);
const pad = 5;
const vx = Math.floor(bbox.x1) - pad;
const vy = Math.floor(bbox.y1) - pad;
const vw = Math.ceil(bbox.x2 - bbox.x1) + pad * 2;
const vh = Math.ceil(bbox.y2 - bbox.y1) + pad * 2;
console.log("ViewBox:", `${vx} ${vy} ${vw} ${vh}`);
const d = p.toPathData(2);
console.log("Path length:", d.length);
console.log("First 100 chars of path:", d.substring(0, 100));
