const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(
    exists 
      ? chalk.green(`✓ ${description} found`) 
      : chalk.red(`✗ ${description} missing`)
  );
  return exists;
}

function checkManifest() {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  if (!checkFile(manifestPath, 'Manifest file')) return false;

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color', 'icons'];
    
    console.log('\nChecking manifest fields:');
    requiredFields.forEach(field => {
      console.log(
        manifest[field] 
          ? chalk.green(`✓ ${field} defined`) 
          : chalk.red(`✗ ${field} missing`)
      );
    });

    // Check icons
    if (manifest.icons) {
      console.log('\nChecking icon sizes:');
      const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
      sizes.forEach(size => {
        const hasSize = manifest.icons.some(icon => icon.sizes === `${size}x${size}`);
        console.log(
          hasSize 
            ? chalk.green(`✓ ${size}x${size} icon defined`) 
            : chalk.red(`✗ ${size}x${size} icon missing`)
        );
      });
    }

    return true;
  } catch (error) {
    console.error(chalk.red('\n✗ Error parsing manifest:', error.message));
    return false;
  }
}

function checkServiceWorker() {
  const swPath = path.join(__dirname, '../public/sw.js');
  return checkFile(swPath, 'Service Worker');
}

function checkIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!checkFile(iconsDir, 'Icons directory')) return false;

  console.log('\nChecking icon files:');
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  sizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    checkFile(iconPath, `${size}x${size} icon file`);
  });

  return true;
}

function runTests() {
  console.log(chalk.blue.bold('\n=== Testing PWA Setup ===\n'));

  const manifestExists = checkManifest();
  console.log('');
  const swExists = checkServiceWorker();
  console.log('');
  const iconsExist = checkIcons();

  console.log(chalk.blue.bold('\n=== Test Summary ===\n'));
  console.log(
    manifestExists && swExists && iconsExist
      ? chalk.green.bold('✓ PWA setup looks good!')
      : chalk.yellow.bold('⚠ Some PWA components are missing or incomplete')
  );
}

runTests(); 