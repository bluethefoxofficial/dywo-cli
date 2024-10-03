const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function optimize(options) {
  const configPath = path.join(process.cwd(), 'dywo.config.js');
  let webpackConfig;

  if (fs.existsSync(configPath)) {
    webpackConfig = require(configPath);
  } else {
    webpackConfig = require('../config/webpack.config.js');
  }

  webpackConfig.mode = 'production';

  // Size optimizations
  if (options.target === 'size' || options.target === 'both') {
    webpackConfig.optimization = {
      ...webpackConfig.optimization,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: options.level === 'aggressive',
              drop_debugger: true,
              pure_funcs: options.level === 'aggressive' ? ['console.log'] : [],
            },
            mangle: true,
          },
        }),
      ],
    };

    webpackConfig.plugins.push(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      })
    );
  }

  // Performance optimizations
  if (options.target === 'performance' || options.target === 'both') {
    webpackConfig.optimization = {
      ...webpackConfig.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    webpackConfig.plugins.push(
      new webpack.optimize.ModuleConcatenationPlugin()
    );
  }

  // Add bundle analyzer
  webpackConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-analysis.html',
      openAnalyzer: false,
    })
  );

  const compiler = webpack(webpackConfig);

  compiler.run((err, stats) => {
    if (err) {
      console.error(chalk.red('Optimization failed:'), err);
    } else {
      console.log(stats.toString({
        chunks: false,
        colors: true
      }));
      console.log(chalk.green('Optimization complete!'));
      console.log(chalk.cyan('Bundle analysis report generated at bundle-analysis.html'));
    }
  });
}

module.exports = optimize;