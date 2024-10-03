const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const https = require('https');

function serve(options) {
  const configPath = path.join(process.cwd(), 'dywo.config.js');
  let webpackConfig;

  if (fs.existsSync(configPath)) {
    webpackConfig = require(configPath);
  } else {
    webpackConfig = require('../config/webpack.config.js');
  }

  webpackConfig.mode = 'development';

  // Enable HMR
  webpackConfig.entry = [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/dev-server',
    webpackConfig.entry
  ];
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(webpackConfig);

  const devServerOptions = {
    hot: true,
    host: options.host,
    port: options.port,
    historyApiFallback: true,
    open: options.open,
    https: options.https ? {
      key: fs.readFileSync(path.join(__dirname, '../config/server.key')),
      cert: fs.readFileSync(path.join(__dirname, '../config/server.crt')),
    } : false,
  };

  const server = new WebpackDevServer(devServerOptions, compiler);

  server.startCallback(() => {
    const protocol = options.https ? 'https' : 'http';
    console.log(chalk.cyan(`Development server started on ${protocol}://${options.host}:${options.port}`));
    console.log(chalk.yellow('Use Ctrl+C to stop the server'));
  });
}

module.exports = serve;