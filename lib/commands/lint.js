const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const { CLIEngine } = require('eslint');

function lint(target, options) {
  const configPath = path.join(process.cwd(), '.dywo');
  const dywoConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const targetConfig = dywoConfig.structure[target];
  if (!targetConfig) {
    console.error(chalk.red(`Invalid target: ${target}`));
    return;
  }

  const cli = new CLIEngine({
    useEslintrc: false,
    baseConfig: {
      extends: ['eslint:recommended', 'plugin:react/recommended'],
      parser: 'babel-eslint',
    },
    fix: options.fix
  });

  const report = cli.executeOnFiles([targetConfig.src]);

  if (options.fix) {
    CLIEngine.outputFixes(report);
  }

  const formatter = cli.getFormatter();
  console.log(formatter(report.results));

  if (report.errorCount > 0) {
    console.error(chalk.red(`Linting failed with ${report.errorCount} errors`));
  } else if (report.warningCount > 0) {
    console.warn(chalk.yellow(`Linting completed with ${report.warningCount} warnings`));
  } else {
    console.log(chalk.green('Linting completed successfully!'));
  }
}

module.exports = lint;