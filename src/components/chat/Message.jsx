import React from "react";
import ReactMarkdown from "react-markdown";
import RatePanel from './RatePanel';

function Message({ children, position, time }) {
  return (
    <div className={`chat ${position}`}>
      <div>
      <div className="chat-header">
        <time className="text-xs text-slate-400">{time}</time>
      </div>
      <div>
        <ReactMarkdown>{children}</ReactMarkdown>
      </div>
        {position == "chat-start" && <RatePanel message = {children}/>}
      </div>
      </div>
  );
}

export default Message;
