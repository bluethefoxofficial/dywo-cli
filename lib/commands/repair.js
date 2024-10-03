const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

async function repair(options) {
  const projectRoot = process.cwd();
  const issues = [];

  console.log(chalk.blue('Diagnosing Dywo project...'));

  // Check project structure
  const structureIssues = checkProjectStructure(projectRoot);
  issues.push(...structureIssues);

  // Check .dywo configuration
  const configIssues = checkDywoConfig(projectRoot);
  issues.push(...configIssues);

  // Check package.json
  const packageIssues = checkPackageJson(projectRoot);
  issues.push(...packageIssues);

  // Check dependencies
  const dependencyIssues = await checkDependencies(projectRoot);
  issues.push(...dependencyIssues);

  if (issues.length === 0) {
    console.log(chalk.green('No issues found in the Dywo project.'));
    return;
  }

  console.log(chalk.yellow(`Found ${issues.length} issue(s) in the Dywo project:`));
  issues.forEach((issue, index) => {
    console.log(chalk.yellow(`${index + 1}. ${issue.message}`));
  });

  if (options.fix) {
    await fixIssues(issues);
  } else {
    const { shouldFix } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldFix',
        message: 'Do you want to automatically fix these issues?',
        default: false
      }
    ]);

    if (shouldFix) {
      await fixIssues(issues);
    } else {
      console.log(chalk.cyan('No changes made. Run `dywo repair --fix` to automatically fix issues.'));
    }
  }
}

function checkProjectStructure(projectRoot) {
  const issues = [];
  const requiredDirs = ['src', 'public'];
  const requiredFiles = ['src/index.js', 'public/index.html'];

  requiredDirs.forEach(dir => {
    if (!fs.existsSync(path.join(projectRoot, dir))) {
      issues.push({
        type: 'missing-directory',
        message: `Missing directory: ${dir}`,
        fix: () => fs.ensureDirSync(path.join(projectRoot, dir))
      });
    }
  });

  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(projectRoot, file))) {
      issues.push({
        type: 'missing-file',
        message: `Missing file: ${file}`,
        fix: () => fs.writeFileSync(path.join(projectRoot, file), '')
      });
    }
  });

  return issues;
}

function checkDywoConfig(projectRoot) {
  const issues = [];
  const configPath = path.join(projectRoot, '.dywo');

  if (!fs.existsSync(configPath)) {
    issues.push({
      type: 'missing-config',
      message: 'Missing .dywo configuration file',
      fix: () => createDywoConfig(projectRoot)
    });
  } else {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!config.structure || !config.structure.client || !config.structure.server) {
        issues.push({
          type: 'invalid-config',
          message: 'Invalid .dywo configuration structure',
          fix: () => createDywoConfig(projectRoot)
        });
      }
    } catch (error) {
      issues.push({
        type: 'invalid-config',
        message: 'Invalid .dywo configuration file',
        fix: () => createDywoConfig(projectRoot)
      });
    }
  }

  return issues;
}

function checkPackageJson(projectRoot) {
  const issues = [];
  const packagePath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packagePath)) {
    issues.push({
      type: 'missing-package-json',
      message: 'Missing package.json file',
      fix: () => createPackageJson(projectRoot)
    });
  } else {
    const packageJson = require(packagePath);
    if (!packageJson.scripts || !packageJson.scripts.start || !packageJson.scripts.build) {
      issues.push({
        type: 'incomplete-package-json',
        message: 'Incomplete scripts in package.json',
        fix: () => updatePackageJsonScripts(projectRoot)
      });
    }
  }

  return issues;
}

async function checkDependencies(projectRoot) {
  const issues = [];
  const requiredDependencies = [
    'webpack', 'webpack-cli', 'webpack-dev-server', 'html-webpack-plugin',
    'babel-loader', '@babel/core', '@babel/preset-env', 'css-loader', 'style-loader'
  ];

  const missingDependencies = requiredDependencies.filter(dep => {
    try {
      require.resolve(dep, { paths: [projectRoot] });
      return false;
    } catch (err) {
      return true;
    }
  });

  if (missingDependencies.length > 0) {
    issues.push({
      type: 'missing-dependencies',
      message: `Missing dependencies: ${missingDependencies.join(', ')}`,
      fix: () => installDependencies(projectRoot, missingDependencies)
    });
  }

  return issues;
}

async function fixIssues(issues) {
  for (const issue of issues) {
    try {
      await issue.fix();
      console.log(chalk.green(`✓ Fixed: ${issue.message}`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to fix: ${issue.message}`), error);
    }
  }
}

function createDywoConfig(projectRoot) {
  const config = {
    structure: {
      client: {
        src: './src',
        output: './dist'
      },
      server: {
        src: './server',
        output: './dist/server'
      }
    },
    scripts: {
      "client:dev": "dywo compile client --mode development",
      "client:build": "dywo compile client --mode production",
      "server:dev": "dywo compile server --mode development",
      "server:build": "dywo compile server --mode production",
      "start": "dywo serve"
    }
  };

  fs.writeFileSync(path.join(projectRoot, '.dywo'), JSON.stringify(config, null, 2));
}

function createPackageJson(projectRoot) {
  const packageJson = {
    name: path.basename(projectRoot),
    version: '1.0.0',
    description: 'A Dywo project',
    scripts: {
      start: 'dywo dev',
      build: 'dywo build'
    },
    dependencies: {},
    devDependencies: {}
  };

  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
}

function updatePackageJsonScripts(projectRoot) {
  const packageJson = require(path.join(projectRoot, 'package.json'));
  packageJson.scripts = {
    ...packageJson.scripts,
    start: 'dywo dev',
    build: 'dywo build'
  };
  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
}

function installDependencies(projectRoot, dependencies) {
  console.log(chalk.yellow('Installing missing dependencies...'));
  try {
    execSync(`npm install --save-dev ${dependencies.join(' ')}`, { stdio: 'inherit', cwd: projectRoot });
    console.log(chalk.green('Dependencies installed successfully.'));
  } catch (error) {
    console.error(chalk.red('Failed to install dependencies. Please run `npm install` manually.'));
    throw error;
  }
}

module.exports = repair;