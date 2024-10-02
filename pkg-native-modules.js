const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules');
const nativeModulesPath = path.join(__dirname, 'native_modules');

if (!fs.existsSync(nativeModulesPath)) {
  fs.mkdirSync(nativeModulesPath);
}

const nativeModules = [
  'node_modules/fsevents/fsevents.node'
];

nativeModules.forEach(modulePath => {
  const fullPath = path.join(__dirname, modulePath);
  if (fs.existsSync(fullPath)) {
    const fileName = path.basename(modulePath);
    fs.copyFileSync(fullPath, path.join(nativeModulesPath, fileName));
  }
});