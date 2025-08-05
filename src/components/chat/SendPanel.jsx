import React, { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { useAuth } from "../../context/authContext";
import { useSocket } from "../../context/socketContext";
import Button from "../Button";

const SendPanel = () => {
  const { handleSendMessage, handleSendFirstMessage } = useSocket();
  const { selectedSession, showToast } = useAuth(); // Get the selected session from the context
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    // Check if the message is not empty
    if (message.trim()) {
      if (selectedSession === null) {
        handleSendFirstMessage(message); // Handle sending the first message when no session is selected
      } else {
        handleSendMessage(message); // Send the message in the current session
      }
      setMessage(""); // Clear the input after sending

      // Reset the height of the textarea
      const textarea = document.querySelector("#chatTextarea");
      if (textarea) {
        textarea.style.height = "3rem"; // Equivalent to h-12 in Tailwind
      }
    } else {
      showToast("Message cannot be empty!", "error");
    }
  };

  const handleInputChange = (e) => {
    const textarea = e.target;

    // Reset the height to auto to allow shrinkage
    // textarea.style.height = 'auto';

    // Set the height to the scrollHeight to auto-expand
    textarea.style.height = `${textarea.scrollHeight}px`;
    setMessage(textarea.value);
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Trigger send message on pressing “Enter” (unless Shift is held)
      e.preventDefault();
      sendMessage();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="send-panel flex my-4 w-full max-w-xl items-center"
    >
      <textarea
        id="chatTextarea"
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="textarea flex-grow h-12 max-h-40 me-2 p-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-300 resize-none overflow-auto"
      />
      <Button
        icon={<HiPaperAirplane style={{ transform: "rotate(90deg)" }} />}
        type="submit"
      />
    </form>
  );
};

export default SendPanel;
