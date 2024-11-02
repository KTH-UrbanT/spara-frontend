import React, { useState } from 'react';
import { useSocket } from '../context/socketContext';

const SendPanel = () => {
  const { handleSendMessage } = useSocket(); // Access the send message function from context
  const [message, setMessage] = useState('');

  const onSend = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (message.trim()) { // Check if the message is not empty
      handleSendMessage(message); // Send the message through the context function
      setMessage(''); // Clear the input after sending
    }
  };

  return (
    <form onSubmit={onSend} className="send-panel flex mt-4">
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:ring-indigo-200"
      />
      <button
        type="submit" // Set button type to "submit" to trigger onSend on Enter
        className="bg-indigo-500 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-600"
      >
        Send
      </button>
    </form>
  );
};

export default SendPanel;
