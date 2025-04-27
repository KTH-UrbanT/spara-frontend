import { createContext, useContext, useState, useEffect } from "react";
import { getSessionsByUser } from "../services/api";
import { registerTemporaryUser, getUserInfo } from "../services/api";
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
  // console.log("selected session", selectedSession);

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now(); // simple unique ID
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  // Check local storage, if no user exists, create one
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const newUserId = await registerTemporaryUser();
  
        if (!newUserId) {
          return;
        }
  
        const newUser = await getUserInfo(newUserId);
        setUser(newUser);
  
      } catch (error) {
        console.error("Failed to create user:", error);
        showToast("User cannot be created. Please clear cache!", "error");
      }
    };

    const localUser = localStorage.getItem("user");
    if (!user && !(localUser && JSON.parse(localUser)?.user_id)) {
      fetchUser();
    }
  }, []); // Run only once on component mount

  // Fetch sessions by user
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (!user) {
          return;
        }

        const result = await getSessionsByUser(user.user_id);
        setSessions(result || []);

        if (!!result) {
          localStorage.setItem("sessions", JSON.stringify(result));
        } else {
          localStorage.setItem("sessions", []);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };

    fetchSessions();
  }, [user]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Persist selectedSession
  useEffect(() => {
    if (selectedSession) {
      localStorage.setItem("selectedSession", JSON.stringify(selectedSession));
    } else {
      localStorage.removeItem("selectedSession");
    }
  }, [selectedSession]);

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
