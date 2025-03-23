import { io } from "socket.io-client";
import { SOCKET_SERVER_URL, EVENTS } from "../constants";

// // Retrieve session ID from localStorage
// const selectedSessionId = localStorage.getItem("selectedSession");
// const sessions = !!localStorage.getItem("sessions")
//   ? JSON.parse(localStorage.getItem("sessions"))
//   : null;
// const user = !!localStorage.getItem("user")
//   ? JSON.parse(localStorage.getItem("user"))
//   : null;

// // If selectedSessionId exists, include it in query, otherwise omit it
// const auth = selectedSessionId
//   ? {
//       session_id: selectedSessionId,
//       user_id: user.user_id,
//       session_token: sessions?.find((s) => s.session_id == selectedSessionId)
//         ?.session_token,
//     }
//   : {};

// Initialize the socket connection
const socket = io(SOCKET_SERVER_URL, {
  auth: {},
  reconnection: true, // Enable auto-reconnection
  reconnectionAttempts: 5, // Max reconnection attempts
  transports: ["websocket"], // Use WebSocket transport
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

socket.on("session_update", (session) => {
  console.log("Session updated:", session);
});

// Event handling functions
export const sendMessage = (message, userId, sessionId, sessionToken) => {
  socket.emit(EVENTS.MESSAGE_SEND, message, userId, sessionId, sessionToken);
};

export const listenForMessages = (callback) => {
  socket.on(EVENTS.MESSAGE_RECEIVE, callback);
};

export const listenForAnswers = (callback) => {
  socket.on(EVENTS.MESSAGE_ANSWER, callback);
};

export const listenForSessionUpdates = (callback) => {
  socket.on(EVENTS.SESSION_UPDATE, callback);
};

// Cleanup function to remove listeners
export const removeMessageListener = (callback) => {
  socket.off(EVENTS.MESSAGE_RECEIVE, callback);
};

export const removeSessionUpdateListener = (callback) => {
  socket.off(EVENTS.SESSION_UPDATE, callback);
};

// Export socket instance and helper functions
export default socket;
