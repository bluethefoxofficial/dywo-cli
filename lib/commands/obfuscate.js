const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const JavaScriptObfuscator = require('javascript-obfuscator');
const glob = require('glob');
const inquirer = require('inquirer');

async function obfuscate(options) {
  const projectRoot = process.cwd();
  const configPath = path.join(projectRoot, 'dywo.config.js');

  let dywoConfig;
  if (fs.existsSync(configPath)) {
    dywoConfig = require(configPath);
  } else {
    console.warn(chalk.yellow('dywo.config.js not found. Using default configuration.'));
    dywoConfig = {};
  }

  const target = options.target || 'client';
  const outputPath = path.resolve(dywoConfig.outputPath || 'dist', target);

  if (!fs.existsSync(outputPath)) {
    console.error(chalk.red(`Output directory not found: ${outputPath}`));
    console.error(chalk.yellow('Make sure you have compiled your project before obfuscating.'));
    return;
  }

  const jsFiles = glob.sync(path.join(outputPath, '**/*.js'));

  if (jsFiles.length === 0) {
    console.error(chalk.red('No JavaScript files found in the output directory.'));
    return;
  }

  const obfuscationOptions = getObfuscationOptions(options.level);

  let successCount = 0;
  let failCount = 0;
  const obfuscatedFiles = [];

  for (const file of jsFiles) {
    try {
      const code = fs.readFileSync(file, 'utf-8');
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();
      const obfuscatedFilePath = file.replace('.js', '.obfuscated.js');
      fs.writeFileSync(obfuscatedFilePath, obfuscatedCode);
      console.log(chalk.green(`Obfuscated: ${path.relative(projectRoot, obfuscatedFilePath)}`));
      successCount++;
      obfuscatedFiles.push({ original: file, obfuscated: obfuscatedFilePath });
    } catch (error) {
      console.error(chalk.red(`Error obfuscating ${file}:`), error.message);
      failCount++;
    }
  }

  console.log(chalk.blue(`Obfuscation complete. Succeeded: ${successCount}, Failed: ${failCount}`));

  if (successCount > 0) {
    const { replaceOriginal } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'replaceOriginal',
        message: 'Do you want to replace the original files with the obfuscated versions?',
        default: false
      }
    ]);

    if (replaceOriginal) {
      for (const file of obfuscatedFiles) {
        fs.moveSync(file.obfuscated, file.original, { overwrite: true });
        console.log(chalk.green(`Replaced: ${path.relative(projectRoot, file.original)}`));
      }
      console.log(chalk.blue('Original files have been replaced with obfuscated versions.'));
    } else {
      console.log(chalk.blue('Obfuscated files have been kept separate from the original files.'));
    }
  }
}

function getObfuscationOptions(level) {
  const baseOptions = {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    splitStrings: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
  };

  switch (level) {
    case 'low':
      return {
        ...baseOptions,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        stringArrayEncoding: [],
        stringArrayThreshold: 0
      };
    case 'high':
      return {
        ...baseOptions,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        renameGlobals: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        unicodeEscapeSequence: true
      };
    default: // medium
      return baseOptions;
  }
}

module.exports = obfuscate;