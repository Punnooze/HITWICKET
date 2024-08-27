const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Adjust if your frontend runs on a different port
    methods: ['GET', 'POST']
  }
});

let board = [
  ['pawn_1', 'pawn_2', 'hero1', 'hero2', 'pawn_3'], // Player 1
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  ['pawn_3', 'hero2', 'hero1', 'pawn_2', 'pawn_1'], // Player 2
];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle board piece movements
  socket.on('movePiece', (updatedBoard) => {
    board = updatedBoard;
    io.emit('movePiece', board);
  });

  // Handle chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Broadcast chat message to all clients
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});
