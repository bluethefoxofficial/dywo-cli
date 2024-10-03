const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const { spawn } = require('child_process');

function test(options) {
  const configPath = path.join(process.cwd(), '.dywo');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('.dywo configuration file not found. Run `dywo repair` to fix this issue.'));
    process.exit(1);
  }

  let dywoConfig;
  try {
    dywoConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error(chalk.red('Error reading .dywo configuration file:'), error);
    process.exit(1);
  }

  const target = options.target || 'client'; // Default to 'client' if no target is specified

  const targetConfig = dywoConfig.structure && dywoConfig.structure[target];
  if (!targetConfig) {
    console.error(chalk.red(`Invalid or missing target configuration for: ${target}`));
    console.log(chalk.yellow('Available targets:'), Object.keys(dywoConfig.structure || {}).join(', '));
    process.exit(1);
  }

  const jestConfig = path.join(__dirname, '..', 'config', 'jest.config.js');
  const testCommand = `jest --config ${jestConfig} ${targetConfig.src}`;
  const args = [
    options.watch ? '--watch' : '',
    options.coverage ? '--coverage' : ''
  ].filter(Boolean);

  console.log(chalk.blue(`Running tests for ${target}...`));

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