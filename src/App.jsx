import { useState } from "react";
import "./App.css";

import Chat from "./components/Chat";

function App() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-300 h-[calc(100dvh)] w-screen flex flex-col items-center">
      <Chat />
    </div>
  );
}

export default App;
