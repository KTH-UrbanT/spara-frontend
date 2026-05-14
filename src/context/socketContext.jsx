import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "../routes/router";
import socket, {
  sendMessage,
  createNewSession,
  establishSession,
  listenForMessages,
  listenForAnswers,
  listenForSessionUpdates,
  listenForSessionCreated,
  removeMessageListener,
  removeAnswerListener,
  removeSessionUpdatedListener,
  removeSessionCreatedListener,
} from "../services/socket";
import { getSessionsByUser } from "../services/api";
import { useAuth } from "./authContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const {
    selectedSession,
    setSelectedSession,
    sessions,
    setSessions,
    user,
    showToast,
    setSessionLoadingStatus,
  } = useAuth();

  const setSessionIsLoading = (sessionId, loading) => {
    if (!sessionId) {
      return;
    }

    setSessionLoadingStatus((currentStatus) => ({
      ...(currentStatus || {}),
      [sessionId]: { loading },
    }));
  };

  useEffect(() => {
    if (selectedSession !== null) {
      console.log(
        `Connecting to socket for chat: ${selectedSession}`,
      );

      // Update session ID and connect
      const chatAuth = {
        session_id: selectedSession,
        user_id: user?.user_id,
        session_id_int: sessions?.find(
          (s) => s.session_token === selectedSession)?.session_id ?? null,
      };
      socket.auth = chatAuth;
      socket.connect();

      establishSession(
        chatAuth.session_id,
        chatAuth.session_id_int,
        chatAuth.user_id
      );

      // Event listeners
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => {
        setMessages([]);
        setIsConnected(false);
      };

      const handleSessionUpdate = (session) => {
        setMessages(Array.isArray(session?.messages) ? session.messages : []);

        const lastMessage = session.messages?.[session.messages.length - 1];
        if (lastMessage?.role === "assistant") {
          setSessionIsLoading(selectedSession, false);
        }
      };

      const handleMessageReceive = (message) => {
        console.log("Received message:", message);
        if (message?.role === "assistant") {
          setSessionIsLoading(selectedSession, false);
        }
      };

      const handleAnswerReceive = (answer) => {
        console.log("Received answer:", answer);
        setSessionIsLoading(selectedSession, false);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      listenForSessionUpdates(handleSessionUpdate);
      listenForMessages(handleMessageReceive);
      listenForAnswers(handleAnswerReceive);

      return () => {
        console.log(
          `Disconnecting from chat: ${selectedSession}`,
        );
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        removeMessageListener(handleMessageReceive);
        removeAnswerListener(handleAnswerReceive);
        removeSessionUpdatedListener(handleSessionUpdate);
        socket.disconnect();

        // Clear messages state when disconnecting
        setMessages([]);
      };
    }
  }, [selectedSession]);

  const updateMessageRating = (targetMessage, rating, ratingId = null) => {
    setMessages((currentMessages) =>
      currentMessages.map((message) => {
        const sameMessageId =
          targetMessage?.message_id != null &&
          message?.message_id === targetMessage.message_id;
        const sameFallbackIdentity =
          targetMessage?.message_id == null &&
          message?.role === targetMessage?.role &&
          message?.content === targetMessage?.content &&
          message?.timestamp === targetMessage?.timestamp;

        if (!sameMessageId && !sameFallbackIdentity) {
          return message;
        }

        return {
          ...message,
          rating,
          rating_id: ratingId ?? message?.rating_id ?? null,
        };
      })
    );
  };

  const handleSendFirstMessage = (message) => {
    const handleSessionCreated = async (session) => {
      try {
        const result = await getSessionsByUser(user.user_id);
        setSessions(result || []);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        showToast("Failed to get sessions of the user!", "error");
      }
      localStorage.setItem("session_id_int", JSON.stringify(session.session_id_int));

      removeSessionCreatedListener(handleSessionCreated);
      // socket.auth = {
      //   ...socket.auth,
      //   session_id: session.session_id,
      //   session_id_int: session.session_id_int
      // };

      router.navigate(`/chat/${session.session_id}`);
      setSelectedSession(session.session_id);

      // Send the first message after session creation
      try {
        setSessionIsLoading(session.session_id, true);
        sendMessage(message, session.session_id, session.session_id_int);
      } catch (error) {
        console.error("Failed to send message:", error);
        showToast("Failed to send message!", "error");
        setSessionIsLoading(session.session_id, false);

      }
    };
    listenForSessionCreated(handleSessionCreated);

    socket.auth = { session_id: null, user_id: user?.user_id, session_id_int: null };
    socket.connect();
    console.log("Temporary socket connected for new session creation.");

    createNewSession(message, user?.user_id);
    return;
  }


  const handleSendMessage = (message) => {
    try {
      setSessionIsLoading(selectedSession, true);
      sendMessage(message, selectedSession, sessions?.find(
        (s) => s.session_token === selectedSession,
      )?.session_id ?? null);
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to send message!", "error");
      setSessionIsLoading(selectedSession, false);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        messages,
        isConnected,
        handleSendMessage,
        selectedSession,
        handleSendFirstMessage,
        updateMessageRating,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
