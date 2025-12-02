const express = require('express');
const cors = require('cors');
const manifest = require('./manifest');

const app = express();
app.use(cors());  // Enable CORS

// Manifest route
app.get('/:authToken/:gistId/:username/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(manifest);
});

module.exports = app;
