import "./App.css";

import Chat from "./components/Chat";
import { SocketProvider } from "./context/socketContext";

function App() {
  return (
    <SocketProvider>
      <div className="bg-gradient-to-b from-gray-100 to-gray-300 dark:bg-gradient-to-b dark:from-gray-700 dark:to-gray-900 h-[calc(100dvh)] w-screen flex flex-col items-center">
          <Chat />
      </div>
    </SocketProvider>
  );
}

export default App;
