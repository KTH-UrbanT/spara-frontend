import "./App.css";

import { RouterProvider } from 'react-router-dom';
import { SocketProvider } from "./context/socketContext";
import { router } from "./routes/router"

function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;
