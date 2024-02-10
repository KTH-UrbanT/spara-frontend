import React, { useContext, useState } from "react";
import { Icon } from "@iconify/react";
import { SocketContext } from "../context/socket";

function SendPanel() {
  const socket = useContext(SocketContext);

  const [message, setMessage] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", message); // Send message to server
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex join w-full px-4 py-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type here"
        className="input input-bordered w-full mr-2 px-2"
      />
      <button
        type="submit"
        className="btn btn-square bg-secondary dark:bg-primary"
      >
        <Icon
          className="text-white"
          icon="fluent:send-24-filled"
          width="2em"
          height="2em"
        />
      </button>
    </form>
  );
}

export default SendPanel;
