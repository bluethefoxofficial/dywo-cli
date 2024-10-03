const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { execSync, spawnSync } = require('child_process');
const webpack = require('webpack');
const eslint = require('eslint');

async function repair(options) {
  const projectRoot = process.cwd();
  let issues = [];

  console.log(chalk.blue('Diagnosing Dywo project...'));

  issues = issues.concat(
    checkProjectStructure(projectRoot),
    checkDywoConfig(projectRoot),
    checkPackageJson(projectRoot),
    checkWebpackConfig(projectRoot),
    checkBabelConfig(projectRoot),
    checkEslintConfig(projectRoot),
    checkGitIgnore(projectRoot),
    checkReadme(projectRoot),
    await checkDependencies(projectRoot),
    checkSourceFiles(projectRoot)
  );

  if (issues.length === 0) {
    console.log(chalk.green('No issues found in the Dywo project.'));
    return;
  }

  console.log(chalk.yellow(`Found ${issues.length} issue(s) in the Dywo project:`));
  issues.forEach((issue, index) => {
    console.log(chalk.yellow(`${index + 1}. ${issue.message}`));
  });

  if (options.fix || (await shouldFix())) {
    await fixIssues(issues);
    await runTests(projectRoot);
  } else {
    console.log(chalk.cyan('No changes made. Run `dywo repair --fix` to automatically fix issues.'));
  }
}

