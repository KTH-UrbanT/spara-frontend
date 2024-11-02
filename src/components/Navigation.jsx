import React from 'react';
import { useSocket } from '../context/socketContext';

const Navigation = () => {
  const { isConnected } = useSocket();

  return (
    <div className="navbar p-4 bg-gray-100 shadow-md flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-1">SPARA</h2>
      <div className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
};

export default Navigation;
