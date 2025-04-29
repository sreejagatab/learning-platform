/**
 * Script to copy the service worker to the public directory
 */
const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourcePath = path.join(__dirname, 'src', 'serviceWorker.js');
const destPath = path.join(__dirname, 'public', 'serviceWorker.js');

// Copy the file
try {
  const data = fs.readFileSync(sourcePath, 'utf8');
  fs.writeFileSync(destPath, data, 'utf8');
  console.log('Service worker copied successfully to public directory');
} catch (err) {
  console.error('Error copying service worker:', err);
  process.exit(1);
}
