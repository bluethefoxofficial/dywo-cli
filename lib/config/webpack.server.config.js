const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './src/server/index.js',
  output: {
    path: path.resolve(process.cwd(), 'dist/server'),
    filename: 'server.js',
    publicPath: '/',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};