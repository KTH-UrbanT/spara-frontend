import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL, EVENTS } from '../constants';

// Initialize the socket connection
const socket = io(SOCKET_SERVER_URL, {
  reconnection: true,                    // Enable auto-reconnection
  reconnectionAttempts: 5,               // Max reconnection attempts
  transports: ['websocket'],             // Use WebSocket transport
});

// Event handlers for socket connection status
socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('reconnect_attempt', (attempt) => {
  console.log(`Reconnect attempt ${attempt}`);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Event handling functions
export const sendMessage = (message) => {
  socket.emit(EVENTS.MESSAGE_SEND, message);
};

export const listenForMessages = (callback) => {
  socket.on(EVENTS.MESSAGE_RECEIVE, callback);
};

// Cleanup function to remove listeners
export const removeMessageListener = (callback) => {
  socket.off(EVENTS.MESSAGE_RECEIVE, callback);
};

// Export socket instance and helper functions
export default socket;
