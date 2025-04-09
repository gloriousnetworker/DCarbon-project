// src/components/dashboard/Transaction.jsx
import React from 'react';
import { FiLogOut } from 'react-icons/fi';

const Logout = () => {
  const handleLogout = () => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    // Optionally redirect or perform any other logout logic here:
    // window.location.href = '/login';
  };

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center rounded-lg">
      {/* Icon with green border */}
      <div className="flex items-center justify-center w-16 h-16 mb-6 border-2 border-[#039994] rounded-full">
        <FiLogOut className="text-[#039994]" size={28} />
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Do you wish to leave DCarbon?
      </h2>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs px-4">
        {/* "Not Yet" button */}
        <button
          className="w-full py-3 bg-[#039994] text-white text-center rounded-md 
                     hover:opacity-90 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-[#039994]"
        >
          Not Yet
        </button>

        {/* "Yes, I do" button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 border border-[#039994] text-[#039994] text-center rounded-md
                     hover:bg-[#039994] hover:text-white transition 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#039994]"
        >
          Yes, I do
        </button>
      </div>
    </div>
  );
};

export default Logout;
