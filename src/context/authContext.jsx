import { createContext, useContext, useState, useEffect } from "react";
import { router } from "../routes/router";
import { getSessionsByUser } from "../services/api";
import { registerTemporaryUser, getUserInfo, loginTemporaryUser } from "../services/api";
import Toast from "../components/Toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [sessions, setSessions] = useState(() => {
    const storedSessions = localStorage.getItem("sessions");
    return !!storedSessions ? JSON.parse(storedSessions) : [];
  });
  const [selectedSession, setSelectedSession] = useState(() => {
    const storedSessionId = localStorage.getItem("selectedSession");
    return !!storedSessionId ? parseInt(JSON.parse(storedSessionId)) : null;
  });
  const [sessionLoadingStatus, setSessionLoadingStatus] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [toasts, setToasts] = useState([]);

  const isShareGate = window.location.pathname.startsWith("/share");

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
        showToast("Session expired. Re-authenticating...", "warning");

        const new_user = await loginTemporaryUser(currentUser.user_id);

        console.log("Temporary user re-authenticated successfully");
        setUser(new_user);
        // showToast("Session refreshed successfully", "success");
      } catch (reAuthError) {
        console.error("Failed to re-authenticate temporary user:", reAuthError);
        // showToast("Failed to refresh session. Creating new session...", "error");
        // logout();
      }
    } else {
      // For regular users: logout completely
      console.log("Logging out regular user due to token expiration");
      showToast("Your session has expired. Please login again.", "warning");
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

  const checkIfCreateTemporaryUser = () => {
    // Check if we should create a temporary user
    if (isShareGate) return false; // Don't create a user if we are in the ShareGate
    if (isCreatingUser) return false; // Prevent multiple simultaneous user creation

    const localUser = localStorage.getItem("user");

    // If no user in state and no valid user in localStorage, create temp user
    if (!user) {
      if (!localUser) return true;

      try {
        const parsedUser = JSON.parse(localUser);
        // Check if the parsed user has a valid user_id
        return !parsedUser?.user_id;
      } catch {
        // If parsing fails, localStorage is corrupted, create new user
        return true;
      }
    }

    return false;
  };

  // Check local storage, if no user exists, create one
  useEffect(() => {
    const createTemporaryUser = async () => {
      if (!checkIfCreateTemporaryUser()) return;

      setIsCreatingUser(true);

      try {
        console.log("Creating temporary user...");
        const newUserId = await registerTemporaryUser();

        if (!newUserId) {
          showToast("Failed to create temporary user", "error");
          return;
        }

        // Login the temporary user to get token
        try {
          const loginResponse = await loginTemporaryUser(newUserId);
          console.log("Temporary user logged in:", loginResponse?.user_id);

          // Update user with token information
          const userWithToken = {
            user_id: newUserId,
            email: null,
            username: null,
            token: loginResponse.access_token,
            temporary_user: loginResponse.temporary_user
          };

          setUser(userWithToken);
        } catch (loginError) {
          console.error("Failed to login temporary user:", loginError);
          showToast("Failed to authenticate temporary user", "error");
        }
      } catch (error) {
        console.error("Failed to create user:", error);
        showToast("User cannot be created. Please clear cache!", "error");
      } finally {
        setIsCreatingUser(false);
      }
    };

    createTemporaryUser();
  }, [user]);

  // Persist user and fetch sessions by user
  useEffect(() => {
    console.log("Persisting user to localStorage:", user?.user_id);

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

        console.log("Sessions fetched successfully:", result?.length || 0, "sessions");
        setSessions(result || []);

        if (result) {
          localStorage.setItem("sessions", JSON.stringify(result));
        } else {
          localStorage.setItem("sessions", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);

        // Check for token expiration error
        if (error.response?.status === 401) {
          console.log("HERERERER")
          const errorDetail = error.response?.data?.detail || "";
          console.log("Authentication error detail:", error.response?.data);

          if (errorDetail.includes("expired") || errorDetail.includes("Token has expired")) {
            console.log("Token expired during session fetch");
            await handleTokenExpiration(user);
          } else {
            showToast("Authentication failed. Please try again.", "error");
          }
        } else {
          showToast("Failed to fetch sessions", "error");
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
    if (selectedSession && sessions.length > 0) {
      const selected = sessions.find(s => s.session_token === selectedSession);
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
        logout
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
