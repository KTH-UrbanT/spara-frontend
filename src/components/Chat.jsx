import react from "react";

import Navigation from "./Navigation";
import Dialogue from "./Dialogue";
import SendPanel from "./SendPanel";

function Chat() {
  return (
    <div className="flex flex-col items-center h-full max-w-screen-md w-full">
      <Navigation />
      <div className="divider m-0" />
      <Dialogue />
      <SendPanel />
    </div>
  );
}

export default Chat;
