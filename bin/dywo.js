#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');

program
  .version('1.0.0')
  .description('Dywo - Dynamic Web One: A CLI for modern SPA development');

program
  .command('create <project-name>')
  .description('Create a new Dywo SPA project')
  .option('-t, --template <name>', 'Template to use (vanilla, react, vue)', 'vanilla')
  .option('-p, --pkg <manager>', 'Package manager to use (npm, yarn, pnpm)', 'npm')
  .action((projectName, options) => {
    require('../lib/commands/create')(projectName, options);
  });

program
  .command('dev')
  .description('Start development server with hot reloading')
  .option('-p, --port <number>', 'Port to run the server on', '3000')
  .action((options) => {
    require('../lib/commands/dev')(options);
  });

program
  .command('build')
  .description('Build the SPA for production')
  .option('-a, --analyze', 'Analyze the bundle after build')
  .action((options) => {
    require('../lib/commands/build')(options);
  });

program
  .command('add <type> <name>')
  .description('Add a new component, page, or route to the project')
  .option('-p, --path <directory>', 'Custom path for the new item')
  .action((type, name, options) => {
    require('../lib/commands/add')(type, name, options);
  });

program
  .command('test')
  .description('Run tests')
  .option('-w, --watch', 'Watch for changes and rerun tests')
  .option('-c, --coverage', 'Collect test coverage')
  .action((options) => {
    require('../lib/commands/test')(options);
  });

program
  .command('lint')
  .description('Lint the project')
  .option('-f, --fix', 'Automatically fix problems when possible')
  .action((options) => {
    require('../lib/commands/lint')(options);
  });

program
  .command('optimize')
  .description('Optimize the SPA bundle')
  .option('-t, --target <type>', 'Optimization target (size, performance)', 'both')
  .action((options) => {
    require('../lib/commands/optimize')(options);
  });

program
  .command('repair')
  .description('Diagnose and repair issues in the Dywo project')
  .option('-f, --fix', 'Automatically fix identified issues')
  .action((options) => {
    require('../lib/commands/repair')(options);
  });

program
  .on('command:*', () => {
    console.error(chalk.red('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
    process.exit(1);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}