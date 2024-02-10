import React, { useContext, useState, useEffect } from "react";
import { SocketContext } from "../../context/socket";
import Message from "./Message";

function Dialogue() {
  const socket = useContext(SocketContext);

  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (msg) => {
      setChat([...chat, msg]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("message");
    };
  }, [chat]);

  return (
    // That is a scroller container
    <div className="flex flex-col-reverse h-full w-full px-4 overflow-y-auto md:text-sm">
      {/* That is a container for the messages */}
      <div>
        {chat.map((message, index) => (
          <Message
            key={index}
            position={index % 2 === 0 ? "chat-start" : "chat-end"}
          >
            {message}
          </Message>
        ))}
      </div>
    </div>
  );
}

export default Dialogue;
