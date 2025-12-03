import sharp from "sharp";
import fs from "fs";
import path from "path";

const publicDir = path.join(__dirname, "public");

async function createIcons() {
  // SVG template
  const svgImage = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#4f46e5"/>
      <circle cx="256" cy="256" r="180" fill="white"/>
    </svg>
  `;

  try {
    // Create 192x192
    await sharp(Buffer.from(svgImage))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, "icon-192.png"));
    console.log("✓ icon-192.png created");

    // Create 512x512
    await sharp(Buffer.from(svgImage))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, "icon-512.png"));
    console.log("✓ icon-512.png created");

    // Create maskable (192x192)
    await sharp(Buffer.from(svgImage))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, "icon-maskable.png"));
    console.log("✓ icon-maskable.png created");

    console.log("\nAll icons created successfully!");
  } catch (error) {
    console.error("Error creating icons:", error);
  }
}

createIcons();
