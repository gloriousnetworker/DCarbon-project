import React from 'react';

const DashboardNavbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left side: hamburger icon (mobile) + title */}
        <div className="flex items-center">
          {/* Hamburger menu: visible only on mobile */}
          <button onClick={toggleSidebar} className="mr-4 md:hidden">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Residence User Dashboard</h1>
        </div>

        {/* Right side: user info */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, User!</span>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
