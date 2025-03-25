import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

const sourceIcon = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
sizes.forEach(({ size, name }) => {
  sharp(sourceIcon)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, name))
    .then(() => console.log(`Generated ${name}`))
    .catch(err => console.error(`Error generating ${name}:`, err));
});

// Generate masked icon (monochrome version)
sharp(sourceIcon)
  .resize(512, 512)
  .modulate({ brightness: 0, saturation: 0 })
  .toFile(path.join(outputDir, 'masked-icon.svg'))
  .then(() => console.log('Generated masked-icon.svg'))
  .catch(err => console.error('Error generating masked-icon.svg:', err)); 