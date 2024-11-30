import React from 'react';
import { useSocket } from '../context/socketContext';
import Dialogue from '../components/chat/Dialogue';
import SendPanel from '../components/chat/SendPanel';
import Header from '../components/Header';
// import Navigation from './Navigation';

const Chat = () => {
  const { messages } = useSocket();  // Access messages and connection status from context

  // const messages = [
  //   { id: 1, source: "user", text: "What is your message", time: "2024-11-19T13:15:30.000Z" },
  //   { id: 2, source: "bot", text: "This is my message", time: "2024-11-19T13:16:30.000Z" },
  // ]

  return (
    <div className="flex h-screen w-full max-w-screen-md flex-col items-center">
      {/* <Navigation /> */}
      {/* TODO: Add header component for pages */}
      <Header title={"SPARA"} />
      <Dialogue messages={messages} />
      <SendPanel />
    </div>
  );
};

export default Chat;
