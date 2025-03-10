import React from 'react';

const DashboardSidebar = ({ onSectionChange, toggleSidebar }) => {
  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      {/* Close button for mobile */}
      {toggleSidebar && (
        <div className="mb-4 flex justify-end md:hidden">
          <button onClick={toggleSidebar} className="text-gray-700 hover:text-gray-900">
            &times;
          </button>
        </div>
      )}

      <nav className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Dashboard</h3>
          <ul>
            <li>
              <button
                onClick={() => onSectionChange('overview')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => onSectionChange('transaction')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Transaction
              </button>
            </li>
            <li>
              <button
                onClick={() => onSectionChange('residentialManagement')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Residential Management
              </button>
            </li>
            <li>
              <button
                onClick={() => onSectionChange('requestPayment')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Request Payment
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700">Settings</h3>
          <ul>
            <li>
              <button
                onClick={() => onSectionChange('myAccount')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                My Account
              </button>
            </li>
            <li>
              <button
                onClick={() => onSectionChange('notifications')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Notification
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700">Support</h3>
          <ul>
            <li>
              <button
                onClick={() => onSectionChange('helpCenter')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Help Center (FAQs)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSectionChange('contactSupport')}
                className="w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
              >
                Contact Support
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <div className="flex items-center space-x-4">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-gray-600">Hi, User</span>
          </div>
          <button
            onClick={() => {}}
            className="mt-4 w-full text-left py-2 px-4 text-gray-700 rounded hover:bg-blue-100"
          >
            Log Out
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
