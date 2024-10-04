const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

async function slug(options) {
  const projectRoot = process.cwd();
  const slugsFile = path.join(projectRoot, 'dywo.slugs.json');

  if (!fs.existsSync(slugsFile)) {
    fs.writeJsonSync(slugsFile, {}, { spaces: 2 });
  }

  const slugs = fs.readJsonSync(slugsFile);

  if (options.list) {
    listSlugs(slugs);
  } else if (options.create) {
    await createSlug(slugs, slugsFile);
  } else if (options.delete) {
    await deleteSlug(slugs, slugsFile);
  } else {
    console.log(chalk.yellow('Please specify an action: --list, --create, or --delete'));
  }
}

function listSlugs(slugs) {
  console.log(chalk.blue('Current slugs:'));
  Object.entries(slugs).forEach(([slug, path]) => {
    console.log(`${chalk.green(slug)} => ${path}`);
  });
}

async function createSlug(slugs, slugsFile) {
  const { slug, path } = await inquirer.prompt([
    {
      type: 'input',
      name: 'slug',
      message: 'Enter the slug (e.g., about-us):',
      validate: input => input.length > 0 || 'Slug cannot be empty'
    },
    {
      type: 'input',
      name: 'path',
      message: 'Enter the path this slug should point to:',
      validate: input => input.length > 0 || 'Path cannot be empty'
    }
  ]);

  slugs[slug] = path;
  fs.writeJsonSync(slugsFile, slugs, { spaces: 2 });
  console.log(chalk.green(`Slug "${slug}" created successfully.`));
}

async function deleteSlug(slugs, slugsFile) {
  const { slug } = await inquirer.prompt([
    {
      type: 'list',
      name: 'slug',
      message: 'Select the slug to delete:',
      choices: Object.keys(slugs)
    }
  ]);

  delete slugs[slug];
  fs.writeJsonSync(slugsFile, slugs, { spaces: 2 });
  console.log(chalk.green(`Slug "${slug}" deleted successfully.`));
}

module.exports = slug;