// URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const VITE_MS_URL = import.meta.env.VITE_MS_URL;
export const SOCKET_SERVER_URL = import.meta.env.VITE_MS_SOCKETIO_URL;

// App-wide constants
export const APP_NAME = "Spara";
export const TIMEOUT_DURATION = 5000;
export const MAX_RECONNECT_ATTEMPTS = 5;

// Event names
export const EVENTS = {
  MESSAGE_SEND: "send_message",
  MESSAGE_RECEIVE: "receive_message",
  MESSAGE_ANSWER: "answer_message",
  SESSION_UPDATE: "session_update",
  USER_CONNECTED: "user_connected",
  USER_DISCONNECTED: "user_disconnected",
};

// Application status
export const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error occurred. Please try again later.",
  SOCKET_DISCONNECTED: "Socket disconnected. Reconnecting...",
  MESSAGE_SEND_FAILED: "Failed to send message. Please retry.",
};
