import axios from "axios";
import { VITE_MS_URL } from "../constants.js";

export async function getSessionsByUser(userId) {
  try {
    const response = await axios.get(`${VITE_MS_URL}/session/${userId}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
  }
}

export async function getMessagesBySession(sessionId) {
  try {
    const response = await axios.get(`${VITE_MS_URL}/messages/${sessionId}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
  }
}

export async function registerUser({ username, email, password }) {
  try {
    const response = await axios.post(`${VITE_MS_URL}/user/register/`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register user:", error);
  }
}

export async function registerTemporaryUser() {
  try {
    const response = await axios.post(`${VITE_MS_URL}/user/register/temporary/`);
    return response.data;
  } catch (error) {
    console.error("Failed to register temporary user:", error);
    throw error; 
  }
}

export async function getUserInfo(userId) {
  try {
    const response = await axios.get(`${VITE_MS_URL}/user/${userId}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
  }
}

export async function sendRating(userId, rating, message, sessionIdInt) {
  try {
    console.log( "User: " + userId + " is sending a " + rating + ", as rating for: " + message)
    const response = await axios.post(
      `${VITE_MS_URL}/rating/`,
      {userId, rating, message, sessionIdInt}
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send rating" + error);
    return;
  }
  
}