function checkProjectStructure(projectRoot) {
  const issues = [];
  const requiredDirs = ['src', 'public', 'src/components', 'src/pages', 'src/styles'];
  const requiredFiles = [
    'src/index.js',
    'src/App.js',
    'src/styles/index.css',
    'public/index.html',
    'src/components/Header.js',
    'src/pages/Home.js'
  ];

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
        fix: () => createDefaultFile(projectRoot, file)
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
      if (!config.scripts || !config.scripts.dev || !config.scripts.build || !config.scripts.start) {
        issues.push({
          type: 'incomplete-config',
          message: 'Incomplete scripts in .dywo configuration',
          fix: () => updateDywoConfig(projectRoot)
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
    if (!packageJson.scripts || !packageJson.scripts.start || !packageJson.scripts.build || !packageJson.scripts.dev) {
      issues.push({
        type: 'incomplete-package-json',
        message: 'Incomplete scripts in package.json',
        fix: () => updatePackageJsonScripts(projectRoot)
      });
    }
    if (!packageJson.name || !packageJson.version || !packageJson.description) {
      issues.push({
        type: 'incomplete-package-json',
        message: 'Missing basic information in package.json',
        fix: () => updatePackageJsonInfo(projectRoot)
      });
    }
  }

  return issues;
}

function checkWebpackConfig(projectRoot) {
  const issues = [];
  const webpackConfigPath = path.join(projectRoot, 'webpack.config.js');

  if (!fs.existsSync(webpackConfigPath)) {
    issues.push({
      type: 'missing-webpack-config',
      message: 'Missing webpack.config.js file',
      fix: () => createWebpackConfig(projectRoot)
    });
  } else {
    const webpackConfig = require(webpackConfigPath);
    if (!webpackConfig.entry || !webpackConfig.output || !webpackConfig.module || !webpackConfig.plugins) {
      issues.push({
        type: 'incomplete-webpack-config',
        message: 'Incomplete webpack configuration',
        fix: () => updateWebpackConfig(projectRoot)
      });
    }
  }

  return issues;
}

function checkBabelConfig(projectRoot) {
  const issues = [];
  const babelConfigPath = path.join(projectRoot, '.babelrc');

  if (!fs.existsSync(babelConfigPath)) {
    issues.push({
      type: 'missing-babel-config',
      message: 'Missing .babelrc file',
      fix: () => createBabelConfig(projectRoot)
    });
  } else {
    const babelConfig = JSON.parse(fs.readFileSync(babelConfigPath, 'utf8'));
    if (!babelConfig.presets || !babelConfig.presets.includes('@babel/preset-react')) {
      issues.push({
        type: 'incomplete-babel-config',
        message: 'Missing React preset in Babel configuration',
        fix: () => updateBabelConfig(projectRoot)
      });
    }
  }

  return issues;
}

function checkEslintConfig(projectRoot) {
  const issues = [];
  const eslintConfigPath = path.join(projectRoot, '.eslintrc.js');

  if (!fs.existsSync(eslintConfigPath)) {
    issues.push({
      type: 'missing-eslint-config',
      message: 'Missing .eslintrc.js file',
      fix: () => createEslintConfig(projectRoot)
    });
  } else {
    const eslintConfig = require(eslintConfigPath);
    if (!eslintConfig.extends || !eslintConfig.extends.includes('eslint:recommended')) {
      issues.push({
        type: 'incomplete-eslint-config',
        message: 'Incomplete ESLint configuration',
        fix: () => updateEslintConfig(projectRoot)
      });
    }
  }

  return issues;
}

function checkGitIgnore(projectRoot) {
  const issues = [];
  const gitignorePath = path.join(projectRoot, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    issues.push({
      type: 'missing-gitignore',
      message: 'Missing .gitignore file',
      fix: () => createGitIgnore(projectRoot)
    });
  } else {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const requiredEntries = ['node_modules', 'dist', '.env'];
    const missingEntries = requiredEntries.filter(entry => !gitignore.includes(entry));
    if (missingEntries.length > 0) {
      issues.push({
        type: 'incomplete-gitignore',
        message: `Missing entries in .gitignore: ${missingEntries.join(', ')}`,
        fix: () => updateGitIgnore(projectRoot, missingEntries)
      });
    }
  }

  return issues;
}

function checkReadme(projectRoot) {
  const issues = [];
  const readmePath = path.join(projectRoot, 'README.md');

  if (!fs.existsSync(readmePath)) {
    issues.push({
      type: 'missing-readme',
      message: 'Missing README.md file',
      fix: () => createReadme(projectRoot)
    });
  } else {
    const readme = fs.readFileSync(readmePath, 'utf8');
    if (!readme.includes('# Dywo Project') || !readme.includes('## Getting Started')) {
      issues.push({
        type: 'incomplete-readme',
        message: 'Incomplete README.md file',
        fix: () => updateReadme(projectRoot)
      });
    }
  }

  return issues;
}

async function checkDependencies(projectRoot) {
  const issues = [];
  const requiredDependencies = {
    dependencies: ['react', 'react-dom', 'react-router-dom'],
    devDependencies: [
      'webpack', 'webpack-cli', 'webpack-dev-server',
      'babel-loader', '@babel/core', '@babel/preset-env', '@babel/preset-react',
      'html-webpack-plugin', 'css-loader', 'style-loader',
      'eslint', 'eslint-plugin-react', 'eslint-plugin-react-hooks'
    ]
  };

  const packageJson = require(path.join(projectRoot, 'package.json'));

  Object.entries(requiredDependencies).forEach(([type, deps]) => {
    const installedDeps = packageJson[type] || {};
    const missingDeps = deps.filter(dep => !installedDeps[dep]);
    if (missingDeps.length > 0) {
      issues.push({
        type: `missing-${type}`,
        message: `Missing ${type}: ${missingDeps.join(', ')}`,
        fix: () => installDependencies(projectRoot, missingDeps, type === 'devDependencies')
      });
    }
  });

  return issues;
}

function checkSourceFiles(projectRoot) {
  const issues = [];
  const srcPath = path.join(projectRoot, 'src');
  const files = fs.readdirSync(srcPath);

  if (!files.some(file => file.endsWith('.js') || file.endsWith('.jsx'))) {
    issues.push({
      type: 'missing-js-files',
      message: 'No JavaScript files found in src directory',
      fix: () => createDefaultSourceFiles(projectRoot)
    });
  }

  return issues;
}

function createDefaultFile(projectRoot, file) {
  const content = getDefaultFileContent(file);
  fs.writeFileSync(path.join(projectRoot, file), content);
}

function getDefaultFileContent(file) {
  switch (path.basename(file)) {
    case 'index.js':
      return `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';

ReactDOM.render(<App />, document.getElementById('root'));
      `.trim();
    case 'App.js':
      return `
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
      `.trim();
    case 'index.css':
      return `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
}
      `.trim();
    case 'index.html':
      return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dywo App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
      `.trim();
    case 'Header.js':
      return `
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
      `.trim();
    case 'Home.js':
      return `
import React from 'react';

function Home() {
  return (
    <div>
      <h1>Welcome to Dywo</h1>
      <p>This is the home page of your Dywo application.</p>
    </div>
  );
}

export default Home;
      `.trim();
    default:
      return '';
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
      "dev": "webpack serve --mode development",
      "build": "webpack --mode production",
      "start": "node server/index.js"
    }
  };

  fs.writeFileSync(path.join(projectRoot, '.dywo'), JSON.stringify(config, null, 2));
}

function updateDywoConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.dywo');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  config.scripts = {
    ...config.scripts,
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "start": "node server/index.js"
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function createPackageJson(projectRoot) {
  const packageJson = {
    name: path.basename(projectRoot),
    version: '1.0.0',
    description: 'A Dywo project',
    scripts: {
      start: 'dywo serve',
      build: 'dywo build',
      dev: 'dywo dev'
    },
    dependencies: {},
    devDependencies: {}
  };

  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));
}

function updatePackageJsonScripts(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = require(packagePath);
  packageJson.scripts = {
    ...packageJson.scripts,
    start: 'dywo serve',
    build: 'dywo build',
    dev: 'dywo dev'
  };
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

function updatePackageJsonInfo(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = require(packagePath);
  packageJson.name = packageJson.name || path.basename(projectRoot);
  packageJson.version = packageJson.version || '1.0.0';
  packageJson.description = packageJson.description || 'A Dywo project';
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

function createWebpackConfig(projectRoot) {
  const webpackConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    historyApiFallback: true,
    contentBase: './dist',
    hot: true
  }
};
  `.trim();

  fs.writeFileSync(path.join(projectRoot, 'webpack.config.js'), webpackConfig);
}

function updateWebpackConfig(projectRoot) {
  const webpackConfigPath = path.join(projectRoot, 'webpack.config.js');
  const webpackConfig = require(webpackConfigPath);

  webpackConfig.entry = webpackConfig.entry || './src/index.js';
  webpackConfig.output = webpackConfig.output || {
    path: path.resolve(projectRoot, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  };
  webpackConfig.module = webpackConfig.module || { rules: [] };
  webpackConfig.plugins = webpackConfig.plugins || [];

  if (!webpackConfig.module.rules.some(rule => rule.use.includes('babel-loader'))) {
    webpackConfig.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    });
  }

  if (!webpackConfig.module.rules.some(rule => rule.use.includes('css-loader'))) {
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    });
  }

  if (!webpackConfig.plugins.some(plugin => plugin instanceof HtmlWebpackPlugin)) {
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      template: './public/index.html'
    }));
  }

  fs.writeFileSync(webpackConfigPath, `module.exports = ${JSON.stringify(webpackConfig, null, 2)}`);
}

