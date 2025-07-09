import "./App.css";

import { RouterProvider } from "react-router-dom";
import { SocketProvider } from "./context/socketContext";
import { AuthProvider } from "./context/authContext";

import { router } from "./routes/router";
import { SettingsProvider } from "./context/settingsContext";

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}


export default App;