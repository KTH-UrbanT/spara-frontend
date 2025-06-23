import React, { createContext, useContext, useEffect, useState } from "react";
import socket, {
  sendMessage,
  listenForMessages,
  listenForAnswers,
  listenForSessionUpdates,
  removeMessageListener,
  removeSessionUpdateListener,
} from "../services/socket";
import { useAuth } from "./authContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const {
    selectedSession,
    sessions,
    user,
    sessionLoadingStatus,
    setSessionLoadingStatus,
  } = useAuth();

  useEffect(() => {
    // const handleConnect = () => setIsConnected(true);
    // const handleDisconnect = () => setIsConnected(false);

    // socket.on("connect", handleConnect);
    // socket.on("disconnect", handleDisconnect);

    // // Listen for incoming messages
    // const handleMessageReceive = (message) => {
    //   console.log("Received message:", message); // Log the received message
    // };

    // const handleAnswerReceive = (answer) => {
    //   console.log("Received answer:", answer); // Log the received answer
    //   setMessages((prevMessages) => [
    //     ...prevMessages.slice(0, -1), // Remove the "Loading..." message
    //     {
    //       id: 10001,
    //       source: "assistant",
    //       text: answer.content,
    //       time: new Date().toISOString(),
    //     },
    //   ]);
    // };

    // listenForMessages(handleMessageReceive); // Listen for "receive_message"
    // listenForAnswers(handleAnswerReceive); // Listen for "answer_message"

    // // Cleanup listeners
    // return () => {
    //   socket.off("connect", handleConnect);
    //   socket.off("disconnect", handleDisconnect);
    //   removeMessageListener(handleMessageReceive);
    // };

    if (selectedSession) {
      const sessionToken = sessions?.find(
        (s) => s.session_id === selectedSession,
      )?.session_token;

      console.log(
        `Connecting to socket for chat: ${selectedSession} -> ${sessionToken}`,
      );

      // Update session ID and connect
      // socket.sid = !!sessionToken ? sessionToken : null;
      const chatAuth = {
        session_id: selectedSession === -1 ? null : selectedSession,
        user_id: user?.user_id,
        session_token: sessionToken,
      };
      socket.auth = chatAuth;
      socket.connect();

      // Event listeners
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => {
        setMessages([]);
        setIsConnected(false);
      };
      const handleSessionUpdate = (session) => {
        console.log("Session updated:", session);
        setMessages(session.messages);
      };

      const handleMessageReceive = (message) => {
        console.log("Received message:", message);
      };

      const handleAnswerReceive = (answer) => {
        setSessionLoadingStatus(true);
        console.log("Received answer:", answer);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      listenForSessionUpdates(handleSessionUpdate);
      listenForMessages(handleMessageReceive);
      listenForAnswers(handleAnswerReceive);

      return () => {
        console.log(
          `Disconnecting from chat: ${selectedSession} -> ${sessionToken}`,
        );
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        removeMessageListener(handleMessageReceive);
        removeSessionUpdateListener(handleSessionUpdate);
        socket.disconnect();
      };
    } else {
      console.log("No chat selected, disconnecting socket.");
      socket.disconnect();
    }
  }, [selectedSession]);

  const handleSendMessage = (message) => {
    try {
      const sessionToken = sessions?.find(
        (s) => s.session_id === selectedSession,
      )?.session_token;
      sendMessage(message, user?.user_id, selectedSession, sessionToken);
      setSessionLoadingStatus(true);
    } catch (error) {
      console.error("Failed to send message:", error);
      setSessionLoadingStatus(true);
    }
  };

  return (
    <SocketContext.Provider
      value={{ messages, isConnected, handleSendMessage, selectedSession }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
