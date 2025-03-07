// pages/user.jsx
import React from 'react';

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <nav className="p-4 space-y-2">
            <a
              href="#"
              className="block px-4 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
            >
              Home
            </a>
            <a
              href="#"
              className="block px-4 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
            >
              Settings
            </a>
            <a
              href="#"
              className="block px-4 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
            >
              Logout
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold text-gray-800">Card 1</h2>
              <p className="text-gray-600 mt-2">Information for card 1.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold text-gray-800">Card 2</h2>
              <p className="text-gray-600 mt-2">Information for card 2.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold text-gray-800">Card 3</h2>
              <p className="text-gray-600 mt-2">Information for card 3.</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <ul className="mt-4 space-y-2">
              <li className="bg-white p-4 rounded shadow">User logged in</li>
              <li className="bg-white p-4 rounded shadow">Profile updated</li>
              <li className="bg-white p-4 rounded shadow">Password changed</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
