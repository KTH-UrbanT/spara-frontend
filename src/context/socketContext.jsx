import React, { createContext, useContext, useEffect, useState } from "react";
import socket, {
  sendMessage,
  listenForMessages,
  listenForAnswers,
  removeMessageListener,
} from "../services/socket";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Listen for incoming messages
    const handleMessageReceive = (message) => {
      console.log("Received message:", message); // Log the received message
    };

    const handleAnswerReceive = (answer) => {
      console.log("Received answer:", answer); // Log the received answer
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the "Loading..." message
        {
          id: 10001,
          source: "assistant",
          text: answer.content,
          time: new Date().toISOString(),
        },
      ]);
    };

    listenForMessages(handleMessageReceive); // Listen for "receive_message"
    listenForAnswers(handleAnswerReceive); // Listen for "answer_message"

    // Cleanup listeners
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      removeMessageListener(handleMessageReceive);
    };
  }, []);

  const handleSendMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: 10000,
        source: "user",
        text: message,
        time: new Date().toISOString(),
      },
      {
        id: 10001,
        source: "assistant",
        text: "Loading...",
        time: new Date().toISOString(),
      },
    ]);

    sendMessage(message);
  };

  return (
    <SocketContext.Provider
      value={{ messages, isConnected, handleSendMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
