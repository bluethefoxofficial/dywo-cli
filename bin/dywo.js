#!/usr/bin/env node

const { program } = require('commander');
const generate = require('../lib/commands/generate');
const add = require('../lib/commands/add');
const compile = require('../lib/commands/compile');
const serve = require('../lib/commands/serve');
const test = require('../lib/commands/test');
const obfuscate = require('../lib/commands/obfuscate');
const lint = require('../lib/commands/lint');
const format = require('../lib/commands/format');

program
  .version('1.0.0')
  .description('Dywo - A flexible CLI tool for web development');

program
  .command('generate')
  .description('Generate a new Dywo project with custom options')
  .action(generate);

program
  .command('add')
  .description('Add a new component or page to an existing Dywo project')
  .action(add);

program
  .command('compile <target>')
  .description('Compile the project (client or server)')
  .option('-m, --mode <mode>', 'Webpack mode (development or production)', 'production')
  .option('-w, --watch', 'Watch for changes and recompile', false)
  .option('-a, --analyze', 'Analyze bundle size', false)
  .action(compile);

program
  .command('serve')
  .description('Serve the project')
  .option('-p, --port <port>', 'Port to serve on', '3000')
  .action(serve);

program
  .command('test <target>')
  .description('Run tests (client or server)')
  .option('-w, --watch', 'Watch for changes and rerun tests', false)
  .option('-c, --coverage', 'Collect test coverage', false)
  .action(test);

program
  .command('obfuscate <target>')
  .description('Obfuscate compiled code (client or server)')
  .option('-l, --level <level>', 'Obfuscation level (low, medium, high)', 'medium')
  .action(obfuscate);

program
  .command('lint <target>')
  .description('Lint code (client or server)')
  .option('-f, --fix', 'Automatically fix problems', false)
  .action(lint);

program
  .command('format <target>')
  .description('Format code (client or server)')
  .option('-w, --write', 'Write formatted code back to files', false)
  .action(format);

program.parse(process.argv);