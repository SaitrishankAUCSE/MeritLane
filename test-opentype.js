const opentype = require('opentype.js');

opentype.load('public/fonts/IndieFlower-Regular.ttf', (err, font) => {
  if (err) {
    console.error(err);
    return;
  }
  const path = font.getPath('Meritlane', 0, 72, 72);
  const bbox = path.getBoundingBox();
  console.log('Bounding Box:', bbox);
});
