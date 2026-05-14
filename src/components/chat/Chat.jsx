import React from "react";
import { useSocket } from "../../context/socketContext";
import { useAuth } from "../../context/authContext";
import Dialogue from "./Dialogue";
import SendPanel from "./SendPanel";

const Chat = () => {
  const { messages } = useSocket();
  const { selectedSession, sessionLoadingStatus } = useAuth();

  return (
    <>
      <Dialogue
        messages={messages}
        loadingStatus={sessionLoadingStatus?.[selectedSession]}
      />
      <SendPanel />
    </>
  );
};

export default Chat;
