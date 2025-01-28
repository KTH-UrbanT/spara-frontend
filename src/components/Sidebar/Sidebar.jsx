import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HiMenu } from "react-icons/hi"; // Icons for collapse/expand

import Button from "../Button";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative">
      {/* Collapsed state: only show the HiMenu icon */}
      {isCollapsed && (
        <div className="fixed left-4 top-4 z-50">
          <Button
            icon={<HiMenu size={18} />}
            color={"btn-neutral"}
            size={"btn-sm"}
            onClick={toggleSidebar}
          />
        </div>
      )}

      {/* Expanded sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 transform bg-gray-800 text-white transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          <span className="text-2xl font-bold">Spara</span>
          <Button
            icon={<HiMenu size={18} />}
            color={"btn-neutral"}
            size={"btn-sm"}
            onClick={toggleSidebar}
          />
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-grow">
          <ul className="menu">
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li className="menu-title text-slate-500">Sessions</li>
            <li>
              <NavLink to="/chat">Chat</NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 text-center">
          <span>Logout</span>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
