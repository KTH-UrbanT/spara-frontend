import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/Chat";
import HomePage from "../pages/HomePage";
import Root from "./Root";
import SignupPage from "../pages/Signup";

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
        path: "signup", // Route for SignupPage
        element: <SignupPage />,
      },
    ],
  },
]);
