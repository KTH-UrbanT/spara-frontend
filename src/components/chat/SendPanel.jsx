import React, { useState } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';
import { useSocket } from '../../context/socketContext';
import Button from '../Button';

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
    <form onSubmit={onSend} className="send-panel flex my-4 w-full max-w-md">
      {/* <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow me-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
      /> */}
      <textarea 
        className="textarea flex-grow h-0 me-2 border border-gray-300 bg-white focus:outline-none focus:ring focus:ring-indigo-200" 
        placeholder="Type a message..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>
      <Button
        icon={<HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />}
        onClick={() => console.log('SUBMIT')}
      />
    </form>
  );
};

export default SendPanel;
