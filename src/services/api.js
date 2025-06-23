import axios from "axios";

export async function getSessionsByUser(userId) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/session/${userId}/`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return; // Handle error gracefully
  }
}

export async function getMessagesBySession(sessionId) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/messages/${sessionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return;
  }
}

export async function registerUser({ username, email, password }) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/user/register`,
      { username, email, password },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to register user:", error);
    return;
  }
}

export async function registerTemporaryUser() {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/user/register/temporary`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to register temporary user:", error);
    return;
  }
}

export async function getUserInfo(userId) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/user/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return;
  }
}

export async function sendRating(userId, rating, message) {
  try {
    console.log( "User: " + userId + " is sending a " + rating + ", as rating for: " + message)
    const response = await axios.post(
      `${import.meta.env.VITE_SOCKET_SERVER_URL}/rating/`,
      {userId, rating, message}
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send rating");
    return;
  }
  
}
