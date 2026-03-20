// Run with: node scripts/generate-icons.mjs
// Generates PWA icons from a canvas drawing

import { writeFileSync, mkdirSync } from 'fs';

// We'll create a simple museum emoji icon as a data URI
// For a real app, replace with a designed icon

const sizes = [192, 512];

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#FECA57"/>
  <text x="256" y="340" font-size="300" text-anchor="middle" font-family="sans-serif">🏛️</text>
</svg>
`;

try {
    mkdirSync('public/icons', { recursive: true });
} catch { }

// Write SVG versions (browsers handle them well)
for (const size of sizes) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#FECA57"/>
  <text x="256" y="360" font-size="280" text-anchor="middle">🏛️</text>
</svg>`;
    writeFileSync(`public/icons/icon-${size}.svg`, svg.trim());
}

console.log('✅ Icons generated in public/icons/');