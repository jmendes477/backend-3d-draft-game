// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",  // frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

const players = {};

io.on('connection', (socket) => {
  console.log(`New client: ${socket.id}`);

  // When new player joins
  socket.on('join', (data) => {
    players[socket.id] = {
      id: socket.id,
      position: data.position,
    };

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify others about new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
  });

  // When player moves
  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data.position;
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        position: data.position,
      });
    }
  });

  // On disconnect
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
