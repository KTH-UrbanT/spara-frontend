import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useAuth } from "../context/authContext";

const Root = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const { setSelectedSession } = useAuth();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (params.chatId) {
      setSelectedSession(parseInt(params.chatId));
    } else {
      setSelectedSession(null);
    }
  }, [location, params]);

  return (
    <div
      className="w-screen flex flex-row bg-gray-100 dark:bg-gray-900"
      style={{ height: windowHeight }}
    >
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <main
        className={`flex-grow p-2 bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out
          ${isCollapsed ? "sm:ml-0" : "sm:ml-64"}
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
