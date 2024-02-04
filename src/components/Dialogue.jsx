import React, { useContext, useState, useEffect } from "react";
import { SocketContext } from "../context/socket";

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
    <div className="flex flex-col-reverse h-full w-full px-2 overflow-y-auto md:text-sm">
      <div className="chat chat-start">
        <div className="chat-bubble">
          It's over Anakin, <br />I have the high ground.
        </div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble">You underestimate my power!</div>
      </div>
      <div className="chat chat-start">
        <div className="chat-bubble">
          It's over Anakin, <br />I have the high ground.
        </div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble">You underestimate my power!</div>
      </div>
      <div className="chat chat-start">
        <div className="chat-bubble">
          It's over Anakin, <br />I have the high ground.
        </div>
      </div>
      <div className="chat chat-end">
        <div className="chat-bubble">You underestimate my power!</div>
      </div>
      <div>{chat}</div>
    </div>
  );
}

export default Dialogue;
