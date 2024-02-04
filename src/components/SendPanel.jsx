import React, { useContext, useState } from "react";
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
    <form onSubmit={sendMessage} className="flex join w-full p-2">
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
        <svg
          transform="rotate(90)"
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m12 18-7 3 7-18 7 18-7-3Zm0 0v-5"
          />
        </svg>
      </button>
    </form>
  );
}

export default SendPanel;
