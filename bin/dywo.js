#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');


program
  .version('1.0.11')
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
  .description('Compile the project')
  .option('-t, --target <target>', 'Compilation target (client or server)', 'client')
  .option('-e, --env <env>', 'Environment (development or production)', 'production')
  .option('-w, --watch', 'Watch for changes and recompile', false)
  .option('-a, --analyze', 'Analyze bundle size', false)
  .option('-c, --config <config>', 'Path to custom Dywo config file')
  .action(async (options) => {
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
  .command('obfuscate')
  .description('Obfuscate compiled JavaScript files')
  .option('-t, --target <target>', 'Obfuscation target (client or server)', 'client')
  .option('-l, --level <level>', 'Obfuscation level (low, medium, high)', 'medium')
  .action(async (options) => {
    require('../lib/commands/obfuscate')(options);
  });


  program
  .command('test')
  .description('Run tests for the Dywo project')
  .option('-t, --target <target>', 'Specify the target (client or server)', 'client')
  .option('-w, --watch', 'Watch for changes and rerun tests', false)
  .option('-c, --coverage', 'Collect test coverage', false)
  .action((options) => {
    require('../lib/commands/test')(options);
  });

  program
  .command('create-test')
  .description('Create a test file for a component or module')
  .option('-f, --file <file>', 'The file to create a test for')
  .action((options) => {
    require('../lib/commands/createTest')(options);
  });

  program
  .command('slug')
  .description('Manage slugs for the compiled application')
  .option('-l, --list', 'List all slugs')
  .option('-c, --create', 'Create a new slug')
  .option('-d, --delete', 'Delete an existing slug')
  .action((options) => {
    require('../lib/commands/slug')(options);
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