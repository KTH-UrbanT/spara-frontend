import React, { createContext } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:2345");
const SocketContext = createContext(socket);

socket.on("connect", () => console.log("connected to socket"));

const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
export { SocketContext, SocketProvider };
