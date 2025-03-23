import React from "react";
import Header from "../components/Header";
import Chat from "../components/chat/Chat";

const ChatPage = () => {
  return (
    <div className="flex h-screen w-full max-w-screen-md flex-col items-center">
      <Header title={"SPARA"} />
      <Chat />
    </div>
  );
};

export default ChatPage;
