const express = require('express');
const path = require('path');
const chalk = require('chalk');

function serve(options) {
  const app = express();
  const PORT = options.port || 3000;

  app.use(express.static(path.join(process.cwd(), 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(chalk.green(`Server is running on http://localhost:${PORT}`));
  });
}

module.exports = serve;