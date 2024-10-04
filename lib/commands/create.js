const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');

const templates = {
  basic: {
    dependencies: {
      'react': '^17.0.2',
      'react-dom': '^17.0.2',
      'react-router-dom': '^5.2.0'
    },
    devDependencies: {
      '@babel/core': '^7.14.3',
      '@babel/preset-env': '^7.14.2',
      '@babel/preset-react': '^7.13.13',
      'babel-loader': '^8.2.2',
      'css-loader': '^5.2.6',
      'html-webpack-plugin': '^5.3.1',
      'style-loader': '^2.0.0',
      'webpack': '^5.38.1',
      'webpack-cli': '^4.7.0',
      'webpack-dev-server': '^3.11.2'
    },
    files: {
      'src/index.js': `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
      `,
      'src/App.js': `
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>

        <Switch>
          <Route path="/" exact>
            <h1>Home</h1>
          </Route>
          <Route path="/about">
            <h1>About</h1>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
      `
    }
  },
  advanced: {
    dependencies: {
      'react': '^17.0.2',
      'react-dom': '^17.0.2',
      'react-router-dom': '^5.2.0',
      'styled-components': '^5.3.0'
    },
    devDependencies: {
      '@babel/core': '^7.14.3',
      '@babel/preset-env': '^7.14.2',
      '@babel/preset-react': '^7.13.13',
      'babel-loader': '^8.2.2',
      'css-loader': '^5.2.6',
      'html-webpack-plugin': '^5.3.1',
      'style-loader': '^2.0.0',
      'webpack': '^5.38.1',
      'webpack-cli': '^4.7.0',
      'webpack-dev-server': '^3.11.2',
      'eslint': '^7.27.0',
      'eslint-plugin-react': '^7.24.0',
      'jest': '^27.0.1',
      'react-test-renderer': '^17.0.2'
    },
    files: {
      'src/index.js': `
import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import App from './App';
import theme from './theme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
      `,
      'src/App.js': `
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import Home from './pages/Home';
import About from './pages/About';
import Navigation from './components/Navigation';

const AppWrapper = styled.div\`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
\`;

function App() {
  return (
    <Router>
      <AppWrapper>
        <Navigation />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
        </Switch>
      </AppWrapper>
    </Router>
  );
}

export default App;
      `,
      'src/theme.js': `
export default {
  colors: {
    primary: '#0070f3',
    secondary: '#ff4081',
    background: '#f0f0f0',
    text: '#333333',
  },
  fonts: {
    body: 'Arial, sans-serif',
    heading: 'Georgia, serif',
  },
};
      `,
      'src/components/Navigation.js': `
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav\`
  margin-bottom: 20px;
\`;

const NavList = styled.ul\`
  list-style-type: none;
  padding: 0;
\`;

const NavItem = styled.li\`
  display: inline;
  margin-right: 10px;
\`;

function Navigation() {
  return (
    <Nav>
      <NavList>
        <NavItem>
          <Link to="/">Home</Link>
        </NavItem>
        <NavItem>
          <Link to="/about">About</Link>
        </NavItem>
      </NavList>
    </Nav>
  );
}

export default Navigation;
      `,
      'src/pages/Home.js': `
import React from 'react';
import styled from 'styled-components';

const HomeWrapper = styled.div\`
  h1 {
    color: \${props => props.theme.colors.primary};
  }
\`;

function Home() {
  return (
    <HomeWrapper>
      <h1>Welcome to Dywo</h1>
      <p>This is an advanced SPA created with Dywo CLI.</p>
    </HomeWrapper>
  );
}

export default Home;
      `,
      'src/pages/About.js': `
import React from 'react';
import styled from 'styled-components';

const AboutWrapper = styled.div\`
  h1 {
    color: \${props => props.theme.colors.secondary};
  }
\`;

function About() {
  return (
    <AboutWrapper>
      <h1>About Dywo</h1>
      <p>Dywo is a powerful CLI tool for creating and managing single-page applications.</p>
    </AboutWrapper>
  );
}

export default About;
      `
    }
  }
};

