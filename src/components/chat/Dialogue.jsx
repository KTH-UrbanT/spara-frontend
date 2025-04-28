import React, { useEffect, useRef } from "react";
import Message from "./Message";

const convertTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

const Dialogue = ({ messages, loadingStatus }) => {
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
          className="dialogue h-full w-full max-w-xl p-2 overflow-y-auto"
        >
          {messages.map((message, index) => (
            <Message
              key={index}
              position={
                message.role === "assistant" ? "chat-start" : "chat-end"
              }
              time={convertTimestamp(message.timestamp)}
            >
              {message.content}
            </Message>
          ))}
          {loadingStatus && loadingStatus.loading ? (
            <Message position="chat-start" time={null}>
              <span className="loading loading-dots loading-sm"></span>
            </Message>
          ) : null}
        </div>
      ) : (
        <div
          ref={scrollRef} // Reference for scrolling
          className="flex-grow align-center content-center"
        >
          <div className="text-center">
            <div>
              <p className="text-l dark:text-slate-300">No messages yet.</p>
              <p className="text-xl dark:text-slate-300">
                Start the conversation!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dialogue;
