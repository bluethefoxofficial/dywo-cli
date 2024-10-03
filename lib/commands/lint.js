const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { ESLint } = require('eslint');

async function lint(options) {
  const projectRoot = process.cwd();
  const dywoConfigPath = path.join(projectRoot, '.dywo');

  if (!fs.existsSync(dywoConfigPath)) {
    console.error(chalk.red('.dywo configuration file not found. Run `dywo repair` to fix this issue.'));
    process.exit(1);
  }

  let dywoConfig;
  try {
    dywoConfig = JSON.parse(fs.readFileSync(dywoConfigPath, 'utf8'));
  } catch (error) {
    console.error(chalk.red('Invalid .dywo configuration file. Run `dywo repair` to fix this issue.'));
    process.exit(1);
  }

  const eslintConfigPath = path.join(projectRoot, '.eslintrc.js');

  let eslintConfig;
  if (fs.existsSync(eslintConfigPath)) {
    eslintConfig = require(eslintConfigPath);
  } else {
    eslintConfig = {
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
    };
  }

  const eslint = new ESLint({
    useEslintrc: false,
    baseConfig: eslintConfig,
    fix: options.fix
  });

  try {
    const clientSrcPath = path.join(projectRoot, dywoConfig.structure.client.src);
    const results = await eslint.lintFiles([`${clientSrcPath}/**/*.js`]);

    if (options.fix) {
      await ESLint.outputFixes(results);
    }

    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    console.log(resultText);

    const errorCount = results.reduce((count, result) => count + result.errorCount, 0);
    const warningCount = results.reduce((count, result) => count + result.warningCount, 0);

    if (errorCount > 0) {
      console.log(chalk.red(`Found ${errorCount} errors and ${warningCount} warnings`));
      process.exit(1);
    } else if (warningCount > 0) {
      console.log(chalk.yellow(`Found ${warningCount} warnings`));
    } else {
      console.log(chalk.green('No linting errors or warnings were found!'));
    }
  } catch (error) {
    console.error(chalk.red('Error during linting:'), error);
    process.exit(1);
  }
}

module.exports = lint;