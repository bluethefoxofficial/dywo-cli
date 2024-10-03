const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { execSync } = require('child_process');

async function dev(options) {
  const projectRoot = process.cwd();
  const dywoConfigPath = path.join(projectRoot, '.dywo');

  if (!fs.existsSync(dywoConfigPath)) {
    console.error(chalk.red('.dywo configuration file not found. Run `dywo repair` to fix this issue.'));
    process.exit(1);
  }

  let dywoConfig;
  try {
    dywoConfig = JSON.parse(fs.readFileSync(dywoConfigPath, 'utf8'));
  } catch (error) {
    console.error(chalk.red('Invalid .dywo configuration file. Run `dywo repair` to fix this issue.'));
    process.exit(1);
  }

  // Check and install dependencies
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
    console.log(chalk.yellow('Installing missing dependencies...'));
    try {
      execSync(`npm install --save-dev ${missingDependencies.join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red('Failed to install dependencies. Please run `npm install` manually.'));
      process.exit(1);
    }
  }

  const clientSrcPath = path.join(projectRoot, dywoConfig.structure.client.src);
  const outputPath = path.join(projectRoot, dywoConfig.structure.client.output);

  const webpackConfig = {
    mode: 'development',
    entry: [
      path.join(clientSrcPath, 'index.js')
    ],
    output: {
      path: outputPath,
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
              presets: ['@babel/preset-env']
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
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(clientSrcPath, 'index.html')
      })
    ],
    resolve: {
      extensions: ['.js', '.json']
    }
  };

  const compiler = webpack(webpackConfig);

  const devServerOptions = {
    hot: true,
    host: 'localhost',
    port: options.port || 3000,
    open: true,
    historyApiFallback: true,
    static: {
      directory: outputPath
    }
  };

  const server = new WebpackDevServer(devServerOptions, compiler);

  try {
    await server.start();
    console.log(chalk.cyan(`Development server started at http://localhost:${devServerOptions.port}`));
    console.log(chalk.yellow('Use Ctrl+C to stop the server'));
  } catch (err) {
    console.error(chalk.red('Failed to start development server:'), err);
    process.exit(1);
  }
}

module.exports = dev;