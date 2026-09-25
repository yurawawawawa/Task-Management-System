import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Read the original logo.svg
const rawSvg = fs.readFileSync(path.join(process.cwd(), 'public/logo.svg'), 'utf8');
const match = rawSvg.match(/<path d="([^"]+)"/);
if (!match) {
  console.error('Could not find path in logo.svg');
  process.exit(1);
}
const pathD = match[1];

// The glyph in 1500x1500 space is centered at ~ (749.6, 663.8) with dimensions ~ 514x543.
// Let's create a normalized 512x512 viewBox where the glyph is centered with nice breathing room.
const targetSize = 512;
const scale = (targetSize * 0.72) / 543.155; // fits nicely within ~72% of canvas
const tx = targetSize / 2 - 749.625 * scale;
const ty = targetSize / 2 - 663.75 * scale;

// A) Adaptive Standalone SVG Logo (clean, centered, adapts to light/dark via currentColor and media queries)
const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <style>
    .trekly-mark { fill: #1a2e1f; }
    @media (prefers-color-scheme: dark) {
      .trekly-mark { fill: #fbf3e0; }
    }
  </style>
  <g transform="translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale.toFixed(5)})">
    <g transform="translate(487.780344, 927.453798)">
      <path class="trekly-mark" d="${pathD}" />
    </g>
  </g>
</svg>`;

// B) High-Contrast Branded Badge SVG (Visible on ANY background: pure white, deep black, transparent, browser tabs)
// Uses Trekly's signature dark forest background (#1a2e1f), warm border, and bright logo (#fbf3e0 / #ffc93c)
const badgeSvg = (size = 512, bgColor = '#1a2e1f', fgColor = '#fbf3e0', borderColor = '#0a93c7') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="#0e1b12" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- Rounded Squircle Tile -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="${borderColor}" stroke-width="16" />
  
  <!-- Centered Emblem -->
  <g transform="translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale.toFixed(5)})">
    <g transform="translate(487.780344, 927.453798)">
      <path d="${pathD}" fill="${fgColor}" />
    </g>
  </g>
</svg>`;

// C) Minimal High-Contrast Badge for Favicon / App Icons (Square squircle with vibrant brand colors)
const faviconBadgeSvg = (size = 512) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" rx="112" fill="#1a2e1f" />
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#ff7a2f" stroke-width="14" opacity="0.8" />
  <g transform="translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale.toFixed(5)})">
    <g transform="translate(487.780344, 927.453798)">
      <path d="${pathD}" fill="#fbf3e0" />
    </g>
  </g>
</svg>`;

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const appDir = path.join(process.cwd(), 'src/app');

  // Save the improved, centered public/logo.svg
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), adaptiveSvg.trim());
  console.log('✓ Updated public/logo.svg (centered, dual-mode light/dark)');

  // Save badge version
  fs.writeFileSync(path.join(publicDir, 'logo-badge.svg'), badgeSvg().trim());
  console.log('✓ Created public/logo-badge.svg');

  // Save favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconBadgeSvg(128).trim());
  fs.writeFileSync(path.join(appDir, 'icon.svg'), faviconBadgeSvg(128).trim());
  console.log('✓ Created public/favicon.svg and src/app/icon.svg');

  // Generate PNG sizes from badge SVG:
  const sizes = [
    { size: 16, name: 'favicon-16x16.png', target: publicDir },
    { size: 32, name: 'favicon-32x32.png', target: publicDir },
    { size: 32, name: 'icon.png', target: appDir },
    { size: 48, name: 'favicon-48x48.png', target: publicDir },
    { size: 180, name: 'apple-touch-icon.png', target: publicDir },
    { size: 180, name: 'apple-icon.png', target: appDir },
    { size: 192, name: 'icon-192.png', target: publicDir },
    { size: 512, name: 'icon-512.png', target: publicDir },
  ];

  for (const { size, name, target } of sizes) {
    const svgForSize = faviconBadgeSvg(size);
    await sharp(Buffer.from(svgForSize))
      .resize(size, size)
      .png()
      .toFile(path.join(target, name));
    console.log(`✓ Generated ${name} (${size}x${size}) in ${path.relative(process.cwd(), target)}`);
  }

  // Generate multi-size or 32x32 favicon.ico
  const ico32 = await sharp(Buffer.from(faviconBadgeSvg(32)))
    .resize(32, 32)
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), ico32);
  console.log('✓ Generated public/favicon.ico and src/app/favicon.ico');

  // Generate Web App Manifest
  const manifest = {
    name: "Trekly — Kerja Asik, Hidup Santai",
    short_name: "Trekly",
    description: "Personal productivity, habit tracker, and gamified streak system.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a2e1f",
    theme_color: "#1a2e1f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('✓ Generated public/manifest.json');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
