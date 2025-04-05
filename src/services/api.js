import axios from "axios";
import { SOCKET_SERVER_URL } from "../constants.js";

export async function getSessionsByUser(userId) {
  try {
    const response = await axios.get(`${SOCKET_SERVER_URL}/session/${userId}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return; // Handle error gracefully
  }
}

export async function getMessagesBySession(sessionId) {
  try {
    const response = await axios.get(
      `${SOCKET_SERVER_URL}/messages/${sessionId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return;
  }
}

export async function registerUser({ username, email, password }) {
  try {
    const response = await axios.post(`${SOCKET_SERVER_URL}/user/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register user:", error);
    return;
  }
}

export async function registerTemporaryUser() {
  try {
    const response = await axios.post(
      `${SOCKET_SERVER_URL}/user/register/temporary`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to register temporary user:", error);
    return;
  }
}

export async function getUserInfo(userId) {
  try {
    const response = await axios.get(`${SOCKET_SERVER_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return;
  }
}
