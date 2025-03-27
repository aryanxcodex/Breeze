// server.js
const express = require('express');
const { PeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Create PeerJS server
const peerServer = PeerServer({
  port: 9000,
  path: '/myapp'
});

// Serve static files from React app
app.use(express.static('client/build'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});