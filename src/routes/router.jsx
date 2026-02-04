import { createBrowserRouter } from "react-router-dom";
import ChatPage from "../pages/Chat";
import HomePage from "../pages/HomePage";
import ShareGate from "../pages/ShareGate";
import Root from "./Root";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Demo from "../pages/Demo";
import DemoGeneratorAdmin from "../pages/DemoGeneratorAdmin";

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
      {
        path: "demo",
        element: <Demo />
      },
      {
        path: "demo-admin/generate/QL6OeOp4luNfDNOz9hdRwgiWBxwuuh", // random string to avoid public access
        element: <DemoGeneratorAdmin />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      }
    ],
  },
]);
