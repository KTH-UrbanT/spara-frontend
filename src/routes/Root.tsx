import React, {useState} from 'react';

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar'; // Make sure the path is correct

const Root = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="h-full w-screen flex flex-ro bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <main 
      className={`flex-grow p-2 bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'sm:ml-16 ml-0' : 'sm:ml-64 ml-0'
      }`}
      >
        <Outlet /> {/* This will render the component for the current route */}
      </main>
    </div>
  );
};

export default Root;