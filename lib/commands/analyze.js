const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function analyze(options) {
  const configPath = path.join(process.cwd(), 'dywo.config.js');
  let webpackConfig;

  if (fs.existsSync(configPath)) {
    webpackConfig = require(configPath);
  } else {
    webpackConfig = require('../config/webpack.config.js');
  }

  webpackConfig.mode = 'production';

  webpackConfig.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: options.output === 'json' ? 'json' : 'server',
    reportFilename: options.output === 'json' ? 'report.json' : 'report.html',
    defaultSizes: 'gzip',
    openAnalyzer: true,
    generateStatsFile: true,
    statsFilename: 'stats.json',
    statsOptions: {
      source: false,
      modules: true,
      chunkGroups: true,
      chunkModules: options.detail === 'advanced',
    },
    excludeAssets: null,
    logLevel: 'info'
  }));

  const compiler = webpack(webpackConfig);

  compiler.run((err, stats) => {
    if (err) {
      console.error(chalk.red('Analysis failed:'), err);
    } else {
      console.log(stats.toString({
        chunks: false,
        colors: true
      }));
      console.log(chalk.green('Bundle analysis complete!'));
      if (options.output === 'json') {
        console.log(chalk.cyan(`Analysis report saved as report.json and stats.json`));
      } else {
        console.log(chalk.cyan('Analysis report opened in your default browser'));
      }
    }
  });
}

module.exports = analyze;