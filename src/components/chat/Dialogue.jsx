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
    <>
      {!!messages && messages.length > 0 ? (
        <div
          ref={scrollRef} // Reference for scrolling
          className="dialogue h-full w-full max-w-md p-2 overflow-y-auto"
        >
          {messages.map((message, index) => (
            <Message
              key={index}
              position={message.source === "bot" ? "chat-start" : "chat-end"}
              time={((new Date(message.time))).toLocaleString('en-GB', { timeZone: 'UTC' })}
            >
              {message.text}
            </Message>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef} // Reference for scrolling
          className="flex-grow align-center content-center"
        >
          <div className='text-center'>
            <div>
              <p className="text-l dark:text-slate-300">No messages yet.</p>
              <p className="text-xl dark:text-slate-300">Start the conversation!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dialogue;
