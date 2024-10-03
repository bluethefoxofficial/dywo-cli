const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

async function build(options) {
  const configPath = options.config
    ? path.resolve(process.cwd(), options.config)
    : path.join(process.cwd(), 'dywo.config.js');

  let dywoConfig;

  if (fs.existsSync(configPath)) {
    dywoConfig = require(configPath);
  } else {
    console.error(chalk.red('dywo.config.js not found. Using default configuration.'));
    dywoConfig = {};
  }

  const clientConfig = createWebpackConfig('client', dywoConfig, options);
  const serverConfig = createWebpackConfig('server', dywoConfig, options);

  try {
    console.log(chalk.blue('Building client bundle...'));
    await runWebpack(clientConfig, options);

    console.log(chalk.blue('Building server bundle...'));
    await runWebpack(serverConfig, options);

    console.log(chalk.green('Build completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Build failed:'), error);
    process.exit(1);
  }
}

function createWebpackConfig(target, dywoConfig, options) {
  const defaultConfig = require(`../config/webpack.${target}.config.js`);
  const userConfig = dywoConfig[target] || {};

  let webpackConfig = {
    ...defaultConfig,
    ...userConfig,
    mode: options.mode || 'production',
  };

  if (options.analyze && target === 'client') {
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
  }

  if (options.optimize) {
    webpackConfig.optimization = {
      ...webpackConfig.optimization,
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      })],
    };
  }

  return webpackConfig;
}

function runWebpack(config, options) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);
    const callback = (err, stats) => {
      if (err) {
        reject(err);
      } else {
        console.log(stats.toString({
          chunks: false,
          colors: true
        }));
        resolve(stats);
      }
    };

    if (options.watch) {
      compiler.watch({}, callback);
    } else {
      compiler.run(callback);
    }
  });
}

module.exports = build;