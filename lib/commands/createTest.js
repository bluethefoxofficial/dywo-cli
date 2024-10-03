const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

async function createTest(options) {
  const projectRoot = process.cwd();
  
  // If no file is specified in the command, prompt the user
  const fileName = options.file || await promptForFileName();
  
  const fileInfo = getFileInfo(fileName, projectRoot);
  
  if (!fileInfo.exists) {
    console.error(chalk.red(`File ${fileName} does not exist in the project.`));
    return;
  }

  const testFilePath = createTestFilePath(fileInfo);
  
  if (fs.existsSync(testFilePath)) {
    console.error(chalk.yellow(`Test file already exists at ${testFilePath}`));
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite the existing test file?',
        default: false
      }
    ]);
    if (!overwrite) return;
  }

  const testFileContent = generateTestFileContent(fileInfo);
  
  fs.writeFileSync(testFilePath, testFileContent);
  console.log(chalk.green(`Test file created at ${testFilePath}`));
}

async function promptForFileName() {
  const { fileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Enter the name of the file you want to create a test for:',
      validate: input => input.length > 0 || 'Please enter a file name.'
    }
  ]);
  return fileName;
}

function getFileInfo(fileName, projectRoot) {
  const srcPath = path.join(projectRoot, 'src');
  const filePath = path.join(srcPath, fileName);
  const exists = fs.existsSync(filePath);
  const ext = path.extname(fileName);
  const nameWithoutExt = path.basename(fileName, ext);
  const dir = path.dirname(filePath);

  return { fileName, filePath, exists, ext, nameWithoutExt, dir };
}

function createTestFilePath(fileInfo) {
  const testFileName = `${fileInfo.nameWithoutExt}.test${fileInfo.ext}`;
  return path.join(fileInfo.dir, '__tests__', testFileName);
}

function generateTestFileContent(fileInfo) {
  const componentName = fileInfo.nameWithoutExt;
  
  if (fileInfo.ext === '.jsx' || fileInfo.ext === '.js') {
    return `
import React from 'react';
import { render, screen } from '@testing-library/react';
import ${componentName} from '../${fileInfo.fileName}';

describe('${componentName}', () => {
  test('renders ${componentName}', () => {
    render(<${componentName} />);
    // Add your test assertions here
    // For example:
    // expect(screen.getByText(/Welcome to ${componentName}/i)).toBeInTheDocument();
  });
});
`.trim();
  } else {
    return `
import { ${componentName} } from '../${fileInfo.fileName}';

describe('${componentName}', () => {
  test('should work as expected', () => {
    // Add your test assertions here
    expect(${componentName}).toBeDefined();
  });
});
`.trim();
  }
}

module.exports = createTest;