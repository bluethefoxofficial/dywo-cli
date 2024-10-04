module.exports = {
  client: {
    entry: './client/src/index.js',
    output: {
      path: './client/build',
      filename: 'bundle.js'
    },
    devServer: {
      port: 3000,
      proxy: {
        '/api': 'http://localhost:5000'
      }
    }
  },
  server: {
    entry: './server/src/index.js',
    output: {
      path: './server/build',
      filename: 'server.js'
    },
    port: 5000
  },
  shared: {
    // Add any shared configuration here
  }
};