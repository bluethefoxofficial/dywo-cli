const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const prettier = require('prettier');
const glob = require('glob');

function format(target, options) {
  const configPath = path.join(process.cwd(), '.dywo');
  const dywoConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const targetConfig = dywoConfig.structure[target];
  if (!targetConfig) {
    console.error(chalk.red(`Invalid target: ${target}`));
    return;
  }

  const files = glob.sync(`${targetConfig.src}/**/*.{js,jsx,ts,tsx,css,scss,json,md}`);

  files.forEach(file => {
    const code = fs.readFileSync(file, 'utf-8');
    const formattedCode = prettier.format(code, {
      filepath: file,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
    });

    if (options.write) {
      fs.writeFileSync(file, formattedCode);
      console.log(chalk.green(`Formatted: ${file}`));
    } else {
      console.log(chalk.cyan(`Would format: ${file}`));
    }
  });

  if (options.write) {
    console.log(chalk.green('Formatting completed successfully!'));
  } else {
    console.log(chalk.yellow('Run with --write to apply formatting changes.'));
  }
}

module.exports = format;