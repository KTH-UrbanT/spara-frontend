import React, { useState } from "react";
import Header from "../components/Header";
import Chat from "../components/chat/Chat";

const ChatPage = () => {
  // TODO: get session id, and pass it to the chat component
  const [session, getSession] = useState();

  return (
    <div className="flex h-screen w-full max-w-screen-md flex-col items-center">
      <Header title={"SPARA"} />
      <Chat session={session} />
    </div>
  );
};

export default ChatPage;
