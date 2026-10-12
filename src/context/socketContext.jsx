import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { router } from "../routes/router";
import socket, {
  sendMessage,
  createNewSession,
  establishSession,
  listenForMessages,
  listenForAnswers,
  listenForProcessingStatus,
  listenForSessionUpdates,
  listenForErrors,
  removeMessageListener,
  removeAnswerListener,
  removeProcessingStatusListener,
  removeSessionUpdatedListener,
  removeErrorListener,
} from "../services/socket";
import { getMessagesBySession, localizeServiceError } from "../services/api";
import { useAuth } from "./authContext";

const SocketContext = createContext();

const PROCESSING_STATUS_MESSAGES = {
  queued: "Sending your question to SPARA…",
  processing: "Reading your question…",
  resolving: "Looking for the housing association or building…",
  retrieving: "Retrieving building data and reference material…",
  composing: "Preparing the response…",
  working: "Still working on the response…",
  done: "",
};

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
  const sessionMessages = useRef(new Map());
  const createdSessions = useRef(new Map());
  const firstMessagePending = useRef(false);

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
          message: PROCESSING_STATUS_MESSAGES[statusPayload?.status] ?? "Working on your question…",
        },
      };
    });
  };

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const selectedSessionInt =
    sessionList.find((session) => session.session_token === selectedSession)?.session_id ??
    createdSessions.current.get(selectedSession)?.session_id_int ??
    null;

  useEffect(() => {
    sessionMessages.current.clear();
    createdSessions.current.clear();
    // Capture updates even while a newly created chat is being selected.
    const cacheSessionUpdate = (session) => {
      if (session?.session_id && Array.isArray(session.messages)) {
        sessionMessages.current.set(session.session_id, session.messages);
      }
    };
    listenForSessionUpdates(cacheSessionUpdate);
    return () => removeSessionUpdatedListener(cacheSessionUpdate);
  }, [user?.user_id]);

  useEffect(() => {
    if (selectedSession !== null) {
      if (!user?.user_id || !user?.email || !selectedSessionInt) {
        return undefined;
      }

      console.log(
        `Connecting to socket for chat: ${selectedSession}`,
      );
      let cancelled = false;
      let receivedLiveUpdate = false;
      const initialMessages = sessionMessages.current.get(selectedSession) || [];
      setMessages(initialMessages);
      if (initialMessages.at(-1)?.role === "assistant") {
        setSessionIsLoading(selectedSession, false);
      }

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

        receivedLiveUpdate = true;

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
        if (answer?.session_id && answer.session_id !== selectedSession) return;
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
        if (payload?.session_id && payload.session_id !== selectedSession) return;
        const detail = payload?.error || payload?.message;
        console.error("Socket error:", payload);
        setSessionIsLoading(selectedSession, false);
        showToast(localizeServiceError(detail, "SPARA could not process the message. Please try again."), "error");
      };

      getMessagesBySession(selectedSessionInt)
        .then((savedMessages) => {
          if (!cancelled && !receivedLiveUpdate) {
            setMessages((currentMessages) => {
              if (!Array.isArray(savedMessages) || savedMessages.length < currentMessages.length) {
                return currentMessages;
              }
              return mergeMessagesWithExistingRatings(currentMessages, savedMessages);
            });
            if (savedMessages?.at(-1)?.role === "assistant") {
              setSessionIsLoading(selectedSession, false);
            }
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

  const handleSendFirstMessage = async (message, identityUser = user) => {
    if (!identityUser?.user_id || !identityUser?.email) {
      showToast("Enter your email address to start a conversation.", "error");
      return false;
    }
    if (firstMessagePending.current) return false;
    firstMessagePending.current = true;
    try {
      socket.auth = {
        session_id: null,
        user_id: identityUser.user_id,
        email: identityUser.email,
        session_id_int: null,
      };
      const session = await createNewSession(message, identityUser.user_id, identityUser.email);
      createdSessions.current.set(session.session_id, session);
      if (!sessionMessages.current.has(session.session_id)) {
        sessionMessages.current.set(session.session_id, session.messages || []);
      }
      const createdRecord = {
        session_token: session.session_id,
        session_id: session.session_id_int,
        user_id: identityUser.user_id,
        is_active: true,
        last_accessed: new Date().toISOString(),
      };
      setSessions((currentSessions) => [
        createdRecord,
        ...(Array.isArray(currentSessions) ? currentSessions : []).filter(
          (existing) => existing.session_token !== session.session_id
        ),
      ]);
      localStorage.setItem("session_id_int", JSON.stringify(session.session_id_int));
      setSessionIsLoading(
        session.session_id,
        sessionMessages.current.get(session.session_id)?.at(-1)?.role !== "assistant"
      );
      setSelectedSession(session.session_id);
      router.navigate(`/chat/${encodeURIComponent(session.session_id)}`);
      return true;
    } catch (error) {
      console.error("Failed to start chat:", error);
      showToast(localizeServiceError(error.message, "Could not create the conversation. Please try again."), "error");
      return false;
    } finally {
      firstMessagePending.current = false;
    }
  };


  const handleSendMessage = (message) => {
    try {
      if (!selectedSessionInt) {
        showToast("The conversation is still loading. Please try again shortly.", "error");
        return false;
      }

      if (!user?.email) {
        showToast("Enter your email address to send a message.", "error");
        return false;
      }

      setSessionIsLoading(selectedSession, true);
      const sent = sendMessage(message, selectedSession, selectedSessionInt);
      if (!sent) {
        setSessionIsLoading(selectedSession, false);
        showToast("Could not send the message. Please try again.", "error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Could not send the message!", "error");
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
