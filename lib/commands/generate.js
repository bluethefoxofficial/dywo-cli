const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

async function generate() {
  const { projectName, includeServer } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',
      default: 'my-dywo-project'
    },
    {
      type: 'confirm',
      name: 'includeServer',
      message: 'Include server-side code?',
      default: true
    }
  ]);

  const projectPath = path.join(process.cwd(), projectName);

  try {
    // Create project directories
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'client', 'src', 'components'));
    await fs.ensureDir(path.join(projectPath, 'client', 'src', 'pages'));
    await fs.ensureDir(path.join(projectPath, 'client', 'src', 'utils'));
    await fs.ensureDir(path.join(projectPath, 'client', 'public'));
    if (includeServer) {
      await fs.ensureDir(path.join(projectPath, 'server', 'src'));
    }

    // Copy template files
    const templatePath = path.join(__dirname, '..', 'templates');
    await fs.copy(path.join(templatePath, 'client'), path.join(projectPath, 'client'));
    if (includeServer) {
      await fs.copy(path.join(templatePath, 'server'), path.join(projectPath, 'server'));
    }

    // Create .dywo configuration file
    const dywoConfig = {
      name: projectName,
      version: "1.0.0",
      structure: {
        client: {
          src: "./client/src",
          output: "./client/dist"
        },
        server: includeServer ? {
          src: "./server/src",
          output: "./server/dist"
        } : undefined
      },
      scripts: {
        "client:dev": "dywo compile client --mode development",
        "client:build": "dywo compile client --mode production",
        "start": "dywo serve"
      },
      dependencies: {
        client: {},
        server: includeServer ? {
          "express": "^4.17.1"
        } : undefined
      },
      devDependencies: {
        client: {
          "webpack": "^5.75.0",
          "webpack-cli": "^4.10.0",
          "html-webpack-plugin": "^5.5.0",
          "css-loader": "^6.7.1",
          "style-loader": "^3.3.1"
        },
        server: includeServer ? {
          "nodemon": "^2.0.14"
        } : undefined
      }
    };

    if (includeServer) {
      dywoConfig.scripts["server:dev"] = "dywo compile server --mode development";
      dywoConfig.scripts["server:build"] = "dywo compile server --mode production";
    }

    // Write .dywo file
    await fs.writeFile(
      path.join(projectPath, '.dywo'),
      JSON.stringify(dywoConfig, null, 2)
    );

    console.log(chalk.green(`Project '${projectName}' generated successfully!`));
    console.log(chalk.yellow(`To get started, run the following commands:`));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  npm install`));
    console.log(chalk.cyan(`  npm run client:dev`));
    if (includeServer) {
      console.log(chalk.cyan(`  npm run server:dev`));
    }
    console.log(chalk.cyan(`  npm start`));
  } catch (error) {
    console.error(chalk.red('Error generating project:'), error);
  }
}

module.exports = generate;