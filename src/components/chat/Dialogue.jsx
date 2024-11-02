import React, { useEffect, useRef } from 'react';
import Message from './Message';

const Dialogue = ({ messages }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef} // Reference for scrolling
      className="dialogue h-64 w-full max-w-md p-2 border border-gray-200 rounded bg-white overflow-y-auto"
    >
      {messages.length > 0 ? (
        messages.map((message, index) => (
          <Message
            key={index}
            position={index % 2 === 0 ? "chat-start" : "chat-end"}
          >
            {message}
          </Message>
        ))
      ) : (
        <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
      )}
    </div>
  );
}

export default Dialogue;
