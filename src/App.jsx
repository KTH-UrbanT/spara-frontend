import "./App.css";

import { RouterProvider } from "react-router-dom";
import { SocketProvider } from "./context/socketContext";
import { AuthProvider } from "./context/authContext";
import { router } from "./routes/router";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </AuthProvider>
  );
}


export default App;
