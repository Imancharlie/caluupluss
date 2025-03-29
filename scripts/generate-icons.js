const sharp = require('sharp');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const sizes = [192, 512];
const sourceIcon = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log(chalk.blue('Generating PWA icons...'));

  for (const size of sizes) {
    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(chalk.green(`✓ Generated ${size}x${size} icon`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to generate ${size}x${size} icon:`, error));
    }
  }

  console.log(chalk.blue('\nIcon generation complete!'));
}

generateIcons(); 