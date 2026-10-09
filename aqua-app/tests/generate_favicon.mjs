import fs from 'node:fs';

// 16x16 Aqua-blue PNG
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVR42mP8z8AARAwMDDxAPBGIm4FYggE3mA3EG4G4Doh5gZgZiRtcgXgOEDMD8UogbgRiZiheD8QtQLwKiJmAeCEQt+DSxwbEukB8BojfAfFtIGYl1QAmqB5eGIZqgEk1AADr6B41yM8f+QAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

// Construct ICO container wrapping the PNG
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // ICO type
icoHeader.writeUInt16LE(1, 4); // 1 image

icoHeader.writeUInt8(16, 6);   // width
icoHeader.writeUInt8(16, 7);   // height
icoHeader.writeUInt8(0, 8);    // color count
icoHeader.writeUInt8(0, 9);    // reserved
icoHeader.writeUInt16LE(1, 10); // color planes
icoHeader.writeUInt16LE(32, 12); // bits per pixel
icoHeader.writeUInt32LE(pngBuffer.length, 14); // image size
icoHeader.writeUInt32LE(22, 18); // offset to data

const icoFile = Buffer.concat([icoHeader, pngBuffer]);
fs.writeFileSync('public/favicon.ico', icoFile);
fs.writeFileSync('src/app/favicon.ico', icoFile);
console.log('favicon.ico successfully generated in public/ and src/app/ (size:', icoFile.length, 'bytes)');
