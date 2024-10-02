module.exports = {
    client: {
      entry: './src/main.js',
      output: {
        path: './dist',
        filename: 'bundle.js'
      }
    },
    server: {
      entry: './src/index.js',
      output: {
        path: './dist',
        filename: 'server.js'
      }
    },
    devServer: {
      port: 8080,
      proxy: {
        '/api': 'http://localhost:3000'
      }
    }
  };