function createBabelConfig(projectRoot) {
  const babelConfig = {
    presets: ['@babel/preset-env', '@babel/preset-react']
  };

  fs.writeFileSync(path.join(projectRoot, '.babelrc'), JSON.stringify(babelConfig, null, 2));
}

function updateBabelConfig(projectRoot) {
  const babelConfigPath = path.join(projectRoot, '.babelrc');
  const babelConfig = JSON.parse(fs.readFileSync(babelConfigPath, 'utf8'));

  if (!babelConfig.presets.includes('@babel/preset-env')) {
    babelConfig.presets.push('@babel/preset-env');
  }
  if (!babelConfig.presets.includes('@babel/preset-react')) {
    babelConfig.presets.push('@babel/preset-react');
  }

  fs.writeFileSync(babelConfigPath, JSON.stringify(babelConfig, null, 2));
}

function createEslintConfig(projectRoot) {
  const eslintConfig = `
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    // Add any custom rules here
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
  `.trim();

  fs.writeFileSync(path.join(projectRoot, '.eslintrc.js'), eslintConfig);
}

function updateEslintConfig(projectRoot) {
  const eslintConfigPath = path.join(projectRoot, '.eslintrc.js');
  const eslintConfig = require(eslintConfigPath);

  eslintConfig.extends = eslintConfig.extends || [];
  if (!eslintConfig.extends.includes('eslint:recommended')) {
    eslintConfig.extends.push('eslint:recommended');
  }
  if (!eslintConfig.extends.includes('plugin:react/recommended')) {
    eslintConfig.extends.push('plugin:react/recommended');
  }
  if (!eslintConfig.extends.includes('plugin:react-hooks/recommended')) {
    eslintConfig.extends.push('plugin:react-hooks/recommended');
  }

  eslintConfig.plugins = eslintConfig.plugins || [];
  if (!eslintConfig.plugins.includes('react')) {
    eslintConfig.plugins.push('react');
  }
  if (!eslintConfig.plugins.includes('react-hooks')) {
    eslintConfig.plugins.push('react-hooks');
  }

  fs.writeFileSync(eslintConfigPath, `module.exports = ${JSON.stringify(eslintConfig, null, 2)}`);
}

