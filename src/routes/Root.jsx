import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useWindowSize } from "../hooks/useWindowSize";
import Sideabar from "../components/Sidebar/Sidebar";

const Root = () => {
  const [sidebarState, setSidebarState] = useState(true);
  const {
    windowHeight
  } = useWindowSize();

  const { setSelectedSession } = useAuth();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    if (params.chatId) {
      setSelectedSession(decodeURIComponent(params.chatId));
    } else {
      setSelectedSession(null);
    }
  }, [location, params]);

  // Hide sidebar on /login or /register
  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/demo");

  useEffect(() => {
    if (hideSidebar) {
      setSidebarState(true); // Collapse sidebar when hiding
    }
  }, [hideSidebar]);

  return (
    <div
      className="w-screen flex flex-row bg-gray-100 dark:bg-gray-900 night:bg-gray-800"
      style={{ height: windowHeight }}
    >

      {/* Sidebar */}
      {!hideSidebar &&
        <Sideabar
          isCollapsed={sidebarState}
          setIsCollapsed={setSidebarState}
        />
      }

      {/* Main Content Area */}
      <main
        className={`flex-grow p-2 transition-all duration-300 ease-in-out
          ${sidebarState ? "sm:ml-0" : "sm:ml-64"}
        `}
      >
        <div className="flex flex-col h-full w-full p-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Root;