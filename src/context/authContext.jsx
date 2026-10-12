import { createContext, useContext, useState, useEffect } from "react";
import { router } from "../routes/router";
import { getSessionsByUser, localizeServiceError } from "../services/api";
import { registerTemporaryUser, loginTemporaryUser } from "../services/api";
import Toast from "../components/Toast";

const AuthContext = createContext(null);

const readJsonFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

const readArrayFromStorage = (key) => {
  const value = readJsonFromStorage(key, []);
  return Array.isArray(value) ? value : [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return readJsonFromStorage("user", null);
  });

  const [sessions, setSessions] = useState(() => {
    return readArrayFromStorage("sessions");
  });
  const [selectedSession, setSelectedSession] = useState(() => {
    return readJsonFromStorage("selectedSession", null);
  });
  const [sessionLoadingStatus, setSessionLoadingStatus] = useState({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type) => {
    const id = Date.now(); // simple unique ID
    setToasts((prev) => [...prev, { id, message, type: !!type ? type : "info" }]);

    // Remove toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const handleTokenExpiration = async (currentUser) => {
    // Handle token expiration based on user type
    console.log("Token expired for user:", currentUser?.user_id);

    if (!currentUser) {
      console.log("No user found during token expiration");
      return;
    }

    if (currentUser.temporary_user) {
      // For temporary users: try to re-login with same user ID
      try {
        console.log("Re-authenticating temporary user:", currentUser.user_id);
        showToast("Your session has expired. Reconnecting...", "warning");

        const loginResponse = await loginTemporaryUser(currentUser.user_id);
        const new_user = {
          user_id: loginResponse.user_id,
          email: loginResponse.email || currentUser.email,
          username: loginResponse.username || null,
          token: loginResponse.access_token,
          temporary_user: loginResponse.temporary_user,
        };

        console.log("Temporary user re-authenticated successfully");
        setUser(new_user);
        // showToast("Session refreshed successfully", "success");
      } catch (reAuthError) {
        console.error("Failed to re-authenticate temporary user:", reAuthError);
        logout();
        showToast("Your saved login is no longer valid. Please log in or continue with email again.", "warning");
        router.navigate("/login");
      }
    } else {
      // For regular users: logout completely
      console.log("Logging out regular user due to token expiration");
      showToast("Your session has expired. Please log in again.", "warning");
      logout();
      router.navigate("/login");
    }
  };

  const logout = () => {
    // Handle user logout and cleanup
    console.log("Logging out user...");
    setSelectedSession(null);
    setSessions([]);
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("sessions");
    localStorage.removeItem("selectedSession");
    localStorage.removeItem("session_id_int");
  };

  const continueWithEmail = async (email) => {
    if (isCreatingUser) return null;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      showToast("Enter your email address.", "error");
      return null;
    }

    setIsCreatingUser(true);
    try {
      const registration = await registerTemporaryUser(normalizedEmail);
      const userId = registration?.user_id ?? registration;
      if (!userId) {
        showToast("Could not continue with this email address.", "error");
        return null;
      }

      const loginResponse = await loginTemporaryUser(userId);
      const emailUser = {
        user_id: userId,
        email: loginResponse.email || registration?.email || normalizedEmail,
        username: loginResponse.username || null,
        token: loginResponse.access_token,
        temporary_user: loginResponse.temporary_user,
      };

      localStorage.setItem("user", JSON.stringify(emailUser));
      setUser(emailUser);
      return emailUser;
    } catch (error) {
      console.error("Failed to continue with email:", error);
      const detail = error.response?.data?.detail;
      showToast(localizeServiceError(detail, "Could not continue with this email address."), "error");
      return null;
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Persist user and fetch sessions by user
  useEffect(() => {
    console.log("Persisting user to localStorage:", user?.user_id);
    let cancelled = false;

    const fetchSessions = async () => {
      try {
        if (!user || !user.token) {
          console.log("No user or token, clearing sessions");
          setSessions([]);
          localStorage.setItem("sessions", JSON.stringify([]));
          return;
        }

        console.log("Fetching sessions for user:", user.user_id);
        const result = await getSessionsByUser(user.user_id);
        if (cancelled) return;

        console.log("Sessions fetched successfully:", result?.length || 0, "sessions");
        const sessionList = Array.isArray(result) ? result : [];
        setSessions(sessionList);

        localStorage.setItem("sessions", JSON.stringify(sessionList));
      } catch (error) {
        if (cancelled) return;
        console.error("Could not load conversations:", error);

        // Check for token expiration error
        if (error.response?.status === 401) {
          const errorDetail = error.response?.data?.detail || "";
          console.log("Authentication error detail:", error.response?.data);

          if (errorDetail.includes("expired") || errorDetail.includes("Token has expired")) {
            console.log("Token expired during session fetch");
            await handleTokenExpiration(user);
          } else {
            logout();
            showToast("Your saved login is no longer valid. Please log in or continue with email again.", "warning");
            router.navigate("/login");
          }
        } else {
          showToast("Could not load conversations", "error");
        }
      }
    };

    // Persist user to localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    // Fetch sessions whenever user changes
    fetchSessions();
    return () => { cancelled = true; };
  }, [user]);

  // Persist selectedSession
  useEffect(() => {
    if (selectedSession) {
      localStorage.setItem("selectedSession", JSON.stringify(selectedSession));
    } else {
      localStorage.removeItem("selectedSession");
    }
  }, [selectedSession]);

  useEffect(() => {
    const sessionList = Array.isArray(sessions) ? sessions : [];
    if (selectedSession && sessionList.length > 0) {
      const selected = sessionList.find(s => s.session_token === selectedSession);
      const sessionIdInt = selected?.session_id ?? null;
      if (sessionIdInt !== null) {
        localStorage.setItem("session_id_int", JSON.stringify(sessionIdInt));
      }
    } else {
      localStorage.removeItem("session_id_int");
    }
  }, [selectedSession, sessions]);


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        sessions,
        setSessions,
        selectedSession,
        setSelectedSession,
        sessionLoadingStatus,
        setSessionLoadingStatus,
        showToast,
        logout,
        continueWithEmail,
        isCreatingUser,
      }}
    >
      {children}
      <Toast toasts={toasts} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
