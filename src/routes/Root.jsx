import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useAuth } from "../context/authContext";

const Root = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { setSelectedSession } = useAuth();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    console.log("IN ROOT", location, params);
    if (params.chatId) {
      setSelectedSession(parseInt(params.chatId));
    } else {
      setSelectedSession(null);
    }
  }, [location, params]);

  return (
    <div className="h-full w-screen flex flex-ro bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <main
        className={`flex-grow p-2 bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out ${
          isCollapsed ? "sm:ml-16 ml-0" : "sm:ml-64 ml-0"
        }`}
      >
        <Outlet /> {/* This will render the component for the current route */}
      </main>
    </div>
  );
};

export default Root;
