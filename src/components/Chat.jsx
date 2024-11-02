import React from 'react';
import { useSocket } from '../context/socketContext';
import Dialogue from './chat/Dialogue';
import SendPanel from './SendPanel';
import Navigation from './Navigation';

const Chat = () => {
  const { messages } = useSocket();  // Access messages and connection status from context

  return (
    <div className="chat-container max-w-md mx-auto mt-10 p-4 bg-gray-100 rounded-lg shadow-md">
      <Navigation />  {/* Render the Navigation component */}
      <Dialogue messages={messages}/>
      <SendPanel />  {/* Render the SendPanel component for input */}
    </div>
  );
};

export default Chat;
