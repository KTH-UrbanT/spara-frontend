import React from 'react';

function Message({ children, position }) {
  return (
    <div className={`chat ${position}`}>
      <div className="chat-bubble">{children}</div>
    </div>
  );
}

export default Message;
