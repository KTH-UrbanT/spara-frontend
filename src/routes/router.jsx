import { createBrowserRouter, Link } from "react-router-dom";
import ChatPage from "../pages/Chat";
import HomePage from "../pages/HomePage";
import ShareGate from "../pages/ShareGate";
import Root from "./Root";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AboutPage from "../pages/AboutPage";

export const router = createBrowserRouter([
  {
    path: "/", // Root path
    element: <Root />, // Root component which holds Outlet
    errorElement: (
      <main className="p-6" role="alert">
        <h1 className="text-xl font-bold">Sidan kunde inte visas</h1>
        <p>Försök igen om en stund.</p>
        <Link className="link" to="/">Till startsidan</Link>
      </main>
    ),
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
        path: "about",
        element: <AboutPage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "*",
        element: (
          <section className="p-6">
            <h1 className="text-xl font-bold">Sidan finns inte</h1>
            <Link className="link" to="/">Till startsidan</Link>
          </section>
        )
      }
    ],
  },
]);
