import React from 'react';
import RatePanel from './RatePanel';

function Message({ children, position, time }) {
  return (
    <div className={`chat ${position}`}>
      <div className="chat-header">
        <time className="text-xs text-slate-400">{time}</time>
      </div>
      <div className="chat-bubble">{children}</div>
      {position == "chat-start" && <RatePanel/>}
    </div>
  );
}

export default Message;
