import React, { createContext, useContext, useEffect, useState } from 'react';
import socket, { sendMessage, listenForMessages, removeMessageListener } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Listen for incoming messages
    const handleMessageReceive = (message) => {
      console.log("Received message:", message);  // Log the received message
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    listenForMessages(handleMessageReceive); // Listen for "receive_message"

    // Cleanup listeners
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      removeMessageListener(handleMessageReceive);
    };
  }, []);

  const handleSendMessage = (message) => {
    sendMessage(message);
  };

  return (
    <SocketContext.Provider value={{ messages, isConnected, handleSendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
