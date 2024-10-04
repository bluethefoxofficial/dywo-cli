module.exports = {
    projectName: 'dywo-basic-project',
    version: '1.0.0',
    structure: {
      client: {
        src: './src',
        public: './public',
        output: './dist'
      }
    },
    entry: './src/index.js',
    html: './public/index.html',
    buildConfig: {
      outputPath: './dist',
      filename: 'bundle.js',
      publicPath: '/'
    },
    devServer: {
      port: 3000,
      open: true,
      historyApiFallback: true
    },
    babelConfig: {
      presets: ['@babel/preset-env', '@babel/preset-react']
    },
    scripts: {
      start: 'dywo dev',
      build: 'dywo build',
      serve: 'dywo serve'
    },
    dependencies: {
      "react": "^17.0.2",
      "react-dom": "^17.0.2"
    },
    devDependencies: {
      "@babel/core": "^7.15.0",
      "@babel/preset-env": "^7.15.0",
      "@babel/preset-react": "^7.14.5",
      "babel-loader": "^8.2.2",
      "css-loader": "^6.2.0",
      "style-loader": "^3.2.1",
      "webpack": "^5.50.0",
      "webpack-cli": "^4.8.0",
      "webpack-dev-server": "^4.0.0"
    }
  };