function createGitIgnore(projectRoot) {
  const gitignore = `
# Dependencies
/node_modules

# Production
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
  `.trim();

  fs.writeFileSync(path.join(projectRoot, '.gitignore'), gitignore);
}

function updateGitIgnore(projectRoot, missingEntries) {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  let gitignore = fs.readFileSync(gitignorePath, 'utf8');

  missingEntries.forEach(entry => {
    gitignore += `\n${entry}`;
  });

  fs.writeFileSync(gitignorePath, gitignore.trim() + '\n');
}

function createReadme(projectRoot) {
  const readme = `
# Dywo Project

This project was created with Dywo CLI.

## Getting Started

To start the development server:

\`\`\`
npm run dev
\`\`\`

To build the project for production:

\`\`\`
npm run build
\`\`\`

To start the production server:

\`\`\`
npm start
\`\`\`

## Project Structure

- \`src/\`: Contains the source code for your application
  - \`components/\`: React components
  - \`pages/\`: React components representing pages
  - \`styles/\`: CSS files
- \`public/\`: Contains static assets
- \`dist/\`: Contains the built project (created after running \`npm run build\`)

## Learn More

To learn more about Dywo, check out the [Dywo documentation](https://github.com/your-username/dywo-cli).
  `.trim();

  fs.writeFileSync(path.join(projectRoot, 'README.md'), readme);
}

function updateReadme(projectRoot) {
  const readmePath = path.join(projectRoot, 'README.md');
  let readme = fs.readFileSync(readmePath, 'utf8');

  if (!readme.includes('# Dywo Project')) {
    readme = '# Dywo Project\n\n' + readme;
  }

  if (!readme.includes('## Getting Started')) {
    readme += '\n\n## Getting Started\n\nTo start the development server:\n\n```\nnpm run dev\n```';
  }

  fs.writeFileSync(readmePath, readme.trim() + '\n');
}

function installDependencies(projectRoot, dependencies, isDev) {
  const command = `npm install ${isDev ? '--save-dev' : '--save'} ${dependencies.join(' ')}`;
  execSync(command, { stdio: 'inherit', cwd: projectRoot });
}

function createDefaultSourceFiles(projectRoot) {
  const srcPath = path.join(projectRoot, 'src');
  fs.ensureDirSync(srcPath);

  createDefaultFile(projectRoot, 'src/index.js');
  createDefaultFile(projectRoot, 'src/App.js');
  createDefaultFile(projectRoot, 'src/styles/index.css');
  createDefaultFile(projectRoot, 'src/components/Header.js');
  createDefaultFile(projectRoot, 'src/pages/Home.js');
}

async function shouldFix() {
  const { fix } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'fix',
      message: 'Do you want to automatically fix these issues?',
      default: false
    }
  ]);
  return fix;
}

async function runTests(projectRoot) {
  console.log(chalk.blue('Running tests...'));

  // Test webpack compilation
  try {
    const webpackConfig = require(path.join(projectRoot, 'webpack.config.js'));
    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        console.error(chalk.red('Webpack compilation failed:'), err || stats.toString());
      } else {
        console.log(chalk.green('Webpack compilation successful.'));
      }
    });
  } catch (error) {
    console.error(chalk.red('Error running webpack:'), error);
  }

  // Run ESLint
  try {
    const eslintCLI = new eslint.ESLint();
    const results = await eslintCLI.lintFiles([path.join(projectRoot, 'src')]);
    const formatter = await eslintCLI.loadFormatter('stylish');
    const resultText = formatter.format(results);
    console.log(resultText);
  } catch (error) {
    console.error(chalk.red('Error running ESLint:'), error);
  }

  // Test npm scripts
  const scripts = ['build', 'start', 'dev'];
  for (const script of scripts) {
    try {
      console.log(chalk.blue(`Testing npm script: ${script}`));
      spawnSync('npm', ['run', script], { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
      console.error(chalk.red(`Error running npm script ${script}:`), error);
    }
  }
}

module.exports = repair;