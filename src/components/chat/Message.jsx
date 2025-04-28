import React from "react";
import ReactMarkdown from "react-markdown";

function Message({ children, position, time }) {
  return (
    <div className={`chat ${position}`}>
      <div className="chat-header">
        <time className="text-xs text-slate-400">{time}</time>
      </div>
      <div className="chat-bubble">
        <ReactMarkdown>{children}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Message;
