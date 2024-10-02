const fs = require('fs-extra');
const path = require('path');

// Function to create template directory structure
function createTemplateStructure() {
  const templatesDir = path.join(__dirname, '..', 'lib', 'templates');
  const structure = {
    client: {
      src: ['index.html', 'styles.css', 'main.js'],
      'package.json': ''
    },
    server: {
      src: ['index.js'],
      'package.json': ''
    },
    'dywo.config.js': ''
  };

  function createDirStructure(baseDir, struct) {
    Object.entries(struct).forEach(([key, value]) => {
      const fullPath = path.join(baseDir, key);
      if (typeof value === 'object') {
        fs.ensureDirSync(fullPath);
        createDirStructure(fullPath, value);
      } else {
        fs.ensureFileSync(fullPath);
      }
    });
  }

  createDirStructure(templatesDir, structure);
  console.log('Template directory structure created successfully!');
}

// Function to handle native modules if necessary
function handleNativeModules() {
  // Add logic here if you need to handle any native modules
  console.log('Native modules handled successfully!');
}

// Main prepare function
function prepare() {
  createTemplateStructure();
  handleNativeModules();
  console.log('Build preparation completed successfully!');
}

prepare();