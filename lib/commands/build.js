const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

async function compile(options) {
  const projectRoot = process.cwd();
  const configPath = options.config
    ? path.resolve(projectRoot, options.config)
    : path.join(projectRoot, 'dywo.config.js');

  let dywoConfig;
  if (fs.existsSync(configPath)) {
    dywoConfig = require(configPath);
  } else {
    console.error(chalk.red('dywo.config.js not found. Using default configuration.'));
    dywoConfig = {};
  }

  const env = options.env || 'production';
  const target = options.target || 'client';

  console.log(chalk.blue(`Compiling ${target} for ${env} environment...`));

  const webpackConfig = createWebpackConfig(dywoConfig, env, target, options);

  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    const callback = (err, stats) => {
      if (err) {
        console.error(chalk.red('Compilation failed:'), err);
        reject(err);
      } else {
        console.log(stats.toString({
          chunks: false,
          colors: true
        }));

        if (stats.hasErrors()) {
          console.error(chalk.red('Compilation failed with errors.'));
          reject(new Error('Compilation failed'));
        } else {
          console.log(chalk.green(`${target} compilation completed successfully!`));
          resolve(stats);
        }
      }
    };

    if (options.watch) {
      compiler.watch({}, callback);
    } else {
      compiler.run(callback);
    }
  });
}

function createWebpackConfig(dywoConfig, env, target, options) {
  const isProduction = env === 'production';
  const outputPath = path.resolve(dywoConfig.outputPath || 'dist', target);

  let webpackConfig = {
    mode: isProduction ? 'production' : 'development',
    entry: dywoConfig.entry || './src/index.js',
    output: {
      path: outputPath,
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
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
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html'
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css'
      })
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
      splitChunks: {
        chunks: 'all'
      }
    }
  };

  if (isProduction) {
    webpackConfig.optimization.minimizer.push(new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    }));
  }

  if (options.analyze) {
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
  }

  // Handle slugs
  const slugsFile = path.join(process.cwd(), 'dywo.slugs.json');
  if (fs.existsSync(slugsFile)) {
    const slugs = fs.readJsonSync(slugsFile);
    Object.entries(slugs).forEach(([slug, pagePath]) => {
      webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
          filename: `${slug}.html`,
          template: path.join(process.cwd(), pagePath),
          chunks: ['main']
        })
      );
    });

    webpackConfig.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('GenerateSlugsJson', (compilation) => {
          const outputPath = compilation.outputOptions.path;
          fs.writeJsonSync(path.join(outputPath, 'slugs.json'), slugs, { spaces: 2 });
        });
      }
    });
  }

  if (target === 'server') {
    webpackConfig.target = 'node';
    webpackConfig.externals = [/^[a-z\-0-9]+$/];
    webpackConfig.output.libraryTarget = 'commonjs2';
  }

  // Merge with user-defined webpack config
  if (dywoConfig.webpack) {
    webpackConfig = require('webpack-merge')(webpackConfig, dywoConfig.webpack);
  }

  return webpackConfig;
}

module.exports = compile;