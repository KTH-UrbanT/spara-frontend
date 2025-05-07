import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/Chat";
import HomePage from "../pages/HomePage";
import ShareGate from "../pages/ShareGate";
import Root from "./Root";

export const router = createBrowserRouter([
  {
    path: "/", // Root path
    element: <Root />, // Root component which holds Outlet
    children: [
      {
        path: "", // Route for HomePage
        element: <HomePage />,
      },
      {
        path: "chat/:chatId", // Route for ChatPages
        element: <ChatPage />,
      },
      { 
        path: "share",
        element: <ShareGate /> 
      },
    ],
  },
]);
