const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();

// Load SSL certificate, key, and CA bundle
const options = {
  key: fs.readFileSync('./crobqs.key'), // Replace with your key file path
  cert: fs.readFileSync('./crobqs.crt'), // Replace with your cert file path
  // ca: fs.readFileSync('./ca_bundle.crt'), // Optional: replace with CA bundle file path if needed
};

// Create HTTPS server
const server = https.createServer(options, app);
const io = new Server(server);

// Port for HTTPS traffic (443)
let PORT = 443;
let clients = new Map();

// Serve static files from 'public' directory
app.use(express.static(__dirname + '/public'));

// WebSocket event handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (username) => {
    clients.set(socket.id, username);
    console.log(`${username} joined.`);
    socket.broadcast.emit('message', `${username} joined the chat.`);
  });

  socket.on('chat message', (msg) => {
    const username = clients.get(socket.id) || 'Anonymous';
    io.emit('message', `${username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    const username = clients.get(socket.id);
    if (username) {
      console.log(`${username} disconnected.`);
      socket.broadcast.emit('message', `${username} left the chat.`);
      clients.delete(socket.id);
    }
  });
});

// Start the HTTPS server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on https://crobqs.com`);
});
