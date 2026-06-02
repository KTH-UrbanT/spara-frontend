import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "../routes/router";
import socket, {
  sendMessage,
  createNewSession,
  establishSession,
  listenForMessages,
  listenForAnswers,
  listenForProcessingStatus,
  listenForSessionUpdates,
  listenForSessionCreated,
  listenForErrors,
  removeMessageListener,
  removeAnswerListener,
  removeProcessingStatusListener,
  removeSessionUpdatedListener,
  removeSessionCreatedListener,
  removeErrorListener,
} from "../services/socket";
import { getMessagesBySession, getSessionsByUser } from "../services/api";
import { useAuth } from "./authContext";

const SocketContext = createContext();

const fallbackMessageKey = (message) =>
  [
    message?.role || "",
    message?.timestamp ?? message?.sent_at ?? "",
    message?.content || "",
  ].join("|");

const mergeMessagesWithExistingRatings = (currentMessages, incomingMessages) => {
  const currentList = Array.isArray(currentMessages) ? currentMessages : [];
  const incomingList = Array.isArray(incomingMessages) ? incomingMessages : [];
  const currentById = new Map();
  const currentByFallback = new Map();

  currentList.forEach((message) => {
    if (message?.message_id != null) {
      currentById.set(message.message_id, message);
    }
    currentByFallback.set(fallbackMessageKey(message), message);
  });

  return incomingList.map((message) => {
    if (message?.rating != null || message?.rating_id != null) {
      return message;
    }

    const existing =
      (message?.message_id != null ? currentById.get(message.message_id) : null) ||
      currentByFallback.get(fallbackMessageKey(message));

    if (!existing || (existing.rating == null && existing.rating_id == null)) {
      return message;
    }

    return {
      ...message,
      rating: existing.rating ?? message.rating ?? null,
      rating_id: existing.rating_id ?? message.rating_id ?? null,
      version: message.version ?? existing.version,
    };
  });
};

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

  const setSessionProcessingStatus = (sessionId, statusPayload) => {
    if (!sessionId) {
      return;
    }

    setSessionLoadingStatus((currentStatus) => {
      const previous = currentStatus?.[sessionId] || {};
      const nextLoading = statusPayload?.status === "done" ? false : true;
      return {
        ...(currentStatus || {}),
        [sessionId]: {
          ...previous,
          loading: nextLoading,
          status: statusPayload?.status || previous.status,
          message: statusPayload?.message || "",
        },
      };
    });
  };

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const selectedSessionInt =
    sessionList.find((session) => session.session_token === selectedSession)?.session_id ??
    null;

  useEffect(() => {
    if (selectedSession !== null) {
      if (!user?.user_id || !user?.email || !selectedSessionInt) {
        return undefined;
      }

      console.log(
        `Connecting to socket for chat: ${selectedSession}`,
      );
      let cancelled = false;
      setMessages([]);

      // Update session ID and connect
      const chatAuth = {
        session_id: selectedSession,
        user_id: user?.user_id,
        email: user?.email,
        session_id_int: selectedSessionInt,
      };

      // Event listeners
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => {
        setIsConnected(false);
      };

      const handleSessionUpdate = (session) => {
        if (!session || session.session_id !== selectedSession) {
          return;
        }

        setMessages((currentMessages) =>
          mergeMessagesWithExistingRatings(currentMessages, session.messages)
        );

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

      const handleProcessingStatus = (statusPayload) => {
        if (!statusPayload || statusPayload.session_id !== selectedSession) {
          return;
        }

        setSessionProcessingStatus(selectedSession, statusPayload);
      };
      const handleErrorMessage = (payload) => {
        const detail = payload?.error || payload?.message || "SPARA could not process that message.";
        console.error("Socket error:", payload);
        setSessionIsLoading(selectedSession, false);
        showToast(detail, "error");
      };

      getMessagesBySession(selectedSessionInt)
        .then((savedMessages) => {
          if (!cancelled) {
            setMessages(savedMessages);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            console.error("Failed to preload saved messages:", error);
          }
        });

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      listenForSessionUpdates(handleSessionUpdate);
      listenForMessages(handleMessageReceive);
      listenForAnswers(handleAnswerReceive);
      listenForProcessingStatus(handleProcessingStatus);
      listenForErrors(handleErrorMessage);

      socket.auth = chatAuth;
      socket.connect();

      establishSession(
        chatAuth.session_id,
        chatAuth.session_id_int,
        chatAuth.user_id,
        chatAuth.email
      );

      return () => {
        cancelled = true;
        console.log(
          `Disconnecting from chat: ${selectedSession}`,
        );
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        removeMessageListener(handleMessageReceive);
        removeAnswerListener(handleAnswerReceive);
        removeProcessingStatusListener(handleProcessingStatus);
        removeSessionUpdatedListener(handleSessionUpdate);
        removeErrorListener(handleErrorMessage);
      };
    }

    setMessages([]);
    return undefined;
  }, [selectedSession, selectedSessionInt, user?.user_id, user?.email]);

  const updateMessageRating = (
    targetMessage,
    rating,
    ratingId = null,
    messageId = null
  ) => {
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
          message_id: messageId ?? message?.message_id ?? null,
          rating,
          rating_id: ratingId ?? message?.rating_id ?? null,
        };
      })
    );
  };

  const handleSendFirstMessage = (message, identityUser = user) => {
    if (!identityUser?.user_id || !identityUser?.email) {
      showToast("Email is required to start a chat.", "error");
      return false;
    }

    const handleSessionCreated = async (session) => {
      try {
        const result = await getSessionsByUser(identityUser.user_id);
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
        const sent = sendMessage(message, session.session_id, session.session_id_int);
        if (!sent) {
          throw new Error("The new chat session was created, but the message could not be sent.");
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        showToast("Failed to send message!", "error");
        setSessionIsLoading(session.session_id, false);

      }
    };
    listenForSessionCreated(handleSessionCreated);

    socket.auth = {
      session_id: null,
      user_id: identityUser.user_id,
      email: identityUser.email,
      session_id_int: null,
    };
    socket.connect();
    console.log("Temporary socket connected for new session creation.");

    const queued = createNewSession(message, identityUser.user_id, identityUser.email);
    if (!queued) {
      removeSessionCreatedListener(handleSessionCreated);
      showToast("Failed to create chat session.", "error");
      return false;
    }
    return true;
  }


  const handleSendMessage = (message) => {
    try {
      if (!selectedSessionInt) {
        showToast("The chat session is still loading. Please try again in a moment.", "error");
        return false;
      }

      if (!user?.email) {
        showToast("Email is required to send a message.", "error");
        return false;
      }

      setSessionIsLoading(selectedSession, true);
      const sent = sendMessage(message, selectedSession, selectedSessionInt);
      if (!sent) {
        setSessionIsLoading(selectedSession, false);
        showToast("Failed to send message. Please retry.", "error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to send message!", "error");
      setSessionIsLoading(selectedSession, false);
      return false;
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
