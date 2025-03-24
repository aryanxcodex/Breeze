const express = require("express");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// Start Express server
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

// Configure PeerServer with CORS
const peerServer = ExpressPeerServer(server, {
  path: "/myapp",
  allow_discovery: true,
  corsOptions: {
    origin: "*",
  },
});

// Attach PeerServer to Express
app.use("/myapp", peerServer);

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
