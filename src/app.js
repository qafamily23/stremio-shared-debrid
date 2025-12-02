const express = require('express');
const cors = require('cors');
const manifest = require('./manifest');

const app = express();
app.use(cors());  // Enable CORS

const respond = (res, data) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(data)
}

// Manifest route
app.get('/:authToken/:gistId/:username/manifest.json', (req, res) => {
  respond(res, manifest);
});

module.exports = app;
