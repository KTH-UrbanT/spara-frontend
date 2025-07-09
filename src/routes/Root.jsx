import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useWindowSize } from "../hooks/useWindowSize";
import SettingsModal from "../components/modal/SettingsModal";
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

  return (
    <div
      className="w-screen flex flex-row bg-gray-100 dark:bg-gray-900 night:bg-gray-800"
      style={{ height: windowHeight }}
    >

      {/* Sidebar */}
      <Sideabar
        isCollapsed={sidebarState}
        setIsCollapsed={setSidebarState}
      />

      {/* Modals */}
      <SettingsModal />

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