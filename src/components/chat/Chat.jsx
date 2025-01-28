import React from "react";
import { useSocket } from "../../context/socketContext";
import Dialogue from "./Dialogue";
import SendPanel from "./SendPanel";

const Chat = ({ session }) => {
  const { messages } = useSocket(); // Access messages and connection status from context

  console.log(session);
  // const messages = [
  //   { id: 1, source: "user", text: "What is your message", time: "2024-11-19T13:15:30.000Z" },
  //   { id: 2, source: "bot", text: "This is my message", time: "2024-11-19T13:16:30.000Z" },
  // ]

  return (
    <>
      <Dialogue messages={messages} />
      <SendPanel />
    </>
  );
};

export default Chat;
