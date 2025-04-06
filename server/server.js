const express = require("express");
const http = require("http");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors());
// ✅ Handle WebSockets for PeerJS
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);

// ✅ Serve the Vite `dist` folder for production
app.use(express.static(path.join(__dirname, "dist")));

// Add this route in your server.js
app.get("/config.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    window.__CONFIG__ = {
      HOST: "${process.env.HOST || "localhost"}",
      PORT: ${process.env.PORT || 3000},
      SECURE: ${process.env.SECURE || false},
    };
  `);
});

// ✅ SPA Route Handling
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Listen on 0.0.0.0 to allow external connections
server.listen(3000, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:3000`);
});
