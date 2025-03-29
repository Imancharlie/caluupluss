import sharp from 'sharp';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/logo.svg');
const outputDir = path.join(__dirname, '../public/icons');
const blogImagesDir = path.join(__dirname, '../public/blog');
const screenshotsDir = path.join(__dirname, '../public/screenshots');

// Ensure output directories exist
[outputDir, blogImagesDir, screenshotsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateIcons() {
  console.log(chalk.blue('Generating PWA icons...'));

  // Generate PWA icons
  for (const size of sizes) {
    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 26, g: 54, b: 93, alpha: 1 }
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(chalk.green(`✓ Generated ${size}x${size} icon`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to generate ${size}x${size} icon:`, error));
    }
  }

  // Generate Apple touch icon (needs special treatment for iOS)
  try {
    await sharp(sourceIcon)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 26, g: 54, b: 93, alpha: 1 }
      })
      .png({
        quality: 100,
        compressionLevel: 9,
      })
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    console.log(chalk.green('✓ Generated apple-touch-icon.png'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to generate apple-touch-icon:', error));
  }

  // Generate favicon with special size for browser tabs
  try {
    await sharp(sourceIcon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 26, g: 54, b: 93, alpha: 1 }
      })
      .png({
        quality: 100,
        compressionLevel: 9,
      })
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    console.log(chalk.green('✓ Generated favicon.ico'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to generate favicon:', error));
  }

  // Generate maskable icon (with padding for safe area)
  try {
    await sharp(sourceIcon)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 26, g: 54, b: 93, alpha: 1 },
        position: 'centre'
      })
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 26, g: 54, b: 93, alpha: 1 }
      })
      .resize(512, 512)
      .png({
        quality: 100,
        compressionLevel: 9,
      })
      .toFile(path.join(outputDir, 'maskable-512x512.png'));
    console.log(chalk.green('✓ Generated maskable icon'));
  } catch (error) {
    console.error(chalk.red('✗ Failed to generate maskable icon:', error));
  }

  console.log(chalk.blue('\nOptimizing blog images...'));
  
  // Optimize blog images
  const imageFiles = fs.readdirSync(blogImagesDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of imageFiles) {
    try {
      const inputPath = path.join(blogImagesDir, file);
      const outputPath = path.join(blogImagesDir, `optimized-${file}`);
      
      await sharp(inputPath)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputPath);
      
      // Replace original with optimized version
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
      
      console.log(chalk.green(`✓ Optimized ${file}`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to optimize ${file}:`, error));
    }
  }

  // Generate placeholder screenshots if they don't exist
  const screenshotSizes = { width: 1080, height: 1920 };
  const screenshots = ['calculator.png', 'blog.png'];

  console.log(chalk.blue('\nGenerating screenshots...'));

  for (const screenshot of screenshots) {
    const screenshotPath = path.join(screenshotsDir, screenshot);
    if (!fs.existsSync(screenshotPath)) {
      try {
        await sharp({
          create: {
            width: screenshotSizes.width,
            height: screenshotSizes.height,
            channels: 4,
            background: { r: 26, g: 54, b: 93, alpha: 1 }
          }
        })
        .png()
        .toFile(screenshotPath);
        console.log(chalk.green(`✓ Generated placeholder ${screenshot}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to generate ${screenshot}:`, error));
      }
    }
  }

  console.log(chalk.blue('\nAsset generation complete!'));
}

generateIcons(); 