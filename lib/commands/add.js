const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

async function add() {
  const { type, name, content } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What do you want to add?',
      choices: ['component', 'page']
    },
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name:'
    },
    {
      type: 'editor',
      name: 'content',
      message: 'Enter the content:'
    }
  ]);

  const projectRoot = process.cwd();
  const targetDir = type === 'component' ? 'components' : 'pages';
  const filePath = path.join(projectRoot, 'src', targetDir, `${name}.js`);

  try {
    await fs.ensureDir(path.join(projectRoot, 'src', targetDir));
    await fs.writeFile(filePath, content);
    console.log(chalk.green(`${type} '${name}' added successfully!`));
  } catch (error) {
    console.error(chalk.red(`Error adding ${type}:`, error));
  }
}

module.exports = add;