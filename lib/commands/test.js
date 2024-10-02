const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const { spawn } = require('child_process');

function test(target, options) {
  const configPath = path.join(process.cwd(), '.dywo');
  const dywoConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const targetConfig = dywoConfig.structure[target];
  if (!targetConfig) {
    console.error(chalk.red(`Invalid target: ${target}`));
    return;
  }

  const jestConfig = path.join(__dirname, '..', 'config', 'jest.config.js');
  const testCommand = `jest --config ${jestConfig} ${targetConfig.src}`;
  const args = [
    options.watch ? '--watch' : '',
    options.coverage ? '--coverage' : ''
  ].filter(Boolean);

  const child = spawn('npx', [testCommand, ...args], { shell: true, stdio: 'inherit' });

  child.on('error', (error) => {
    console.error(chalk.red(`Error running tests: ${error.message}`));
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`Tests failed with exit code ${code}`));
    } else {
      console.log(chalk.green('Tests completed successfully!'));
    }
  });
}

module.exports = test;