async function create(projectName, options) {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter your project name:',
      default: projectName || 'my-dywo-spa'
    },
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      choices: ['basic', 'advanced'],
      default: options.template || 'basic'
    },
    {
      type: 'list',
      name: 'stateManagement',
      message: 'Choose a state management solution:',
      choices: ['none', 'redux', 'mobx'],
      default: options.stateManagement || 'none'
    },
    {
      type: 'list',
      name: 'routing',
      message: 'Choose a routing solution:',
      choices: ['hash', 'history'],
      default: options.routing || 'history'
    }
  ];

  const answers = await inquirer.prompt(questions);
  const projectPath = path.join(process.cwd(), answers.projectName);

  try {
    await fs.ensureDir(projectPath);

    // Generate project structure
    await generateProjectStructure(projectPath, answers);

    // Install dependencies
    console.log(chalk.cyan('Installing dependencies...'));
    execSync('npm install', { cwd: projectPath, stdio: 'inherit' });

    // Additional setup based on choices
    if (answers.stateManagement !== 'none') {
      execSync(`npm install ${answers.stateManagement}`, { cwd: projectPath, stdio: 'inherit' });
    }

    console.log(chalk.green(`\nSuccess! Created ${answers.projectName} at ${projectPath}`));
    console.log(chalk.cyan('\nInside that directory, you can run several commands:'));
    console.log(chalk.cyan('\n  npm start'));
    console.log(chalk.gray('    Starts the development server.'));
    console.log(chalk.cyan('\n  npm run build'));
    console.log(chalk.gray('    Bundles the app into static files for production.'));
    console.log(chalk.cyan('\n  npm test'));
    console.log(chalk.gray('    Starts the test runner.'));
    console.log(chalk.cyan('\nWe suggest that you begin by typing:'));
    console.log(chalk.cyan(`\n  cd ${answers.projectName}`));
    console.log(chalk.cyan('  npm start'));
    console.log(chalk.blueBright('\nHappy Creating! -Dywo :3'));
  } catch (err) {
    console.error(chalk.red('Error creating project:'), err);
  }
}

async function generateProjectStructure(projectPath, answers) {
  const template = templates[answers.template];

  // Create directories
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'public'));

  // Create files
  await generateIndexHtml(projectPath);
  Object.entries(template.files).forEach(async ([filePath, content]) => {
    await fs.outputFile(path.join(projectPath, filePath), content.trim());
  });
  await generatePackageJson(projectPath, answers, template);
  await generateDywoConfig(projectPath);
  await generateWebpackConfig(projectPath);
  await generateReadme(projectPath);
  await generateGitignore(projectPath);
}

async function generateIndexHtml(projectPath) {
  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dywo App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
  `;
  await fs.writeFile(path.join(projectPath, 'public', 'index.html'), content.trim());
}

async function generatePackageJson(projectPath, answers, template) {
  const content = {
    name: path.basename(projectPath),
    version: '1.0.0',
    description: 'A Dywo single-page application',
    main: 'src/index.js',
    scripts: {
      start: 'webpack serve --mode development --open',
      build: 'webpack --mode production',
      test: 'jest'
    },
    dependencies: template.dependencies,
    devDependencies: template.devDependencies
  };

  if (answers.stateManagement !== 'none') {
    content.dependencies[answers.stateManagement] = 'latest';
  }

  await fs.writeJson(path.join(projectPath, 'package.json'), content, { spaces: 2 });
}

async function generateDywoConfig(projectPath) {
  const content = {
    structure: {
      client: {
        src: './src',
        output: './build'
      }
    },
    scripts: {
      'client:dev': 'webpack serve --mode development --open',
      'client:build': 'webpack --mode production',
      'start': 'webpack serve --mode development --open'
    }
  };
  await fs.writeJson(path.join(projectPath, '.dywo'), content, { spaces: 2 });
}

async function generateWebpackConfig(projectPath) {
  const content = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    historyApiFallback: true,
    contentBase: './build'
  }
};
  `;
  await fs.writeFile(path.join(projectPath, 'webpack.config.js'), content.trim());
}

async function generateReadme(projectPath) {
  const content = `
# Dywo App

This is a single-page application created with Dywo CLI.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in development mode.

### \`npm run build\`

Builds the app for production.

### \`npm test\`

Runs the test suite.

## Learn More

To learn more about Dywo, check out the [Dywo documentation](https://github.com/bluethefoxofficial/dywo-cli).
  `;
  await fs.writeFile(path.join(projectPath, 'README.md'), content.trim());
}

async function generateGitignore(projectPath) {
  const content = `
# Dependencies
/node_modules

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
  `;
  await fs.writeFile(path.join(projectPath, '.gitignore'), content.trim());
}

module.exports = create;