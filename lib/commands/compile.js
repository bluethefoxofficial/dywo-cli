const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const chalk = require('chalk');

function compile(options) {
  const config = {
    mode: options.mode,
    entry: './src/index.js',
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
    ],
  };

  webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.error(chalk.red('Compilation failed:'), err || stats.toString());
      return;
    }

    console.log(chalk.green('Compilation successful!'));
    console.log(stats.toString({ colors: true }));
  });
}

module.exports = compile;