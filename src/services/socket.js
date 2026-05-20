import { io } from "socket.io-client";
import {
  SOCKET_SERVER_URL,
  MAX_RECONNECT_ATTEMPTS,
  EVENTS,
} from "../constants";

// Initialize the socket connection
const socket = io(SOCKET_SERVER_URL, {
  auth: {
    session_id: null,
    user_id: null,
    email: null,
    session_id_int: null, // Use session_id_int for db primary key 
  },
  reconnection: true, // Enable auto-reconnection
  reconnectionAttempts: MAX_RECONNECT_ATTEMPTS, // Max reconnection attempts
  transports: ["websocket"], // Use WebSocket transport
  secure: true,
});

// Event handlers for socket connection status
socket.on("connect", (sid) => {
  console.log("Connected to socket server with session ID:", sid);
});

socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`Reconnect attempt ${attempt}`);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("session_updated", (session) => {
  console.log("Session updated:", session);
});

socket.on("session_created", (session) => {
  console.log("Session created:", session);
});

// Event handling functions
export const sendMessage = (message, sessionId, sessionIdInt) => {
  socket.emit(EVENTS.MESSAGE_SEND, message, sessionId, sessionIdInt);
};

export const createNewSession = (message, userId, email) => {
  socket.emit(EVENTS.CREATE_NEW_SESSION, message, userId, email);
};

export const establishSession = (sessionId, sessionIdInt, userId, email) => {
  socket.emit(EVENTS.ESTABLISH_SESSION, sessionId, sessionIdInt, userId, email);
};

export const listenForMessages = (callback) => {
  socket.on(EVENTS.MESSAGE_RECEIVE, callback);
};

export const listenForAnswers = (callback) => {
  socket.on(EVENTS.MESSAGE_ANSWER, callback);
};

export const listenForSessionUpdates = (callback) => {
  socket.on(EVENTS.SESSION_UPDATED, callback);
};

export const listenForSessionCreated = (callback) => {
  socket.on(EVENTS.SESSION_CREATED, callback);
}

// Cleanup function to remove listeners
export const removeMessageListener = (callback) => {
  socket.off(EVENTS.MESSAGE_RECEIVE, callback);
};

export const removeAnswerListener = (callback) => {
  socket.off(EVENTS.MESSAGE_ANSWER, callback);
};

export const removeSessionUpdatedListener = (callback) => {
  socket.off(EVENTS.SESSION_UPDATED, callback);
};

export const removeSessionCreatedListener = (callback) => {
  socket.off(EVENTS.SESSION_CREATED, callback);
}

// Export socket instance and helper functions
export default socket;
