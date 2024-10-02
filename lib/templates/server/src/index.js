const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'client/src' directory during development
// In production, this should be changed to 'client/dist'
app.use(express.static(path.join(__dirname, '../../client/src')));

// Handle API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Dywo server!' });
});

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/src/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;