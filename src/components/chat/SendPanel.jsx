import React, { useEffect, useState } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { useSocket } from "../../context/socketContext";
import Button from "../Button";

const SendPanel = () => {
  const { handleSendMessage } = useSocket(); // Access the send message function from context
  const [message, setMessage] = useState("");

  const onSend = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (message.trim()) {
      // Check if the message is not empty
      handleSendMessage(message); // Send the message through the context function
      setMessage(""); // Clear the input after sending

      // Reset the height of the textarea
      const textarea = document.querySelector("#chatTextarea");
      if (textarea) {
        textarea.style.height = "3rem"; // Equivalent to h-12 in Tailwind
      }
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

  return (
    <form
      onSubmit={onSend}
      className="send-panel flex my-4 w-full max-w-md items-center"
    >
      {/* <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow me-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
      /> */}
      {/* <textarea 
        className="textarea flex-grow h-0 me-2 border border-gray-300 bg-white focus:outline-none focus:ring focus:ring-indigo-200" 
        placeholder="Type a message..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea> */}
      <textarea
        id="chatTextarea"
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
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
