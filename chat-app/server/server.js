const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Replace with your Vue app's URL
      methods: ["GET", "POST"],
    },
  });
  

const users = {}; // Store users

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id; // Store socket ID with user ID
    console.log(`User registered: ${userId}`);
  });

  socket.on("privateMessage", ({ senderId, recipientId, message }) => {
    console.log(`Message from ${senderId} to ${recipientId}: ${message}`);


    const recipientSocketId = users[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("privateMessage", { senderId, message });
      console.log(`Message from ${senderId} to ${recipientId}: ${message}`);
    } else {
      console.log(`User ${recipientId} not connected`);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Optionally, remove user from the users object
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
