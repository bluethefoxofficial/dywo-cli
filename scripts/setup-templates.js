const fs = require('fs-extra');
const path = require('path');

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