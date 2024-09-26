<template>
  <div id="app">
    <h1>Private Chat</h1>

    <!-- User Registration -->
    <div class="registration">
      <label for="userId">Your User ID:</label>
      <input v-model="userId" id="userId" placeholder="Enter your user ID" />
      <button @click="registerUser">Register</button>
    </div>

    <!-- Recipient Input -->
    <div v-if="isRegistered">
      <label for="recipientId">Recipient ID:</label>
      <input v-model="recipientId" id="recipientId" placeholder="Enter recipient ID" />
    </div>

    <!-- Chat Interface -->
    <div v-if="isRegistered" class="chat">
      <div class="messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="{'sent': msg.senderId === userId, 'received': msg.senderId !== userId}"
        >
          <strong>{{ msg.senderId }}:</strong> {{ msg.message }}
        </div>
      </div>
      <div class="input-container">
        <input v-model="message" @keyup.enter="sendMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import { ref } from "vue";

export default {
  setup() {
    const userId = ref("");  // User ID of the current user
    const recipientId = ref("");  // Recipient ID of the message
    const message = ref("");  // Message to be sent
    const messages = ref([]);  // Chat history
    const isRegistered = ref(false);  // Flag to check if user is registered
    const socket = io("http://localhost:3000");  // Socket connection

    // Listen for private messages
    socket.on("privateMessage", ({ senderId, message: msg }) => {
      messages.value.push({ senderId, message: msg });
    });

    const registerUser = () => {
      if (userId.value) {
        socket.emit("register", userId.value);  // Register user on the server
        isRegistered.value = true;
      }
    };

    const sendMessage = () => {
      if (message.value.trim() !== "" && recipientId.value) {
        socket.emit("privateMessage", {
          senderId: userId.value,
          recipientId: recipientId.value,
          message: message.value,
        });
        messages.value.push({ senderId: userId.value, message: message.value });  // Add to local messages
        message.value = "";  // Clear the input after sending the message
      }
    };

    return {
      userId,
      recipientId,
      message,
      messages,
      isRegistered,
      registerUser,
      sendMessage,
    };
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  background-color: #e5ddd5;  /* WhatsApp-like background */
  padding: 20px;
  height: 100vh;  /* Full height */
}

.registration {
  margin-bottom: 20px;
}

.chat {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 100px);  /* Adjust height */
}

.messages {
  padding: 10px;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column; /* Ensure messages stack vertically */
}

.sent {
  align-self: flex-end; /* Align sent messages to the right */
  background-color: #dcf8c6; /* Light green background for sent messages */
  border-radius: 8px;
  padding: 10px;
  margin: 5px 0;
  max-width: 80%; /* Limit the width of the sent message */
  word-wrap: break-word; /* Allow long words to break onto the next line */
  text-align: right; /* Align text to the right */
}

.received {
  align-self: flex-start; /* Align received messages to the left */
  background-color: #ffffff; /* White background for received messages */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin: 5px 0;
  max-width: 80%; /* Limit the width of the received message */
  word-wrap: break-word; /* Allow long words to break onto the next line */
  text-align: left; /* Align text to the left */
}

.input-container {
  display: flex;
  padding: 10px;
  background-color: #f0f0f0;
}

input[type="text"] {
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
}

button {
  margin-left: 10px;
  background-color: #34b7f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
}

button:hover {
  background-color: #0092db;
}
</style>
