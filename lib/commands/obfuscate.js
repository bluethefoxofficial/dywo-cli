const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const JavaScriptObfuscator = require('javascript-obfuscator');

function obfuscate(target, options) {
  const configPath = path.join(process.cwd(), '.dywo');
  const dywoConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const targetConfig = dywoConfig.structure[target];
  if (!targetConfig) {
    console.error(chalk.red(`Invalid target: ${target}`));
    return;
  }

  const inputPath = path.join(process.cwd(), targetConfig.output, 'bundle.js');
  const outputPath = path.join(process.cwd(), targetConfig.output, 'bundle.obfuscated.js');

  const code = fs.readFileSync(inputPath, 'utf-8');

  const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: options.level !== 'low',
    controlFlowFlatteningThreshold: options.level === 'high' ? 1 : 0.75,
    deadCodeInjection: options.level === 'high',
    deadCodeInjectionThreshold: 0.4,
    debugProtection: options.level === 'high',
    disableConsoleOutput: options.level !== 'low',
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: options.level === 'high',
    rotateStringArray: true,
    selfDefending: options.level === 'high',
    shuffleStringArray: true,
    splitStrings: options.level !== 'low',
    splitStringsChunkLength: options.level === 'high' ? 5 : 10,
    stringArray: true,
    stringArrayEncoding: options.level === 'high' ? ['rc4'] : ['base64'],
    stringArrayThreshold: options.level === 'high' ? 1 : 0.75,
    transformObjectKeys: options.level === 'high',
    unicodeEscapeSequence: options.level === 'high'
  };

  const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();

  fs.writeFileSync(outputPath, obfuscatedCode);

  console.log(chalk.green(`Code obfuscated successfully! Output: ${outputPath}`));
}

module.exports = obfuscate;