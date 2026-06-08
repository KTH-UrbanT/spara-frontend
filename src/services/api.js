import axios from "axios";
import { VITE_MS_URL } from "../constants.js";

// Helpers

const getAuthHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    
    if (!token) {
      console.warn("No token found in localStorage");
      return {
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

const getFilenameFromContentDisposition = (contentDisposition) => {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] || null;
};

// API Calls - Unauthenticated

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

export async function registerTemporaryUser(email) {
  try {
    const response = await axios.post(`${VITE_MS_URL}/user/register/temporary/`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register temporary user:", error);
    throw error; 
  }
}

export async function registerTemporaryUserToRegular({userId, username, email, password }) {
  try {
    const response = await axios.post(
      `${VITE_MS_URL}/user/register/temporary-to-regular/${userId}/`,
      { username, email, password }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to convert temporary user to regular:", error);
    throw error;
  }
}

export async function login({ username, password }) {
  try {
    const response = await axios.post(`${VITE_MS_URL}/user/login/`, 
      {
        grant_type: "password",
        username,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error; 
  }
}

export async function loginTemporaryUser(userId) {
  try {
    const response = await axios.post(`${VITE_MS_URL}/user/login/temporary/`, {
      temp_user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to login temporary user:", error);
    throw error;
  }
}

// API Calls - Authenticated

export async function getSessionsByUser(userId) {
  try {
    const response = await axios.get(`${VITE_MS_URL}/session/${userId}/`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    throw error;
  }
}

const toMessageTimestamp = (message) => {
  const value = message?.timestamp ?? message?.sent_at;
  if (value == null || value === "") {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    return Number(value);
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : Math.floor(parsed / 1000);
};

const normalizeMessage = (message) => {
  const timestamp = toMessageTimestamp(message);

  return {
    ...message,
    ...(timestamp !== undefined ? { timestamp } : {}),
  };
};

export async function getMessagesBySession(sessionId) {
  try {
    const response = await axios.get(`${VITE_MS_URL}/messages/${sessionId}/`, {
      headers: getAuthHeaders()
    });
    return Array.isArray(response.data)
      ? response.data
          .filter((message) => message?.role !== "system")
          .map(normalizeMessage)
      : [];
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    throw error;
  }
}

export async function updateSessionActiveState(sessionId, isActive) {
  try {
    const response = await axios.patch(
      `${VITE_MS_URL}/session/${sessionId}/active/`,
      null,
      {
        params: { is_active: isActive },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update session active state:", error);
    throw error;
  }
}

export async function getUserInfo(userId) {
  try {
    const response = await axios.get(`${VITE_MS_URL}/user/${userId}/`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    throw error;
  }
}

export async function sendRating(userId, rating, message, sessionIdInt, messageId = null) {
  try {
    console.log( "User: " + userId + " is sending a " + rating + ", as rating for: " + message)
    const payload = { userId, rating, message, sessionIdInt };
    if (messageId != null) {
      payload.messageId = messageId;
    }
    const response = await axios.post(
      `${VITE_MS_URL}/rating/`,
      payload, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send rating" + error);
    throw error;
  }
}

export async function downloadDraftReport(reportId, fileName = "draft_energy_report.txt") {
  try {
    const response = await axios.get(
      `${VITE_MS_URL}/reports/${reportId}/download/`,
      {
        headers: getAuthHeaders(),
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "text/plain;charset=utf-8",
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    const headerFileName = getFilenameFromContentDisposition(response.headers["content-disposition"]);
    const preferredFileName =
      headerFileName ||
      (fileName && fileName !== "building_id_not_available.txt" ? fileName : null) ||
      "draft_energy_report.txt";
    link.setAttribute("download", preferredFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Failed to download draft report:", error);
    throw error;
  }
}

export async function generateExpertReport(reportInput) {
  try {
    const response = await axios.post(
      `${VITE_MS_URL}/expert-reports/generate/`,
      reportInput,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to generate expert report:", error);
    throw error;
  }
}

export async function downloadEvaluationRecords({
  format = "jsonl",
  userId = null,
  sessionId = null,
} = {}) {
  try {
    const params = new URLSearchParams({ format });
    if (userId != null) {
      params.set("user_id", userId);
    }
    if (sessionId != null) {
      params.set("session_id", sessionId);
    }

    const response = await axios.get(
      `${VITE_MS_URL}/evaluation/export/?${params.toString()}`,
      {
        headers: getAuthHeaders(),
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    const headerFileName = getFilenameFromContentDisposition(response.headers["content-disposition"]);
    link.setAttribute(
      "download",
      headerFileName || `spara-evaluation-records.${format}`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Failed to download evaluation records:", error);
    throw error;
  }
}

export async function sendAdvisorReview(review) {
  try {
    const response = await axios.post(
      `${VITE_MS_URL}/evaluation/advisor-review/`,
      review,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send advisor review:", error);
    throw error;
  }
}
