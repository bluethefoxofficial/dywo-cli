const fs = require('fs-extra');

async function createFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content);
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
  }
}

module.exports = {
  createFile,
};