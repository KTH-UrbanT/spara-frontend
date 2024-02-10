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
    <div className="flex flex-col-reverse h-full w-full px-4 overflow-y-auto md:text-sm">
      <Message position="chat-start">
        It's over Anakin, <br />I have the high ground.
      </Message>
      <Message position="chat-end">You underestimate my power!</Message>
      <Message position="chat-start">
        It's over Anakin, <br />I have the high ground.
      </Message>
      <Message position="chat-end">You underestimate my power!</Message>
      <Message position=" chat-start">
        It's over Anakin, <br />I have the high ground.
      </Message>
      <Message position="chat chat-end">You underestimate my power!</Message>
      <div>{chat}</div>
    </div>
  );
}

export default Dialogue;
