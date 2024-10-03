const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

function compile(options) {
  const configPath = options.config
    ? path.resolve(process.cwd(), options.config)
    : path.join(process.cwd(), 'dywo.config.js');

  let webpackConfig;

  if (fs.existsSync(configPath)) {
    webpackConfig = require(configPath);
  } else {
    webpackConfig = require('../config/webpack.config.js');
  }

  webpackConfig.mode = options.mode;

  if (options.analyze) {
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

  const compiler = webpack(webpackConfig);

  const compilePromise = new Promise((resolve, reject) => {
    const callback = (err, stats) => {
      if (err) {
        console.error(chalk.red('Compilation failed:'), err);
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

  compilePromise.then(
    (stats) => {
      console.log(chalk.green('Compilation completed successfully!'));
      if (options.analyze) {
        console.log(chalk.cyan('Bundle analysis report generated. Please check your browser.'));
      }
    },
    (err) => {
      console.error(chalk.red('Compilation failed:'), err);
      process.exit(1);
    }
  );
}

module.exports = compile;