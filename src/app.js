const express = require('express');
const cors = require('cors');
const Gist = require('./gist');
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

app.get('/:authToken/:gistId/:username/stream/:type/:id.json', async (req, res) => {
  const { authToken, gistId } = req.params;

  try {
    const gist    = new Gist(authToken, gistId);
    const content = await gist.getContent();
    respond(res, content);
  } catch (error) {
    console.error('Error fetching gist:', error.message);
    res.status(500).json({
      error:    'Failed to fetch gist',
      message:  error.message
    });
  }
});

module.exports = app;
